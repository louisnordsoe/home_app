import { onMount, onDestroy } from 'svelte';
import { invalidateAll } from '$app/navigation';

export function useLiveReload() {
	let es: EventSource | null = null;

	onMount(() => {
		es = new EventSource('/api/watch');
		es.onmessage = (event) => {
			const data = JSON.parse(event.data) as { type?: string };
			if (data.type !== 'connected') invalidateAll();
		};
	});

	onDestroy(() => {
		es?.close();
	});
}
