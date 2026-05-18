import { fail, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { db } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

async function getHomeMembers(homeId: ObjectId) {
	const home = await db
		.collection('homes')
		.findOne({ _id: homeId }, { projection: { memberIds: 1 } });
	if (!home?.memberIds?.length) return [];
	const users = await db
		.collection('users')
		.find({ _id: { $in: home.memberIds } }, { projection: { _id: 1, email: 1 } })
		.toArray();
	return users.map((u) => ({ id: u._id.toString(), email: u.email as string }));
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
	if (!locals.user.homeId) redirect(302, '/setup');

	const homeId = new ObjectId(locals.user.homeId);

	const todoDocs = await db
		.collection('todos')
		.find({ homeId })
		.sort({ done: 1, createdAt: 1 })
		.toArray();

	const members = await getHomeMembers(homeId);

	return {
		members,
		todos: todoDocs.map((t) => ({
			id: t._id.toString(),
			title: t.title as string,
			done: (t.done as boolean) ?? false,
			assignedTo: (t.assignedTo as string | null) ?? null
		}))
	};
};

export const actions: Actions = {
	add: async ({ locals, request }) => {
		if (!locals.user?.homeId) redirect(302, '/login');

		const data = await request.formData();
		const title = ((data.get('title') as string) ?? '').trim();
		const assignedTo = (data.get('assignedTo') as string) || null;

		if (!title) return fail(400, { error: 'Title required' });

		const homeId = new ObjectId(locals.user.homeId);
		await db.collection('todos').insertOne({
			homeId,
			title,
			done: false,
			assignedTo,
			createdAt: new Date()
		});
		return { success: true };
	},

	toggle: async ({ locals, request }) => {
		if (!locals.user?.homeId) redirect(302, '/login');

		const data = await request.formData();
		const todoId = data.get('todoId') as string;
		const done = data.get('done') === 'true';
		const homeId = new ObjectId(locals.user.homeId);
		const tid = new ObjectId(todoId);

		const todo = await db.collection('todos').findOne({ _id: tid, homeId });
		if (!todo) return fail(404, { error: 'Todo not found' });

		await db.collection('todos').updateOne({ _id: tid, homeId }, { $set: { done } });

		if (done) {
			const today = new Date().toISOString().slice(0, 10);
			await db.collection('task_logs').insertOne({
				homeId,
				todoId: tid,
				taskTitle: todo.title as string,
				userEmail: locals.user.email,
				count: 1,
				date: today,
				loggedAt: new Date()
			});
		} else {
			await db.collection('task_logs').deleteOne({ todoId: tid });
		}

		return { success: true };
	},

	edit: async ({ locals, request }) => {
		if (!locals.user?.homeId) redirect(302, '/login');

		const data = await request.formData();
		const todoId = data.get('todoId') as string;
		const title = ((data.get('title') as string) ?? '').trim();
		const assignedTo = (data.get('assignedTo') as string) || null;
		const homeId = new ObjectId(locals.user.homeId);

		if (!title) return fail(400, { error: 'Title required' });
		await db
			.collection('todos')
			.updateOne({ _id: new ObjectId(todoId), homeId }, { $set: { title, assignedTo } });
		return { success: true };
	},

	delete: async ({ locals, request }) => {
		if (!locals.user?.homeId) redirect(302, '/login');

		const data = await request.formData();
		const todoId = data.get('todoId') as string;
		const homeId = new ObjectId(locals.user.homeId);

		await db.collection('todos').deleteOne({ _id: new ObjectId(todoId), homeId });
		return { success: true };
	}
};
