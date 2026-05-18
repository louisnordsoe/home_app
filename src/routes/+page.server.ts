import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
	if (!locals.user.homeId) redirect(302, '/setup');

	const home = await db.collection('homes').findOne({ _id: new ObjectId(locals.user.homeId) });

	return {
		user: { email: locals.user.email },
		home: home
			? {
					name: home.name as string,
					inviteCode: home.inviteCode as string
				}
			: null
	};
};
