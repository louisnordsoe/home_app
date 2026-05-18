import { MongoClient } from 'mongodb';
import { MONGODB_URI, MONGODB_DB } from '$env/static/private';

// Singleton client — SvelteKit server modules are module-cached in production;
// in dev, Vite HMR re-imports modules so we pin to globalThis to survive reloads.
declare const globalThis: { _mongoClient?: MongoClient } & typeof global;

if (!globalThis._mongoClient) {
	globalThis._mongoClient = new MongoClient(MONGODB_URI);
	await globalThis._mongoClient.connect();
}

const mongo = globalThis._mongoClient;

export const db = mongo.db(MONGODB_DB);
export { mongo };
