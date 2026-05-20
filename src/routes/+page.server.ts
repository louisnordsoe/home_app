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

	const emails = [...new Set(recentActivity.map((log) => log.userEmail as string))];
	const userDocs =
		emails.length > 0
			? await db
					.collection('users')
					.find({ email: { $in: emails } }, { projection: { _id: 1, email: 1, firstName: 1, lastName: 1 } })
					.toArray()
			: [];
	const userByEmail = new Map(
		userDocs.map((u) => [
			u.email as string,
			{
				id: (u._id as ObjectId).toHexString(),
				firstName: (u.firstName as string) ?? '',
				lastName: (u.lastName as string) ?? ''
			}
		])
	);

	return {
		home: home
			? {
					name: home.name as string,
					inviteCode: home.inviteCode as string
				}
			: null,
		recentActivity: recentActivity.map((log) => {
			const userInfo = userByEmail.get(log.userEmail as string);
			return {
				taskTitle: log.taskTitle as string,
				userEmail: log.userEmail as string,
				userId: userInfo?.id ?? log.userEmail as string,
				userFirstName: userInfo?.firstName ?? log.userEmail as string,
				userLastName: userInfo?.lastName ?? '',
				count: log.count as number,
				date: log.date as string,
				loggedAt: (log.loggedAt as Date).toISOString()
			};
		})
	};
};
