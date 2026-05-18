<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let editingDate = $state<string | null>(null);
	let editingMeal = $state('');

	function startEdit(date: string, currentMeal: string) {
		editingDate = date;
		editingMeal = currentMeal;
	}

	function cancelEdit() {
		editingDate = null;
		editingMeal = '';
	}
</script>

<main class="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
	<div class="flex items-center justify-between gap-4">
		<h1 class="text-base font-semibold text-gray-900">{data.weekLabel}</h1>
		<div class="flex items-center gap-1 shrink-0">
			<a
				href="/meal-plan?week={data.prevWeek}"
				class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
				aria-label="Previous week"
			>
				<span class="material-symbols-outlined text-xl leading-none">chevron_left</span>
			</a>
			{#if !data.isCurrentWeek}
				<a
					href="/meal-plan"
					class="px-2.5 py-1 text-xs rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
				>
					This week
				</a>
			{/if}
			<a
				href="/meal-plan?week={data.nextWeek}"
				class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
				aria-label="Next week"
			>
				<span class="material-symbols-outlined text-xl leading-none">chevron_right</span>
			</a>
		</div>
	</div>

	<ul class="flex flex-col gap-2">
		{#each data.days as day}
			{@const isToday = day.date === data.today}
			<li
				class="bg-white rounded-xl border px-4 py-3
				       {isToday ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200'}"
			>
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<span class="text-sm font-medium {isToday ? 'text-indigo-700' : 'text-gray-900'}">
								{day.name}
							</span>
							<span class="text-xs text-gray-400">
								{day.date.slice(8, 10)}/{day.date.slice(5, 7)}
							</span>
							{#if isToday}
								<span
									class="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full font-medium"
									>Today</span
								>
							{/if}
						</div>
						{#if editingDate !== day.date}
							<p class="mt-1 text-sm {day.meal ? 'text-gray-700' : 'text-gray-300 italic'}">
								{day.meal || 'No meal planned'}
							</p>
						{/if}
					</div>

					{#if editingDate !== day.date}
						<button
							onclick={() => startEdit(day.date, day.meal)}
							class="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
							aria-label="Edit meal"
						>
							<span class="material-symbols-outlined text-base">edit</span>
						</button>
					{/if}
				</div>

				{#if editingDate === day.date}
					<form
						method="POST"
						action="?/save"
						use:enhance={() =>
							async ({ update }) => {
								await update();
								editingDate = null;
							}}
						class="mt-2 flex gap-2"
					>
						<input type="hidden" name="date" value={day.date} />
						<input
							name="meal"
							type="text"
							placeholder="Enter meal…"
							bind:value={editingMeal}
							class="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
						/>
						<button
							type="submit"
							class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
						>
							Save
						</button>
						<button
							type="button"
							onclick={cancelEdit}
							class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
					</form>
				{/if}
			</li>
		{/each}
	</ul>
</main>
