<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { enhance } from '$app/forms';
	import { changes, connected, type ChangeEvent } from '$lib/stores';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let eventSource: EventSource | null = null;
	let copied = $state(false);

	onMount(() => {
		eventSource = new EventSource('/api/changes');
		eventSource.onopen = () => connected.set(true);
		eventSource.onmessage = (event) => {
			const payload = JSON.parse(event.data) as ChangeEvent & { type?: string };
			if (payload.type === 'connected') return;
			changes.update((prev) => [payload, ...prev].slice(0, 50));
		};
		eventSource.onerror = () => connected.set(false);
	});

	onDestroy(() => {
		eventSource?.close();
		connected.set(false);
	});

	function copyInviteCode() {
		if (!data.home) return;
		navigator.clipboard.writeText(data.home.inviteCode);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<main class="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
	{#if data.home}
		<div
			class="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4"
		>
			<div>
				<p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Invite code</p>
				<p class="mt-0.5 text-lg font-mono font-semibold text-gray-900 tracking-widest">
					{data.home.inviteCode}
				</p>
				<p class="text-xs text-gray-400 mt-0.5">Share this code to let others join your home</p>
			</div>
			<button
				onclick={copyInviteCode}
				class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200
				       text-sm text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
			>
				<span class="material-symbols-outlined text-base">
					{copied ? 'check' : 'content_copy'}
				</span>
				{copied ? 'Copied!' : 'Copy'}
			</button>
		</div>
	{/if}

	<div class="flex items-center gap-3">
		<h2 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Activity feed</h2>
		<span
			class="px-2 py-0.5 rounded-full text-xs font-medium
			       {$connected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}"
		>
			{$connected ? 'Live' : 'Connecting…'}
		</span>
	</div>

	{#if $changes.length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
			<span class="material-symbols-outlined text-4xl">sensors</span>
			<p class="text-sm">Waiting for database changes…</p>
		</div>
	{:else}
		<ul class="flex flex-col gap-2">
			{#each $changes as change (change.wallTime ?? Math.random())}
				<li class="bg-white border border-gray-200 rounded-xl px-4 py-3">
					<div class="flex items-center gap-2 mb-1">
						<span class="text-xs font-semibold uppercase tracking-wide text-indigo-600">
							{change.operationType}
						</span>
						<span class="text-xs text-gray-400">{change.ns?.coll}</span>
						{#if change.wallTime}
							<span class="text-xs text-gray-300 ml-auto">
								{new Date(change.wallTime).toLocaleTimeString()}
							</span>
						{/if}
					</div>
					<pre class="text-xs whitespace-pre-wrap break-words text-gray-600">{JSON.stringify(
							change.fullDocument ?? change.documentKey,
							null,
							2
						)}</pre>
				</li>
			{/each}
		</ul>
	{/if}
</main>
