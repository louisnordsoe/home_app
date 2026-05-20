<script lang="ts">
	import { enhance } from '$lib/enhance';
	import { useLiveReload } from '$lib/useLiveReload';
	import type { PageData } from './$types';
	import UserAvatar from '$lib/components/UserAvatar.svelte';

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

	function getMember(id: string | null) {
		if (!id) return null;
		return data.members.find((m) => m.id === id) ?? null;
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
				{#each data.members as m (m.id)}
					<md-select-option value={m.id} selected={newAssignedTo === m.id}
						>{m.firstName} {m.lastName}</md-select-option
					>
				{/each}
			</md-outlined-select>
		{/if}
		<div class="flex justify-end">
			<md-filled-icon-button type="submit" aria-label="Add">
				<span class="material-symbols-outlined">check</span>
			</md-filled-icon-button>
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
									{#each data.members as m (m.id)}
										<md-select-option value={m.id} selected={editAssignedTo === m.id}
											>{m.firstName} {m.lastName}</md-select-option
										>
									{/each}
								</md-outlined-select>
							{/if}
							<div class="flex items-center gap-2">
								<md-filled-icon-button type="submit" aria-label="Save">
									<span class="material-symbols-outlined">check</span>
								</md-filled-icon-button>
								<md-icon-button type="button" onclick={cancelEdit} aria-label="Cancel">
									<span class="material-symbols-outlined">close</span>
								</md-icon-button>
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
							<md-icon-button
								type="button"
								onclick={() => (deleteConfirmId = null)}
								aria-label="Cancel"
							>
								<span class="material-symbols-outlined">close</span>
							</md-icon-button>
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
									{@const member = getMember(todo.assignedTo)}
									{#if member}
										<div class="flex items-center gap-1.5 mt-1">
											<UserAvatar
												userId={member.id}
												firstName={member.firstName}
												lastName={member.lastName}
												size="sm"
											/>
											<span class="text-xs text-on-surface-variant"
												>{member.firstName} {member.lastName}</span
											>
										</div>
									{/if}
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
