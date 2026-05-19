import { randomBytes } from 'crypto';
import { fail, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { db } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
	if (locals.user.homeId) redirect(302, '/');
	return { email: locals.user.email };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		if (!name) return fail(400, { panel: 'create' as const, error: 'Home name is required' });

		const userId = new ObjectId(locals.user.id);
		const inviteCode = randomBytes(3).toString('hex').toUpperCase();

		const homeResult = await db.collection('homes').insertOne({
			name,
			inviteCode,
			ownerId: userId,
			memberIds: [userId],
			createdAt: new Date()
		});

		await db
			.collection('users')
			.updateOne({ _id: userId }, { $set: { homeId: homeResult.insertedId } });

		redirect(302, '/');
	},

	join: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');

		const data = await request.formData();
		const code = (data.get('code') as string)?.trim().toUpperCase();
		if (!code) return fail(400, { panel: 'join' as const, error: 'Invite code is required' });

		const home = await db.collection('homes').findOne({ inviteCode: code });
		if (!home) return fail(400, { panel: 'join' as const, error: 'No home found with that code' });

		const userId = new ObjectId(locals.user.id);

		await db.collection('homes').updateOne({ _id: home._id }, { $addToSet: { memberIds: userId } });
		await db.collection('users').updateOne({ _id: userId }, { $set: { homeId: home._id } });

		redirect(302, '/');
	}
};
