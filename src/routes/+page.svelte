<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { connected } from '$lib/stores';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let eventSource: EventSource | null = null;
	let copied = $state(false);

	onMount(() => {
		eventSource = new EventSource('/api/watch');
		eventSource.onopen = () => connected.set(true);
		eventSource.onmessage = (event) => {
			const payload = JSON.parse(event.data) as { type?: string; coll?: string; op?: string };
			if (payload.type === 'connected') return;
			if (payload.coll === 'task_logs' && payload.op === 'insert') {
				invalidateAll();
			}
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

	function formatDateTime(iso: string) {
		const d = new Date(iso);
		return d.toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<main class="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
	{#if data.home}
		<div class="bg-surface rounded-[28px] shadow-sm p-5 flex items-center justify-between gap-4">
			<div>
				<p class="text-xs font-medium text-on-surface-variant uppercase tracking-wide mb-1">
					Invite code
				</p>
				<p class="text-xl font-mono font-semibold text-on-surface tracking-widest">
					{data.home.inviteCode}
				</p>
				<p class="text-xs text-on-surface-variant mt-0.5">
					Share this code to let others join your home
				</p>
			</div>
			<md-filled-tonal-button
				onclick={copyInviteCode}
				style="--md-filled-tonal-button-with-leading-icon-leading-space: 20px; --md-filled-tonal-button-trailing-space: 20px; min-width: 110px;"
			>
				<span class="material-symbols-outlined text-base" slot="icon">
					{copied ? 'check' : 'content_copy'}
				</span>
				{copied ? 'Copied!' : 'Copy'}
			</md-filled-tonal-button>
		</div>
	{/if}

	<div class="flex items-center gap-3">
		<h2 class="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
			Recent activity
		</h2>
		<span
			class="px-2.5 py-0.5 rounded-full text-xs font-medium
			       {$connected
				? 'bg-primary-container text-on-primary-container'
				: 'bg-surface-container-highest text-on-surface-variant'}"
		>
			{$connected ? 'Live' : 'Connecting…'}
		</span>
	</div>

	{#if data.recentActivity.length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-on-surface-variant gap-2">
			<span class="material-symbols-outlined text-4xl">pending_actions</span>
			<p class="text-sm">No activity yet</p>
		</div>
	{:else}
		<ul class="flex flex-col gap-2">
			{#each data.recentActivity as log (log.loggedAt + log.userEmail + log.taskTitle)}
				<li class="bg-surface rounded-[28px] shadow-sm px-5 py-3 flex items-center gap-3">
					<span class="material-symbols-outlined text-xl text-primary shrink-0">task_alt</span>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-on-surface truncate">
							{log.taskTitle}{log.count > 1 ? ` ×${log.count}` : ''}
						</p>
						<p class="text-xs text-on-surface-variant">{log.userEmail}</p>
					</div>
					<span class="text-xs text-on-surface-variant opacity-60 shrink-0">
						{formatDateTime(log.loggedAt)}
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</main>
