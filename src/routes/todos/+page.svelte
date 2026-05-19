<script lang="ts">
	import { enhance } from '$lib/enhance';
	import { useLiveReload } from '$lib/useLiveReload';
	import type { PageData } from './$types';

	useLiveReload();

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
	<h1 class="text-base font-medium text-on-surface">To-do list</h1>

	<!-- Add form -->
	<form
		method="POST"
		action="?/add"
		use:enhance={() =>
			async ({ update }) => {
				await update();
				newTitle = '';
				newAssignedTo = '';
			}}
		class="bg-surface rounded-[28px] shadow-sm px-5 py-4 flex flex-col gap-3"
	>
		<md-outlined-text-field
			name="title"
			label="Add a to-do…"
			value={newTitle}
			oninput={(e: any) => (newTitle = e.currentTarget.value)}
			required
			style="width: 100%"
		></md-outlined-text-field>
		{#if data.members.length > 0}
			<md-outlined-select
				name="assignedTo"
				label="Assigned to"
				value={newAssignedTo}
				onchange={(e: any) => (newAssignedTo = e.currentTarget.value)}
				style="width: 100%"
			>
				<md-select-option value="" selected={newAssignedTo === ''}>Unassigned</md-select-option>
				{#each data.members as m (m.email)}
					<md-select-option value={m.email} selected={newAssignedTo === m.email}
						>{m.email}</md-select-option
					>
				{/each}
			</md-outlined-select>
		{/if}
		<div class="flex justify-end">
			<md-filled-button type="submit">Add</md-filled-button>
		</div>
	</form>

	{#if data.todos.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-on-surface-variant gap-2">
			<span class="material-symbols-outlined text-4xl">checklist</span>
			<p class="text-sm">No to-dos yet</p>
		</div>
	{:else}
		<ul class="flex flex-col gap-2">
			{#each data.todos as todo (todo.id)}
				<li class="bg-surface rounded-[28px] shadow-sm px-4 py-3">
					{#if editingId === todo.id}
						<form
							method="POST"
							action="?/edit"
							use:enhance={() =>
								async ({ update }) => {
									await update();
									editingId = null;
								}}
							class="flex flex-col gap-3"
						>
							<input type="hidden" name="todoId" value={todo.id} />
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
							<div class="flex gap-2">
								<md-filled-button type="submit">Save</md-filled-button>
								<md-outlined-button type="button" onclick={cancelEdit}>Cancel</md-outlined-button>
							</div>
						</form>
					{:else if deleteConfirmId === todo.id}
						<div class="flex items-center gap-3 flex-wrap">
							<p class="text-sm text-on-surface flex-1">Delete this to-do?</p>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="todoId" value={todo.id} />
								<md-filled-button
									type="submit"
									style="--md-filled-button-container-color: var(--md-sys-color-error); --md-filled-button-label-text-color: var(--md-sys-color-on-error);"
									>Delete</md-filled-button
								>
							</form>
							<md-outlined-button type="button" onclick={() => (deleteConfirmId = null)}
								>Cancel</md-outlined-button
							>
						</div>
					{:else}
						<div class="flex items-center gap-3">
							<form method="POST" action="?/toggle" use:enhance>
								<input type="hidden" name="todoId" value={todo.id} />
								<input type="hidden" name="done" value={(!todo.done).toString()} />
								<md-checkbox
									checked={todo.done}
									onchange={(e: any) => e.currentTarget.closest('form')?.requestSubmit()}
								></md-checkbox>
							</form>

							<div class="flex-1 min-w-0">
								<span
									class="text-sm {todo.done
										? 'line-through text-on-surface-variant'
										: 'text-on-surface'}"
								>
									{todo.title}
								</span>
								{#if todo.assignedTo}
									<p class="text-xs text-on-surface-variant mt-0.5">{todo.assignedTo}</p>
								{/if}
							</div>

							<div class="flex items-center gap-0.5 shrink-0">
								<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
								<md-icon-button
									onclick={() => startEdit(todo.id, todo.title, todo.assignedTo)}
									aria-label="Edit"
								>
									<span class="material-symbols-outlined text-base">edit</span>
								</md-icon-button>
								<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
								<md-icon-button onclick={() => (deleteConfirmId = todo.id)} aria-label="Delete">
									<span
										class="material-symbols-outlined text-base"
										style="color: var(--color-error)">delete</span
									>
								</md-icon-button>
							</div>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</main>
