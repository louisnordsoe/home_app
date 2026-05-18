import { dev } from '$app/environment';
import { fail, redirect } from '@sveltejs/kit';
import { createSession } from '$lib/server/auth';
import { createUser, verifyUser } from '$lib/server/users';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, locals.user.homeId ? '/' : '/setup');
};

const cookieOpts = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: !dev,
	maxAge: 60 * 60 * 24 * 30
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.trim().toLowerCase();
		const password = data.get('password') as string;

		const result = await verifyUser(email, password);
		if (!result) return fail(400, { error: 'Invalid email or password' });

		const token = await createSession(result.userId);
		cookies.set('session', token, cookieOpts);

		redirect(302, result.homeId ? '/' : '/setup');
	},

	signup: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.trim().toLowerCase();
		const password = data.get('password') as string;

		if (!email || !password) return fail(400, { error: 'Email and password are required' });
		if (password.length < 8) return fail(400, { error: 'Password must be at least 8 characters' });

		try {
			const userId = await createUser(email, password);
			const token = await createSession(userId);
			cookies.set('session', token, cookieOpts);
		} catch (e) {
			return fail(400, { error: (e as Error).message });
		}

		redirect(302, '/setup');
	}
};
