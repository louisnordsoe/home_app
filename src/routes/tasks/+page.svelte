<script lang="ts">
	import { enhance } from '$app/forms';
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

	function startEdit(
		id: string,
		title: string,
		assignedTo: string | null,
		hasCounter: boolean
	) {
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
		<h1 class="text-base font-semibold text-gray-900">{data.dayLabel}</h1>
		<div class="flex items-center gap-1 shrink-0">
			<a
				href="/tasks?date={data.prevDate}"
				class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
				aria-label="Previous day"
			>
				<span class="material-symbols-outlined text-xl leading-none">chevron_left</span>
			</a>
			{#if !data.isToday}
				<a
					href="/tasks"
					class="px-2.5 py-1 text-xs rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
				>
					Today
				</a>
			{/if}
			<a
				href="/tasks?date={data.nextDate}"
				class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
				aria-label="Next day"
			>
				<span class="material-symbols-outlined text-xl leading-none">chevron_right</span>
			</a>
		</div>
	</div>

	{#if data.tasks.length === 0 && !showAddForm}
		<div class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
			<span class="material-symbols-outlined text-4xl">task_alt</span>
			<p class="text-sm">No tasks for this day</p>
		</div>
	{/if}

	<ul class="flex flex-col gap-2">
		{#each data.tasks as task (task.id)}
			<li class="bg-white rounded-xl border border-gray-200 px-4 py-3">
				{#if editingId === task.id}
					<form
						method="POST"
						action="?/editTask"
						use:enhance={() =>
							async ({ update }) => {
								await update();
								editingId = null;
							}}
						class="flex flex-col gap-2"
					>
						<input type="hidden" name="taskId" value={task.id} />
						<input
							name="title"
							type="text"
							bind:value={editTitle}
							class="text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
						/>
						{#if data.members.length > 0}
							<select
								name="assignedTo"
								bind:value={editAssignedTo}
								class="text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
							>
								<option value="">Unassigned</option>
								{#each data.members as m}
									<option value={m.email}>{m.email}</option>
								{/each}
							</select>
						{/if}
						<label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
							<input
								type="checkbox"
								name="hasCounter"
								bind:checked={editHasCounter}
								class="w-4 h-4 accent-indigo-600"
							/>
							Track count
						</label>
						<div class="flex gap-2">
							<button
								type="submit"
								class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
								>Save</button
							>
							<button
								type="button"
								onclick={cancelEdit}
								class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
								>Cancel</button
							>
						</div>
					</form>
				{:else if deleteConfirmId === task.id}
					<div class="flex flex-col gap-2">
						<p class="text-sm text-gray-700">
							{task.isRecurring ? 'Delete just this day or all occurrences?' : 'Delete this task?'}
						</p>
						<div class="flex gap-2 flex-wrap">
							{#if task.isRecurring}
								<form method="POST" action="?/deleteTask" use:enhance>
									<input type="hidden" name="taskId" value={task.id} />
									<button
										type="submit"
										class="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-sm hover:bg-red-100 transition-colors border border-red-200"
									>
										This day only
									</button>
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
									<button
										type="submit"
										class="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
									>
										All occurrences
									</button>
								</form>
							{:else}
								<form method="POST" action="?/deleteTask" use:enhance>
									<input type="hidden" name="taskId" value={task.id} />
									<button
										type="submit"
										class="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
									>
										Delete
									</button>
								</form>
							{/if}
							<button
								type="button"
								onclick={() => (deleteConfirmId = null)}
								class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
								>Cancel</button
							>
						</div>
					</div>
				{:else}
					<div class="flex items-center gap-3">
						<form method="POST" action="?/toggle" use:enhance>
							<input type="hidden" name="taskId" value={task.id} />
							<input type="hidden" name="done" value={(!task.done).toString()} />
							<input
								type="checkbox"
								checked={task.done}
								class="w-5 h-5 cursor-pointer accent-indigo-600 shrink-0"
								onchange={(e) => {
									const checking = !task.done;
									if (checking && task.hasCounter && task.counter === 0) {
										e.currentTarget.checked = false;
										bumpPromptId = task.id;
									} else {
										bumpPromptId = null;
										e.currentTarget.closest('form')?.requestSubmit();
									}
								}}
							/>
						</form>

						{#if task.hasCounter}
							<div class="flex items-center gap-0.5 shrink-0">
								<form method="POST" action="?/updateCounter" use:enhance>
									<input type="hidden" name="taskId" value={task.id} />
									<input type="hidden" name="delta" value="-1" />
									<button
										type="submit"
										disabled={task.counter === 0}
										class="w-7 h-7 rounded text-lg leading-none text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
									>−</button>
								</form>
								<span class="w-7 text-center text-sm font-mono text-gray-700 tabular-nums"
									>{task.counter}</span
								>
								<form method="POST" action="?/updateCounter" use:enhance>
									<input type="hidden" name="taskId" value={task.id} />
									<input type="hidden" name="delta" value="1" />
									<button
										type="submit"
										class="w-7 h-7 rounded text-lg leading-none text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
									>+</button>
								</form>
							</div>
						{/if}

						<div class="flex-1 min-w-0">
							<span class="text-sm {task.done ? 'line-through text-gray-400' : 'text-gray-800'}">
								{task.title}
							</span>
							<div class="flex items-center gap-2 mt-0.5">
								{#if task.isRecurring}
									<span class="flex items-center gap-0.5 text-xs text-indigo-500">
										<span class="material-symbols-outlined text-xs leading-none">repeat</span>
										Recurring
									</span>
								{/if}
								{#if task.assignedTo}
									<span class="text-xs text-gray-400">{task.assignedTo}</span>
								{/if}
							</div>
						</div>

						<div class="flex items-center gap-1 shrink-0">
							<button
								onclick={() => startEdit(task.id, task.title, task.assignedTo, task.hasCounter)}
								class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
								aria-label="Edit task"
							>
								<span class="material-symbols-outlined text-base">edit</span>
							</button>
							<button
								onclick={() => {
									deleteConfirmId = task.id;
									bumpPromptId = null;
								}}
								class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
								aria-label="Delete task"
							>
								<span class="material-symbols-outlined text-base">delete</span>
							</button>
						</div>
					</div>

					{#if bumpPromptId === task.id}
						<div
							class="mt-2 flex items-center gap-2 flex-wrap bg-amber-50 rounded-lg px-3 py-2 border border-amber-200"
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
									class="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-xs hover:bg-amber-700 transition-colors"
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
									class="px-2.5 py-1 rounded-lg border border-amber-300 text-amber-800 text-xs hover:bg-amber-100 transition-colors"
									>No, just done</button
								>
							</form>
							<button
								onclick={() => (bumpPromptId = null)}
								class="ml-auto text-amber-400 hover:text-amber-600 transition-colors"
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
		<div class="bg-white rounded-xl border border-gray-200 px-4 py-4">
			<div class="flex items-center justify-between mb-3">
				<h2 class="text-sm font-medium text-gray-700">Add task</h2>
				<label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
					<input type="checkbox" bind:checked={addRecurring} class="w-4 h-4 accent-indigo-600" />
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
					class="flex flex-col gap-2"
				>
					<input type="hidden" name="date" value={data.selectedDate} />
					<input
						name="title"
						type="text"
						placeholder="Task title…"
						required
						class="text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
					/>
					{#if data.members.length > 0}
						<select
							name="assignedTo"
							class="text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
						>
							<option value="">Unassigned</option>
							{#each data.members as m}
								<option value={m.email}>{m.email}</option>
							{/each}
						</select>
					{/if}
					<label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
						<input type="checkbox" name="hasCounter" checked class="w-4 h-4 accent-indigo-600" />
						Track count
					</label>
					<div class="flex gap-2">
						<button
							type="submit"
							class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
							>Add</button
						>
						<button
							type="button"
							onclick={() => (showAddForm = false)}
							class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
							>Cancel</button
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
					class="flex flex-col gap-2"
				>
					<input
						name="title"
						type="text"
						placeholder="Task title…"
						required
						class="text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
					/>
					<div class="flex gap-3 items-center">
						<label class="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
							<input type="radio" name="recurring" value="daily" bind:group={recurringType} />
							Daily
						</label>
						<label class="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
							<input type="radio" name="recurring" value="weekly" bind:group={recurringType} />
							Weekly
						</label>
					</div>
					<div class="flex gap-2 items-center">
						<label for="startDate" class="text-sm text-gray-600 shrink-0">Starting:</label>
						<input
							id="startDate"
							name="startDate"
							type="date"
							value={data.selectedDate}
							required
							class="text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
						/>
					</div>
					{#if data.members.length > 0}
						<select
							name="assignedTo"
							class="text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
						>
							<option value="">Unassigned</option>
							{#each data.members as m}
								<option value={m.email}>{m.email}</option>
							{/each}
						</select>
					{/if}
					<label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
						<input type="checkbox" name="hasCounter" checked class="w-4 h-4 accent-indigo-600" />
						Track count
					</label>
					<div class="flex gap-2">
						<button
							type="submit"
							class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
							>Add recurring</button
						>
						<button
							type="button"
							onclick={() => { showAddForm = false; }}
							class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
							>Cancel</button
						>
					</div>
				</form>
			{/if}
		</div>
	{:else}
		<button
			onclick={() => { showAddForm = true; addRecurring = true; }}
			class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200
			       text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
		>
			<span class="material-symbols-outlined text-base">add</span>
			Add task
		</button>
	{/if}
</main>
