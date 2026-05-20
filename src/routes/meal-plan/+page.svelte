<script lang="ts">
	import { enhance } from '$lib/enhance';
	import { useLiveReload } from '$lib/useLiveReload';
	import type { PageData } from './$types';

	useLiveReload();

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
		<h1 class="text-base font-medium text-on-surface">{data.weekLabel}</h1>
		<div class="flex items-center gap-1 shrink-0">
			<a
				href="/meal-plan?week={data.prevWeek}"
				class="flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
				aria-label="Previous week"
			>
				<span class="material-symbols-outlined text-xl leading-none">chevron_left</span>
			</a>
			{#if !data.isCurrentWeek}
				<a
					href="/meal-plan"
					class="px-3 py-1.5 text-xs rounded-full bg-secondary-container text-on-secondary-container font-medium hover:opacity-90 transition-opacity"
				>
					This week
				</a>
			{/if}
			<a
				href="/meal-plan?week={data.nextWeek}"
				class="flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
				aria-label="Next week"
			>
				<span class="material-symbols-outlined text-xl leading-none">chevron_right</span>
			</a>
		</div>
	</div>

	<ul class="flex flex-col gap-2">
		{#each data.days as day (day.date)}
			{@const isToday = day.date === data.today}
			<li
				class="rounded-[28px] shadow-sm px-4 py-3
				       {isToday ? 'bg-primary-container' : 'bg-surface'}"
			>
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<span
								class="text-sm font-medium {isToday
									? 'text-on-primary-container'
									: 'text-on-surface'}"
							>
								{day.name}
							</span>
							<span
								class="text-xs {isToday
									? 'text-on-primary-container opacity-70'
									: 'text-on-surface-variant'}"
							>
								{day.date.slice(8, 10)}/{day.date.slice(5, 7)}
							</span>
							{#if isToday}
								<span
									class="text-xs px-2 py-0.5 bg-primary text-on-primary rounded-full font-medium"
									>Today</span
								>
							{/if}
						</div>
						{#if editingDate !== day.date}
							<p
								class="mt-1 text-sm {day.meal
									? isToday
										? 'text-on-primary-container'
										: 'text-on-surface'
									: 'text-on-surface-variant italic'}"
							>
								{day.meal || 'No meal planned'}
							</p>
						{/if}
					</div>

					{#if editingDate !== day.date}
						<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
						<md-icon-button onclick={() => startEdit(day.date, day.meal)} aria-label="Edit meal">
							<span class="material-symbols-outlined text-base">edit</span>
						</md-icon-button>
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
						class="mt-3 flex flex-col gap-3"
					>
						<input type="hidden" name="date" value={day.date} />
						<md-outlined-text-field
							name="meal"
							label="Meal"
							placeholder="Enter meal…"
							value={editingMeal}
							oninput={(e: any) => (editingMeal = e.currentTarget.value)}
							style="width: 100%"
						></md-outlined-text-field>
						<div class="flex items-center gap-2">
							<md-filled-icon-button type="submit" aria-label="Save">
								<span class="material-symbols-outlined">check</span>
							</md-filled-icon-button>
							<md-icon-button type="button" onclick={cancelEdit} aria-label="Cancel">
								<span class="material-symbols-outlined">close</span>
							</md-icon-button>
						</div>
					</form>
				{/if}
			</li>
		{/each}
	</ul>
</main>
