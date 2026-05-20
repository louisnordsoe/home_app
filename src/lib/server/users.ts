import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { db } from './db';

export async function createUser(
	email: string,
	password: string,
	firstName: string,
	lastName: string
): Promise<ObjectId> {
	const existing = await db.collection('users').findOne({ email });
	if (existing) throw new Error('An account with this email already exists');

	const passwordHash = await bcrypt.hash(password, 12);
	const result = await db.collection('users').insertOne({ email, passwordHash, firstName, lastName });
	return result.insertedId;
}

export async function verifyUser(
	email: string,
	password: string
): Promise<{ userId: ObjectId; homeId?: ObjectId } | null> {
	const user = await db.collection('users').findOne({ email });
	if (!user) return null;

	const valid = await bcrypt.compare(password, user.passwordHash as string);
	if (!valid) return null;

	return {
		userId: user._id as ObjectId,
		homeId: user.homeId as ObjectId | undefined
	};
}
