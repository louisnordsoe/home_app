import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

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

	const homeId = new ObjectId(locals.user.homeId);
	const today = new Date();
	const todayStr = toDateStr(today);

	const view = (url.searchParams.get('view') || 'weekly') as 'daily' | 'weekly' | 'monthly';
	const ref = url.searchParams.get('ref') || '';

	const fmt = (d: Date) =>
		`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

	let startDate: string;
	let endDate: string;
	let periodLabel: string;
	let prevRef: string;
	let nextRef: string;
	let isCurrentPeriod: boolean;

	if (view === 'daily') {
		const date = /^\d{4}-\d{2}-\d{2}$/.test(ref) ? ref : todayStr;
		startDate = date;
		endDate = date;
		const d = new Date(date + 'T00:00:00');
		periodLabel = d.toLocaleDateString('en-GB', {
			weekday: 'long',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
		const prev = new Date(d);
		prev.setDate(prev.getDate() - 1);
		const next = new Date(d);
		next.setDate(next.getDate() + 1);
		prevRef = toDateStr(prev);
		nextRef = toDateStr(next);
		isCurrentPeriod = date === todayStr;
	} else if (view === 'weekly') {
		const refDate = /^\d{4}-\d{2}-\d{2}$/.test(ref) ? new Date(ref + 'T00:00:00') : today;
		const monday = getMondayOf(refDate);
		const sunday = new Date(monday);
		sunday.setDate(sunday.getDate() + 6);
		startDate = toDateStr(monday);
		endDate = toDateStr(sunday);
		periodLabel = `Week ${getWeekNumber(monday)}. ${fmt(monday)} – ${fmt(sunday)}`;
		const prevMonday = new Date(monday);
		prevMonday.setDate(prevMonday.getDate() - 7);
		const nextMonday = new Date(monday);
		nextMonday.setDate(nextMonday.getDate() + 7);
		prevRef = toDateStr(prevMonday);
		nextRef = toDateStr(nextMonday);
		isCurrentPeriod = startDate === toDateStr(getMondayOf(today));
	} else {
		let year: number;
		let month: number;
		if (/^\d{4}-\d{2}$/.test(ref)) {
			year = parseInt(ref.slice(0, 4));
			month = parseInt(ref.slice(5, 7)) - 1;
		} else {
			year = today.getFullYear();
			month = today.getMonth();
		}
		startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
		const lastDay = new Date(year, month + 1, 0);
		endDate = toDateStr(lastDay);
		periodLabel = new Date(year, month).toLocaleDateString('en-GB', {
			month: 'long',
			year: 'numeric'
		});
		const pm = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
		const nm = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };
		prevRef = `${pm.y}-${String(pm.m + 1).padStart(2, '0')}`;
		nextRef = `${nm.y}-${String(nm.m + 1).padStart(2, '0')}`;
		isCurrentPeriod = year === today.getFullYear() && month === today.getMonth();
	}

	const raw = await db
		.collection('task_logs')
		.aggregate([
			{ $match: { homeId, date: { $gte: startDate, $lte: endDate } } },
			{
				$group: {
					_id: { userEmail: '$userEmail', taskTitle: '$taskTitle' },
					total: { $sum: '$count' }
				}
			},
			{ $sort: { '_id.userEmail': 1, total: -1 } }
		])
		.toArray();

	const byUser = new Map<string, { title: string; count: number }[]>();
	for (const row of raw) {
		const email = row._id.userEmail as string;
		if (!byUser.has(email)) byUser.set(email, []);
		byUser.get(email)!.push({ title: row._id.taskTitle as string, count: row.total as number });
	}

	const users = Array.from(byUser.entries())
		.map(([email, tasks]) => ({
			email,
			tasks,
			total: tasks.reduce((s, t) => s + t.count, 0)
		}))
		.sort((a, b) => b.total - a.total);

	return {
		view,
		periodLabel,
		prevRef,
		nextRef,
		isCurrentPeriod,
		users
	};
};
