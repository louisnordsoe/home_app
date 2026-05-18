import { randomBytes } from 'node:crypto';
import { fail, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { db } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

function toDateStr(d: Date): string {
	return d.toISOString().slice(0, 10);
}

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

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/login');
	if (!locals.user.homeId) redirect(302, '/setup');

	const today = new Date();
	const todayStr = toDateStr(today);

	const dateParam = url.searchParams.get('date');
	const selectedDate =
		dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayStr;

	const homeId = new ObjectId(locals.user.homeId);
	const selectedDay = new Date(selectedDate + 'T00:00:00');

	const taskDocs = await db
		.collection('tasks')
		.find({ homeId, date: selectedDate })
		.sort({ createdAt: 1 })
		.toArray();

	const prevDay = new Date(selectedDay);
	prevDay.setDate(prevDay.getDate() - 1);
	const nextDay = new Date(selectedDay);
	nextDay.setDate(nextDay.getDate() + 1);

	const members = await getHomeMembers(homeId);

	const dayName = selectedDay.toLocaleDateString('en-GB', { weekday: 'long' });
	const dateLabel = selectedDay.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});

	return {
		selectedDate,
		today: todayStr,
		isToday: selectedDate === todayStr,
		prevDate: toDateStr(prevDay),
		nextDate: toDateStr(nextDay),
		dayLabel: `${dayName}, ${dateLabel}`,
		members,
		tasks: taskDocs.map((t) => ({
			id: t._id.toString(),
			title: t.title as string,
			done: (t.done as boolean) ?? false,
			assignedTo: (t.assignedTo as string | null) ?? null,
			isRecurring: !!(t.recurringGroupId),
			recurringGroupId: (t.recurringGroupId as string | null) ?? null,
			hasCounter: (t.hasCounter as boolean) ?? false,
			counter: (t.counter as number) ?? 0
		}))
	};
};

export const actions: Actions = {
	addSingle: async ({ locals, request }) => {
		if (!locals.user?.homeId) redirect(302, '/login');

		const data = await request.formData();
		const title = ((data.get('title') as string) ?? '').trim();
		const date = data.get('date') as string;
		const assignedTo = (data.get('assignedTo') as string) || null;
		const hasCounter = data.get('hasCounter') === 'on';

		if (!title || !date) return fail(400, { error: 'Title and date required' });

		const homeId = new ObjectId(locals.user.homeId);
		await db.collection('tasks').insertOne({
			homeId,
			date,
			title,
			done: false,
			assignedTo,
			recurringGroupId: null,
			hasCounter,
			counter: 0,
			createdAt: new Date()
		});
		return { success: true };
	},

	addRecurring: async ({ locals, request }) => {
		if (!locals.user?.homeId) redirect(302, '/login');

		const data = await request.formData();
		const title = ((data.get('title') as string) ?? '').trim();
		const startDate = data.get('startDate') as string;
		const recurring = data.get('recurring') as 'daily' | 'weekly';
		const assignedTo = (data.get('assignedTo') as string) || null;
		const hasCounter = data.get('hasCounter') === 'on';

		if (!title || !startDate || !recurring) return fail(400, { error: 'Required fields missing' });

		const homeId = new ObjectId(locals.user.homeId);
		const recurringGroupId = randomBytes(8).toString('hex');
		const baseDate = new Date(startDate + 'T00:00:00');
		const count = recurring === 'daily' ? 365 : 52;
		const stepDays = recurring === 'daily' ? 1 : 7;

		const docs = Array.from({ length: count }, (_, i) => {
			const d = new Date(baseDate);
			d.setDate(d.getDate() + i * stepDays);
			return {
				homeId,
				date: toDateStr(d),
				title,
				done: false,
				assignedTo,
				recurringGroupId,
				hasCounter,
				counter: 0,
				createdAt: new Date()
			};
		});

		await db.collection('tasks').insertMany(docs);
		return { success: true };
	},

	toggle: async ({ locals, request }) => {
		if (!locals.user?.homeId) redirect(302, '/login');

		const data = await request.formData();
		const taskId = data.get('taskId') as string;
		const done = data.get('done') === 'true';
		const bumpCounter = data.get('bumpCounter') === 'true';
		const homeId = new ObjectId(locals.user.homeId);
		const tid = new ObjectId(taskId);

		const task = await db.collection('tasks').findOne({ _id: tid, homeId });
		if (!task) return fail(404, { error: 'Task not found' });

		const update: Record<string, unknown> = { done };
		if (done && bumpCounter) update.counter = 1;
		await db.collection('tasks').updateOne({ _id: tid, homeId }, { $set: update });

		if (done) {
			const logCount = bumpCounter ? 1 : ((task.hasCounter ? (task.counter as number) : null) ?? 1);
			await db.collection('task_logs').insertOne({
				homeId,
				taskId: tid,
				taskTitle: task.title as string,
				userEmail: locals.user.email,
				count: logCount,
				date: task.date as string,
				loggedAt: new Date()
			});
		} else {
			const counter = task.hasCounter ? (task.counter as number) : 0;
			if (counter > 0) {
				await db.collection('task_logs').updateOne(
					{ taskId: tid, date: task.date as string },
					{ $set: { count: counter } }
				);
			} else {
				await db.collection('task_logs').deleteOne({ taskId: tid, date: task.date as string });
			}
		}

		return { success: true };
	},

	updateCounter: async ({ locals, request }) => {
		if (!locals.user?.homeId) redirect(302, '/login');

		const data = await request.formData();
		const taskId = data.get('taskId') as string;
		const delta = parseInt(data.get('delta') as string);
		const homeId = new ObjectId(locals.user.homeId);
		const tid = new ObjectId(taskId);

		let updated;
		if (delta === 1) {
			updated = await db
				.collection('tasks')
				.findOneAndUpdate({ _id: tid, homeId }, { $inc: { counter: 1 } }, { returnDocument: 'after' });
		} else if (delta === -1) {
			updated = await db
				.collection('tasks')
				.findOneAndUpdate(
					{ _id: tid, homeId, counter: { $gt: 0 } },
					{ $inc: { counter: -1 } },
					{ returnDocument: 'after' }
				);
		}

		if (updated) {
			const newCounter = updated.counter as number;
			if (newCounter > 0) {
				await db.collection('task_logs').updateOne(
					{ taskId: tid, date: updated.date as string },
					{
						$set: {
							homeId,
							taskTitle: updated.title as string,
							userEmail: locals.user.email,
							count: newCounter,
							date: updated.date as string,
							loggedAt: new Date()
						}
					},
					{ upsert: true }
				);
			} else if (!updated.done) {
				await db.collection('task_logs').deleteOne({ taskId: tid, date: updated.date as string });
			}
		}

		return { success: true };
	},

	editTask: async ({ locals, request }) => {
		if (!locals.user?.homeId) redirect(302, '/login');

		const data = await request.formData();
		const taskId = data.get('taskId') as string;
		const title = ((data.get('title') as string) ?? '').trim();
		const assignedTo = (data.get('assignedTo') as string) || null;
		const hasCounter = data.get('hasCounter') === 'on';
		const homeId = new ObjectId(locals.user.homeId);

		if (!title) return fail(400, { error: 'Title required' });
		const updates: Record<string, unknown> = { title, assignedTo, hasCounter };
		if (!hasCounter) updates.counter = 0;
		await db
			.collection('tasks')
			.updateOne({ _id: new ObjectId(taskId), homeId }, { $set: updates });
		return { success: true };
	},

	deleteTask: async ({ locals, request }) => {
		if (!locals.user?.homeId) redirect(302, '/login');

		const data = await request.formData();
		const taskId = data.get('taskId') as string;
		const homeId = new ObjectId(locals.user.homeId);

		await db.collection('tasks').deleteOne({ _id: new ObjectId(taskId), homeId });
		return { success: true };
	},

	deleteAllRecurring: async ({ locals, request }) => {
		if (!locals.user?.homeId) redirect(302, '/login');

		const data = await request.formData();
		const recurringGroupId = data.get('recurringGroupId') as string;
		const homeId = new ObjectId(locals.user.homeId);

		await db.collection('tasks').deleteMany({ recurringGroupId, homeId });
		return { success: true };
	}
};
