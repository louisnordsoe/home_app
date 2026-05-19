<script lang="ts">
	import { enhance } from '$lib/enhance';
	import { useLiveReload } from '$lib/useLiveReload';
	import type { PageData } from './$types';

	useLiveReload();

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let showAddForm = $state(false);
	let addRecurring = $state(true);
	let recurringType = $state<'daily' | 'weekly'>('daily');

	let editingId = $state<string | null>(null);
	let editTitle = $state('');
	let editAssignedTo = $state('');
	let editHasCounter = $state(false);

	let deleteConfirmId = $state<string | null>(null);
	let bumpPromptId = $state<string | null>(null);

	function startEdit(id: string, title: string, assignedTo: string | null, hasCounter: boolean) {
		editingId = id;
		editTitle = title;
		editAssignedTo = assignedTo ?? '';
		editHasCounter = hasCounter;
		deleteConfirmId = null;
		bumpPromptId = null;
	}

	function cancelEdit() {
		editingId = null;
	}
</script>

<main class="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
	<div class="flex items-center justify-between gap-4">
		<h1 class="text-base font-medium text-on-surface">{data.dayLabel}</h1>
		<div class="flex items-center gap-1 shrink-0">
			<a
				href="/tasks?date={data.prevDate}"
				class="flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
				aria-label="Previous day"
			>
				<span class="material-symbols-outlined text-xl leading-none">chevron_left</span>
			</a>
			{#if !data.isToday}
				<a
					href="/tasks"
					class="px-3 py-1.5 text-xs rounded-full bg-secondary-container text-on-secondary-container font-medium hover:opacity-90 transition-opacity"
				>
					Today
				</a>
			{/if}
			<a
				href="/tasks?date={data.nextDate}"
				class="flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
				aria-label="Next day"
			>
				<span class="material-symbols-outlined text-xl leading-none">chevron_right</span>
			</a>
		</div>
	</div>

	{#if data.tasks.length === 0 && !showAddForm}
		<div class="flex flex-col items-center justify-center py-12 text-on-surface-variant gap-2">
			<span class="material-symbols-outlined text-4xl">task_alt</span>
			<p class="text-sm">No tasks for this day</p>
		</div>
	{/if}

	<ul class="flex flex-col gap-2">
		{#each data.tasks as task (task.id)}
			<li class="bg-surface rounded-[28px] shadow-sm px-4 py-3">
				{#if editingId === task.id}
					<form
						method="POST"
						action="?/editTask"
						use:enhance={() =>
							async ({ update }) => {
								await update();
								editingId = null;
							}}
						class="flex flex-col gap-3"
					>
						<input type="hidden" name="taskId" value={task.id} />
						<md-outlined-text-field
							name="title"
							label="Title"
							value={editTitle}
							oninput={(e: any) => (editTitle = e.currentTarget.value)}
							style="width: 100%"
						></md-outlined-text-field>
						{#if data.members.length > 0}
							<md-outlined-select
								name="assignedTo"
								label="Assigned to"
								value={editAssignedTo}
								onchange={(e: any) => (editAssignedTo = e.currentTarget.value)}
								style="width: 100%"
							>
								<md-select-option value="" selected={editAssignedTo === ''}
									>Unassigned</md-select-option
								>
								{#each data.members as m (m.email)}
									<md-select-option value={m.email} selected={editAssignedTo === m.email}
										>{m.email}</md-select-option
									>
								{/each}
							</md-outlined-select>
						{/if}
						<label class="flex items-center gap-3 text-sm text-on-surface-variant cursor-pointer">
							<md-checkbox
								name="hasCounter"
								checked={editHasCounter}
								onchange={(e: any) => (editHasCounter = e.currentTarget.checked)}
							></md-checkbox>
							Track count
						</label>
						<div class="flex gap-2">
							<md-filled-button type="submit">Save</md-filled-button>
							<md-outlined-button type="button" onclick={cancelEdit}>Cancel</md-outlined-button>
						</div>
					</form>
				{:else if deleteConfirmId === task.id}
					<div class="flex flex-col gap-3">
						<p class="text-sm text-on-surface">
							{task.isRecurring ? 'Delete just this day or all occurrences?' : 'Delete this task?'}
						</p>
						<div class="flex gap-2 flex-wrap">
							{#if task.isRecurring}
								<form method="POST" action="?/deleteTask" use:enhance>
									<input type="hidden" name="taskId" value={task.id} />
									<md-filled-tonal-button
										type="submit"
										style="--md-filled-tonal-button-container-color: var(--md-sys-color-error-container); --md-filled-tonal-button-label-text-color: var(--md-sys-color-on-error-container);"
										>This day only</md-filled-tonal-button
									>
								</form>
								<form
									method="POST"
									action="?/deleteAllRecurring"
									use:enhance={() =>
										async ({ update }) => {
											await update();
											deleteConfirmId = null;
										}}
								>
									<input type="hidden" name="recurringGroupId" value={task.recurringGroupId} />
									<md-filled-button
										type="submit"
										style="--md-filled-button-container-color: var(--md-sys-color-error); --md-filled-button-label-text-color: var(--md-sys-color-on-error);"
										>All occurrences</md-filled-button
									>
								</form>
							{:else}
								<form method="POST" action="?/deleteTask" use:enhance>
									<input type="hidden" name="taskId" value={task.id} />
									<md-filled-button
										type="submit"
										style="--md-filled-button-container-color: var(--md-sys-color-error); --md-filled-button-label-text-color: var(--md-sys-color-on-error);"
										>Delete</md-filled-button
									>
								</form>
							{/if}
							<md-outlined-button type="button" onclick={() => (deleteConfirmId = null)}
								>Cancel</md-outlined-button
							>
						</div>
					</div>
				{:else}
					<div class="flex items-center gap-3">
						<form method="POST" action="?/toggle" use:enhance>
							<input type="hidden" name="taskId" value={task.id} />
							<input type="hidden" name="done" value={(!task.done).toString()} />
							<md-checkbox
								checked={task.done}
								onchange={(e: any) => {
									const checking = !task.done;
									if (checking && task.hasCounter && task.counter === 0) {
										e.currentTarget.checked = false;
										bumpPromptId = task.id;
									} else {
										bumpPromptId = null;
										e.currentTarget.closest('form')?.requestSubmit();
									}
								}}
							></md-checkbox>
						</form>

						{#if task.hasCounter}
							<div class="flex items-center gap-0.5 shrink-0">
								<form method="POST" action="?/updateCounter" use:enhance>
									<input type="hidden" name="taskId" value={task.id} />
									<input type="hidden" name="delta" value="-1" />
									<button
										type="submit"
										disabled={task.counter === 0}
										class="w-8 h-8 rounded-full text-lg leading-none text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-colors"
										>−</button
									>
								</form>
								<span class="w-8 text-center text-sm font-mono text-on-surface tabular-nums"
									>{task.counter}</span
								>
								<form method="POST" action="?/updateCounter" use:enhance>
									<input type="hidden" name="taskId" value={task.id} />
									<input type="hidden" name="delta" value="1" />
									<button
										type="submit"
										class="w-8 h-8 rounded-full text-lg leading-none text-on-surface-variant hover:bg-surface-container-high transition-colors"
										>+</button
									>
								</form>
							</div>
						{/if}

						<div class="flex-1 min-w-0">
							<span
								class="text-sm {task.done
									? 'line-through text-on-surface-variant'
									: 'text-on-surface'}"
							>
								{task.title}
							</span>
							<div class="flex items-center gap-2 mt-0.5">
								{#if task.isRecurring}
									<span class="flex items-center gap-0.5 text-xs text-primary">
										<span class="material-symbols-outlined text-xs leading-none">repeat</span>
										Recurring
									</span>
								{/if}
								{#if task.assignedTo}
									<span class="text-xs text-on-surface-variant">{task.assignedTo}</span>
								{/if}
							</div>
						</div>

						<div class="flex items-center gap-0.5 shrink-0">
							<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
							<md-icon-button
								onclick={() => startEdit(task.id, task.title, task.assignedTo, task.hasCounter)}
								aria-label="Edit task"
							>
								<span class="material-symbols-outlined text-base">edit</span>
							</md-icon-button>
							<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
							<md-icon-button
								onclick={() => {
									deleteConfirmId = task.id;
									bumpPromptId = null;
								}}
								aria-label="Delete task"
							>
								<span class="material-symbols-outlined text-base" style="color: var(--color-error)"
									>delete</span
								>
							</md-icon-button>
						</div>
					</div>

					{#if bumpPromptId === task.id}
						<div
							class="mt-2 flex items-center gap-2 flex-wrap bg-amber-50 rounded-[14px] px-3 py-2 border border-amber-200"
						>
							<span class="text-sm text-amber-800 mr-1">Counter is 0 — bump to 1?</span>
							<form
								method="POST"
								action="?/toggle"
								use:enhance={() =>
									async ({ update }) => {
										await update();
										bumpPromptId = null;
									}}
							>
								<input type="hidden" name="taskId" value={task.id} />
								<input type="hidden" name="done" value="true" />
								<input type="hidden" name="bumpCounter" value="true" />
								<button
									type="submit"
									class="px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors"
									>Yes, bump to 1</button
								>
							</form>
							<form
								method="POST"
								action="?/toggle"
								use:enhance={() =>
									async ({ update }) => {
										await update();
										bumpPromptId = null;
									}}
							>
								<input type="hidden" name="taskId" value={task.id} />
								<input type="hidden" name="done" value="true" />
								<input type="hidden" name="bumpCounter" value="false" />
								<button
									type="submit"
									class="px-3 py-1 rounded-full border border-amber-300 text-amber-800 text-xs font-medium hover:bg-amber-100 transition-colors"
									>No, just done</button
								>
							</form>
							<button
								onclick={() => (bumpPromptId = null)}
								class="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-amber-400 hover:text-amber-600 hover:bg-amber-100 transition-colors"
								aria-label="Dismiss"
							>
								<span class="material-symbols-outlined text-base leading-none">close</span>
							</button>
						</div>
					{/if}
				{/if}
			</li>
		{/each}
	</ul>

	{#if showAddForm}
		<div class="bg-surface rounded-[28px] shadow-sm px-5 py-4">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-sm font-medium text-on-surface">Add task</h2>
				<label class="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
					<md-checkbox
						checked={addRecurring}
						onchange={(e: any) => (addRecurring = e.currentTarget.checked)}
					></md-checkbox>
					Recurring
				</label>
			</div>

			{#if !addRecurring}
				<form
					method="POST"
					action="?/addSingle"
					use:enhance={() =>
						async ({ update }) => {
							await update();
							showAddForm = false;
						}}
					class="flex flex-col gap-3"
				>
					<input type="hidden" name="date" value={data.selectedDate} />
					<md-outlined-text-field name="title" label="Task title…" required style="width: 100%"
					></md-outlined-text-field>
					{#if data.members.length > 0}
						<md-outlined-select name="assignedTo" label="Assigned to" style="width: 100%">
							<md-select-option value="">Unassigned</md-select-option>
							{#each data.members as m (m.email)}
								<md-select-option value={m.email}>{m.email}</md-select-option>
							{/each}
						</md-outlined-select>
					{/if}
					<label class="flex items-center gap-3 text-sm text-on-surface-variant cursor-pointer">
						<md-checkbox name="hasCounter" checked></md-checkbox>
						Track count
					</label>
					<div class="flex gap-2">
						<md-filled-button type="submit">Add</md-filled-button>
						<md-outlined-button type="button" onclick={() => (showAddForm = false)}
							>Cancel</md-outlined-button
						>
					</div>
				</form>
			{:else}
				<form
					method="POST"
					action="?/addRecurring"
					use:enhance={() =>
						async ({ update }) => {
							await update();
							showAddForm = false;
						}}
					class="flex flex-col gap-3"
				>
					<md-outlined-text-field name="title" label="Task title…" required style="width: 100%"
					></md-outlined-text-field>
					<div class="flex gap-4">
						<label class="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
							<md-radio
								name="recurring"
								value="daily"
								checked={recurringType === 'daily'}
								onchange={() => (recurringType = 'daily')}
							></md-radio>
							Daily
						</label>
						<label class="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
							<md-radio
								name="recurring"
								value="weekly"
								checked={recurringType === 'weekly'}
								onchange={() => (recurringType = 'weekly')}
							></md-radio>
							Weekly
						</label>
					</div>
					<div class="flex gap-3 items-center">
						<label for="startDate" class="text-sm text-on-surface-variant shrink-0">Starting:</label
						>
						<input
							id="startDate"
							name="startDate"
							type="date"
							value={data.selectedDate}
							required
							class="md3-date-input flex-1"
						/>
					</div>
					{#if data.members.length > 0}
						<md-outlined-select name="assignedTo" label="Assigned to" style="width: 100%">
							<md-select-option value="">Unassigned</md-select-option>
							{#each data.members as m (m.email)}
								<md-select-option value={m.email}>{m.email}</md-select-option>
							{/each}
						</md-outlined-select>
					{/if}
					<label class="flex items-center gap-3 text-sm text-on-surface-variant cursor-pointer">
						<md-checkbox name="hasCounter" checked></md-checkbox>
						Track count
					</label>
					<div class="flex gap-2">
						<md-filled-button type="submit">Add recurring</md-filled-button>
						<md-outlined-button type="button" onclick={() => (showAddForm = false)}
							>Cancel</md-outlined-button
						>
					</div>
				</form>
			{/if}
		</div>
	{:else}
		<button
			onclick={() => {
				showAddForm = true;
				addRecurring = true;
			}}
			class="flex items-center gap-2 px-5 py-3 rounded-[28px] border-2 border-dashed border-outline-variant
			       text-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
		>
			<span class="material-symbols-outlined text-base">add</span>
			Add task
		</button>
	{/if}
</main>
