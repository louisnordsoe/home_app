<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let newTitle = $state('');
	let newAssignedTo = $state('');

	let editingId = $state<string | null>(null);
	let editTitle = $state('');
	let editAssignedTo = $state('');

	let deleteConfirmId = $state<string | null>(null);

	function startEdit(id: string, title: string, assignedTo: string | null) {
		editingId = id;
		editTitle = title;
		editAssignedTo = assignedTo ?? '';
		deleteConfirmId = null;
	}

	function cancelEdit() {
		editingId = null;
	}
</script>

<main class="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
	<h1 class="text-base font-semibold text-gray-900">To-do list</h1>

	<form
		method="POST"
		action="?/add"
		use:enhance={() =>
			async ({ update }) => {
				await update();
				newTitle = '';
				newAssignedTo = '';
			}}
		class="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-col gap-2"
	>
		<div class="flex gap-2">
			<input
				name="title"
				type="text"
				placeholder="Add a to-do…"
				bind:value={newTitle}
				required
				class="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
			/>
			<button
				type="submit"
				class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors shrink-0"
			>
				Add
			</button>
		</div>
		{#if data.members.length > 0}
			<select
				name="assignedTo"
				bind:value={newAssignedTo}
				class="text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
			>
				<option value="">Unassigned</option>
				{#each data.members as m}
					<option value={m.email}>{m.email}</option>
				{/each}
			</select>
		{/if}
	</form>

	{#if data.todos.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
			<span class="material-symbols-outlined text-4xl">checklist</span>
			<p class="text-sm">No to-dos yet</p>
		</div>
	{:else}
		<ul class="flex flex-col gap-2">
			{#each data.todos as todo (todo.id)}
				<li class="bg-white rounded-xl border border-gray-200 px-4 py-3">
					{#if editingId === todo.id}
						<form
							method="POST"
							action="?/edit"
							use:enhance={() =>
								async ({ update }) => {
									await update();
									editingId = null;
								}}
							class="flex flex-col gap-2"
						>
							<input type="hidden" name="todoId" value={todo.id} />
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
					{:else if deleteConfirmId === todo.id}
						<div class="flex items-center gap-3">
							<p class="text-sm text-gray-700 flex-1">Delete this to-do?</p>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="todoId" value={todo.id} />
								<button
									type="submit"
									class="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
									>Delete</button
								>
							</form>
							<button
								type="button"
								onclick={() => (deleteConfirmId = null)}
								class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
								>Cancel</button
							>
						</div>
					{:else}
						<div class="flex items-center gap-3">
							<form method="POST" action="?/toggle" use:enhance>
								<input type="hidden" name="todoId" value={todo.id} />
								<input type="hidden" name="done" value={(!todo.done).toString()} />
								<input
									type="checkbox"
									checked={todo.done}
									class="w-5 h-5 cursor-pointer accent-indigo-600 shrink-0"
									onchange={(e) => e.currentTarget.closest('form')?.requestSubmit()}
								/>
							</form>

							<div class="flex-1 min-w-0">
								<span class="text-sm {todo.done ? 'line-through text-gray-400' : 'text-gray-800'}">
									{todo.title}
								</span>
								{#if todo.assignedTo}
									<p class="text-xs text-gray-400 mt-0.5">{todo.assignedTo}</p>
								{/if}
							</div>

							<div class="flex items-center gap-1 shrink-0">
								<button
									onclick={() => startEdit(todo.id, todo.title, todo.assignedTo)}
									class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
									aria-label="Edit"
								>
									<span class="material-symbols-outlined text-base">edit</span>
								</button>
								<button
									onclick={() => (deleteConfirmId = todo.id)}
									class="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
									aria-label="Delete"
								>
									<span class="material-symbols-outlined text-base">delete</span>
								</button>
							</div>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</main>
