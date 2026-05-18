import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = () => {
	let closed = false;

	const stream = new ReadableStream({
		async start(controller) {
			const send = (data: unknown) => {
				if (closed) return;
				controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
			};

			send({ type: 'connected' });

			// Watch the entire database so all collections trigger updates
			const changeStream = db.watch([], { fullDocument: 'updateLookup' });

			changeStream.on('change', (event) => {
				const ns = 'ns' in event ? (event.ns as { coll?: string }) : null;
				send({ coll: ns?.coll, op: event.operationType });
			});

			changeStream.on('error', (err) => {
				console.error('Watch stream error:', err);
				if (!closed) controller.close();
			});

			return new Promise<void>((resolve) => {
				changeStream.on('close', () => {
					closed = true;
					changeStream.close().catch(() => {});
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
