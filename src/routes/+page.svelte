<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { changes, connected, type ChangeEvent } from '$lib/stores';

	let eventSource: EventSource | null = null;

	onMount(() => {
		eventSource = new EventSource('/api/changes');

		eventSource.onopen = () => connected.set(true);

		eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data) as ChangeEvent & { type?: string };
			if (data.type === 'connected') return;
			changes.update((prev) => [data, ...prev].slice(0, 50));
		};

		eventSource.onerror = () => {
			connected.set(false);
		};
	});

	onDestroy(() => {
		eventSource?.close();
		connected.set(false);
	});
</script>

<main>
	<header>
		<h1>Home App</h1>
		<span class="status" class:online={$connected}>{$connected ? 'Live' : 'Connecting…'}</span>
	</header>

	{#if $changes.length === 0}
		<p class="empty">Waiting for database changes…</p>
	{:else}
		<ul>
			{#each $changes as change (change.wallTime ?? Math.random())}
				<li>
					<span class="op">{change.operationType}</span>
					<span class="coll">{change.ns?.coll}</span>
					<pre>{JSON.stringify(change.fullDocument ?? change.documentKey, null, 2)}</pre>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style>
	main {
		font-family: system-ui, sans-serif;
		max-width: 800px;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.status {
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		font-size: 0.8rem;
		background: #e5e7eb;
		color: #6b7280;
	}

	.status.online {
		background: #d1fae5;
		color: #065f46;
	}

	.empty {
		color: #9ca3af;
	}

	ul {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	li {
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 0.75rem 1rem;
	}

	.op {
		font-weight: 600;
		text-transform: uppercase;
		font-size: 0.75rem;
		margin-right: 0.5rem;
	}

	.coll {
		color: #6b7280;
		font-size: 0.85rem;
	}

	pre {
		margin: 0.5rem 0 0;
		font-size: 0.8rem;
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
