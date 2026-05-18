import { writable } from 'svelte/store';

export type ChangeEvent = {
	operationType: string;
	fullDocument?: Record<string, unknown>;
	documentKey?: { _id: string };
	ns: { db: string; coll: string };
	wallTime?: string;
};

export const changes = writable<ChangeEvent[]>([]);
export const connected = writable(false);
