import { randomBytes } from 'crypto';
import { ObjectId } from 'mongodb';
import { db } from './db';

const SESSION_DAYS = 30;

export async function createSession(userId: ObjectId): Promise<string> {
	const token = randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
	await db.collection('sessions').insertOne({ token, userId, expiresAt });
	return token;
}

export async function getSessionUser(token: string) {
	const session = await db.collection('sessions').findOne({
		token,
		expiresAt: { $gt: new Date() }
	});
	if (!session) return null;

	const user = await db.collection('users').findOne({ _id: session.userId });
	if (!user) return null;

	return {
		id: (user._id as ObjectId).toHexString(),
		email: user.email as string,
		homeId: user.homeId ? (user.homeId as ObjectId).toHexString() : undefined
	};
}

export async function deleteSession(token: string): Promise<void> {
	await db.collection('sessions').deleteOne({ token });
}
