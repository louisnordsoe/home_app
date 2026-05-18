import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { MONGODB_WATCH_COLLECTION } from '$env/static/private';

export const GET: RequestHandler = () => {
	let closed = false;

	const stream = new ReadableStream({
		async start(controller) {
			const send = (data: unknown) => {
				if (closed) return;
				controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
			};

			// Send initial connection confirmation
			send({ type: 'connected' });

			const collection = db.collection(MONGODB_WATCH_COLLECTION);
			const changeStream = collection.watch([], { fullDocument: 'updateLookup' });

			changeStream.on('change', (event) => {
				send(event);
			});

			changeStream.on('error', (err) => {
				console.error('Change stream error:', err);
				if (!closed) controller.close();
			});

			// Clean up when client disconnects
			const cleanup = () => {
				closed = true;
				changeStream.close().catch(() => {});
			};

			// Return cleanup via a promise that resolves when the stream closes
			return new Promise<void>((resolve) => {
				changeStream.on('close', () => {
					cleanup();
					resolve();
				});
			});
		},
		cancel() {
			closed = true;
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});
};
