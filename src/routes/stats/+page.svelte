<script lang="ts">
	import { useLiveReload } from '$lib/useLiveReload';
	import type { PageData } from './$types';

	useLiveReload();

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const views: { value: string; label: string }[] = [
		{ value: 'daily', label: 'Daily' },
		{ value: 'weekly', label: 'Weekly' },
		{ value: 'monthly', label: 'Monthly' }
	];
</script>

<main class="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
	<div class="flex items-center justify-between gap-4 flex-wrap">
		<!-- MD3 Segmented button -->
		<div class="flex border border-outline rounded-full overflow-hidden">
			{#each views as v, i (v.value)}
				<a
					href="/stats?view={v.value}"
					class="flex items-center gap-1.5 px-4 h-10 text-sm no-underline transition-colors
					       {data.view === v.value
						? 'bg-secondary-container text-on-secondary-container font-medium'
						: 'text-on-surface hover:bg-surface-container-high'}
					       {i < views.length - 1 ? 'border-r border-outline' : ''}"
				>
					{#if data.view === v.value}
						<span class="material-symbols-outlined text-base">check</span>
					{/if}
					{v.label}
				</a>
			{/each}
		</div>

		<div class="flex items-center gap-1">
			<a
				href="/stats?view={data.view}&ref={data.prevRef}"
				class="flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
				aria-label="Previous period"
			>
				<span class="material-symbols-outlined text-xl leading-none">chevron_left</span>
			</a>
			<span class="text-sm font-medium text-on-surface px-1">{data.periodLabel}</span>
			{#if !data.isCurrentPeriod}
				<a
					href="/stats?view={data.view}"
					class="px-3 py-1.5 text-xs rounded-full bg-secondary-container text-on-secondary-container font-medium hover:opacity-90 transition-opacity"
				>
					Current
				</a>
			{/if}
			<a
				href="/stats?view={data.view}&ref={data.nextRef}"
				class="flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
				aria-label="Next period"
			>
				<span class="material-symbols-outlined text-xl leading-none">chevron_right</span>
			</a>
		</div>
	</div>

	{#if data.users.length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-on-surface-variant gap-2">
			<span class="material-symbols-outlined text-4xl">bar_chart</span>
			<p class="text-sm">No completed tasks this period</p>
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each data.users as user (user.email)}
				<div class="bg-surface rounded-[28px] shadow-sm overflow-hidden">
					<div
						class="px-4 py-3 flex items-center justify-between border-b border-outline-variant bg-surface-container-high"
					>
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-base text-primary">person</span>
							<span class="text-sm font-medium text-on-surface">{user.email}</span>
						</div>
						<span class="text-xs text-on-surface-variant tabular-nums">{user.total} total</span>
					</div>
					<ul>
						{#each user.tasks as task, i (task.title)}
							<li
								class="px-4 py-2.5 flex items-center justify-between gap-3
								       {i < user.tasks.length - 1 ? 'border-b border-outline-variant' : ''}"
							>
								<span class="text-sm text-on-surface">{task.title}</span>
								<span
									class="text-sm font-mono text-on-surface-variant tabular-nums shrink-0 bg-surface-container px-2 py-0.5 rounded-full"
									>{task.count}×</span
								>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	{/if}
</main>
