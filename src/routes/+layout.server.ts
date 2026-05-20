import { ObjectId } from 'mongodb';
import { db } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	let homeName: string | null = null;
	if (locals.user?.homeId) {
		const home = await db
			.collection('homes')
			.findOne({ _id: new ObjectId(locals.user.homeId) }, { projection: { name: 1 } });
		if (home) homeName = home.name as string;
	}
	return {
		user: locals.user
			? {
					id: locals.user.id,
					email: locals.user.email,
					firstName: locals.user.firstName,
					lastName: locals.user.lastName,
					homeId: locals.user.homeId
				}
			: null,
		homeName
	};
};
