import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
	if (!locals.user.homeId) redirect(302, '/setup');

	const homeId = new ObjectId(locals.user.homeId);

	const [home, recentActivity] = await Promise.all([
		db.collection('homes').findOne({ _id: homeId }),
		db.collection('task_logs').find({ homeId }).sort({ loggedAt: -1 }).limit(20).toArray()
	]);

	return {
		user: { email: locals.user.email },
		home: home
			? {
					name: home.name as string,
					inviteCode: home.inviteCode as string
				}
			: null,
		recentActivity: recentActivity.map((log) => ({
			taskTitle: log.taskTitle as string,
			userEmail: log.userEmail as string,
			count: log.count as number,
			date: log.date as string,
			loggedAt: (log.loggedAt as Date).toISOString()
		}))
	};
};
