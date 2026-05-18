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
		<div class="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
			{#each views as v}
				<a
					href="/stats?view={v.value}"
					class="px-3 py-1.5 text-sm transition-colors
					       {data.view === v.value
						       ? 'bg-indigo-600 text-white font-medium'
						       : 'text-gray-600 hover:bg-gray-50'}"
				>
					{v.label}
				</a>
			{/each}
		</div>

		<div class="flex items-center gap-1">
			<a
				href="/stats?view={data.view}&ref={data.prevRef}"
				class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
				aria-label="Previous period"
			>
				<span class="material-symbols-outlined text-xl leading-none">chevron_left</span>
			</a>
			<span class="text-sm font-medium text-gray-900 px-1">{data.periodLabel}</span>
			{#if !data.isCurrentPeriod}
				<a
					href="/stats?view={data.view}"
					class="px-2.5 py-1 text-xs rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
				>
					Current
				</a>
			{/if}
			<a
				href="/stats?view={data.view}&ref={data.nextRef}"
				class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
				aria-label="Next period"
			>
				<span class="material-symbols-outlined text-xl leading-none">chevron_right</span>
			</a>
		</div>
	</div>

	{#if data.users.length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
			<span class="material-symbols-outlined text-4xl">bar_chart</span>
			<p class="text-sm">No completed tasks this period</p>
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each data.users as user}
				<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
					<div
						class="px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-gray-50"
					>
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-base text-indigo-500">person</span>
							<span class="text-sm font-medium text-gray-900">{user.email}</span>
						</div>
						<span class="text-xs text-gray-500 tabular-nums">{user.total} total</span>
					</div>
					<ul>
						{#each user.tasks as task, i}
							<li
								class="px-4 py-2.5 flex items-center justify-between gap-3
								       {i < user.tasks.length - 1 ? 'border-b border-gray-100' : ''}"
							>
								<span class="text-sm text-gray-700">{task.title}</span>
								<span
									class="text-sm font-mono text-gray-500 tabular-nums shrink-0 bg-gray-50 px-2 py-0.5 rounded-full"
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
