import { fail, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { db } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

function getMondayOf(date: Date): Date {
	const d = new Date(date);
	const day = d.getDay();
	const diff = day === 0 ? -6 : 1 - day;
	d.setDate(d.getDate() + diff);
	d.setHours(0, 0, 0, 0);
	return d;
}

function toDateStr(d: Date): string {
	return d.toISOString().slice(0, 10);
}

function getWeekNumber(d: Date): number {
	const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	const dayNum = date.getUTCDay() || 7;
	date.setUTCDate(date.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
	return Math.ceil(((date.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7);
}

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, '/login');
	if (!locals.user.homeId) redirect(302, '/setup');

	const today = new Date();
	const currentMonday = getMondayOf(today);
	const todayStr = toDateStr(today);

	const weekParam = url.searchParams.get('week');
	let weekMonday: Date;
	if (weekParam) {
		const parsed = new Date(weekParam + 'T00:00:00');
		weekMonday = isNaN(parsed.getTime()) ? currentMonday : getMondayOf(parsed);
	} else {
		weekMonday = currentMonday;
	}

	const homeId = new ObjectId(locals.user.homeId);

	const days = Array.from({ length: 7 }, (_, i) => {
		const d = new Date(weekMonday);
		d.setDate(d.getDate() + i);
		return toDateStr(d);
	});

	const mealDocs = await db
		.collection('meal_plans')
		.find({ homeId, date: { $in: days } })
		.toArray();

	const mealByDate: Record<string, string> = {};
	for (const doc of mealDocs) {
		mealByDate[doc.date as string] = doc.meal as string;
	}

	const weekMondayStr = toDateStr(weekMonday);
	const currentMondayStr = toDateStr(currentMonday);
	const sunday = new Date(weekMonday);
	sunday.setDate(sunday.getDate() + 6);
	const isCurrentWeek = weekMondayStr === currentMondayStr;
	const weekNum = getWeekNumber(weekMonday);

	const fmt = (d: Date) =>
		`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

	const prevMonday = new Date(weekMonday);
	prevMonday.setDate(prevMonday.getDate() - 7);
	const nextMonday = new Date(weekMonday);
	nextMonday.setDate(nextMonday.getDate() + 7);

	const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	return {
		weekLabel: `${isCurrentWeek ? 'Current Week: ' : ''}Week ${weekNum}. ${fmt(weekMonday)} - ${fmt(sunday)}`,
		isCurrentWeek,
		prevWeek: toDateStr(prevMonday),
		nextWeek: toDateStr(nextMonday),
		today: todayStr,
		days: days.map((date, i) => ({
			date,
			name: dayNames[i],
			meal: mealByDate[date] ?? ''
		}))
	};
};

export const actions: Actions = {
	save: async ({ locals, request }) => {
		if (!locals.user) redirect(302, '/login');
		if (!locals.user.homeId) redirect(302, '/setup');

		const data = await request.formData();
		const date = data.get('date') as string;
		const meal = ((data.get('meal') as string) ?? '').trim();

		if (!date) return fail(400, { error: 'Date required' });

		const homeId = new ObjectId(locals.user.homeId);

		if (!meal) {
			await db.collection('meal_plans').deleteOne({ homeId, date });
		} else {
			await db
				.collection('meal_plans')
				.updateOne({ homeId, date }, { $set: { homeId, date, meal } }, { upsert: true });
		}

		return { success: true };
	}
};
