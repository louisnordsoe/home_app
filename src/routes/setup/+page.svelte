<script lang="ts">
	import { enhance } from '$lib/enhance';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let loadingCreate = $state(false);
	let loadingJoin = $state(false);
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<div class="w-full max-w-2xl">
		<div class="text-center mb-8">
			<span class="material-symbols-outlined text-5xl text-indigo-600">home</span>
			<h1 class="mt-1 text-2xl font-semibold text-gray-900">Set up your home</h1>
			<p class="mt-1 text-sm text-gray-500">Signed in as {data.email}</p>
		</div>

		<div class="grid sm:grid-cols-2 gap-4">
			<!-- Create -->
			<div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
						<span class="material-symbols-outlined text-indigo-600">add_home</span>
					</div>
					<div>
						<h2 class="font-semibold text-gray-900">Create a home</h2>
						<p class="text-xs text-gray-500">Start fresh and invite others</p>
					</div>
				</div>

				{#if form?.panel === 'create'}
					<div
						class="mb-3 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg flex items-center gap-2"
					>
						<span class="material-symbols-outlined text-base shrink-0">error</span>
						{form.error}
					</div>
				{/if}

				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						loadingCreate = true;
						return async ({ update }) => {
							await update();
							loadingCreate = false;
						};
					}}
					class="flex flex-col gap-3 mt-auto"
				>
					<input
						name="name"
						type="text"
						required
						placeholder="e.g. The Smith House"
						class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
						       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
					/>
					<button
						type="submit"
						disabled={loadingCreate}
						class="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg
						       hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
					>
						{loadingCreate ? 'Creating…' : 'Create home'}
					</button>
				</form>
			</div>

			<!-- Join -->
			<div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
						<span class="material-symbols-outlined text-emerald-600">group_add</span>
					</div>
					<div>
						<h2 class="font-semibold text-gray-900">Join a home</h2>
						<p class="text-xs text-gray-500">Enter an invite code from a member</p>
					</div>
				</div>

				{#if form?.panel === 'join'}
					<div
						class="mb-3 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg flex items-center gap-2"
					>
						<span class="material-symbols-outlined text-base shrink-0">error</span>
						{form.error}
					</div>
				{/if}

				<form
					method="POST"
					action="?/join"
					use:enhance={() => {
						loadingJoin = true;
						return async ({ update }) => {
							await update();
							loadingJoin = false;
						};
					}}
					class="flex flex-col gap-3 mt-auto"
				>
					<input
						name="code"
						type="text"
						required
						placeholder="e.g. A1B2C3"
						autocomplete="off"
						class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono uppercase
						       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
					/>
					<button
						type="submit"
						disabled={loadingJoin}
						class="w-full py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg
						       hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
					>
						{loadingJoin ? 'Joining…' : 'Join home'}
					</button>
				</form>
			</div>
		</div>
	</div>
</div>
