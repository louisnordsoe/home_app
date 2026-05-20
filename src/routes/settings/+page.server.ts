import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { db } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
	return {
		firstName: locals.user.firstName,
		lastName: locals.user.lastName,
		email: locals.user.email,
		hasHome: !!locals.user.homeId
	};
};

export const actions: Actions = {
	updateProfile: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const firstName = (data.get('firstName') as string)?.trim();
		const lastName = (data.get('lastName') as string)?.trim();

		if (!firstName || !lastName) return fail(400, { profileError: 'First and last name are required' });

		await db
			.collection('users')
			.updateOne({ _id: new ObjectId(locals.user.id) }, { $set: { firstName, lastName } });

		return { profileSuccess: true };
	},

	updatePassword: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const currentPassword = data.get('currentPassword') as string;
		const newPassword = data.get('newPassword') as string;

		if (!currentPassword || !newPassword)
			return fail(400, { passwordError: 'All fields are required' });
		if (newPassword.length < 8)
			return fail(400, { passwordError: 'New password must be at least 8 characters' });

		const user = await db.collection('users').findOne({ _id: new ObjectId(locals.user.id) });
		if (!user) return fail(400, { passwordError: 'User not found' });

		const valid = await bcrypt.compare(currentPassword, user.passwordHash as string);
		if (!valid) return fail(400, { passwordError: 'Current password is incorrect' });

		const passwordHash = await bcrypt.hash(newPassword, 12);
		await db
			.collection('users')
			.updateOne({ _id: new ObjectId(locals.user.id) }, { $set: { passwordHash } });

		return { passwordSuccess: true };
	},

	leaveHome: async ({ locals }) => {
		if (!locals.user?.homeId) redirect(302, '/setup');

		const userId = new ObjectId(locals.user.id);
		const homeId = new ObjectId(locals.user.homeId);

		await db.collection('users').updateOne({ _id: userId }, { $unset: { homeId: '' } });
		await db
			.collection('homes')
			.updateOne({ _id: homeId }, { $pull: { memberIds: userId } as never });

		const home = await db
			.collection('homes')
			.findOne({ _id: homeId }, { projection: { memberIds: 1 } });
		if (!home?.memberIds?.length) {
			await db.collection('homes').deleteOne({ _id: homeId });
		}

		redirect(302, '/setup');
	}
};
