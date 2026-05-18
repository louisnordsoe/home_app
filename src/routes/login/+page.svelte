<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	let mode = $state<'login' | 'signup'>('login');
	let loading = $state(false);
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<div class="w-full max-w-sm">
		<div class="text-center mb-8">
			<span class="material-symbols-outlined text-5xl text-indigo-600">home</span>
			<h1 class="mt-1 text-2xl font-semibold text-gray-900">Home App</h1>
		</div>

		<div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
			<div class="flex rounded-lg bg-gray-100 p-1 mb-6">
				<button
					type="button"
					onclick={() => (mode = 'login')}
					class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all
					       {mode === 'login' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}"
				>
					Log in
				</button>
				<button
					type="button"
					onclick={() => (mode = 'signup')}
					class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all
					       {mode === 'signup' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}"
				>
					Sign up
				</button>
			</div>

			{#if form?.error}
				<div class="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg flex items-center gap-2">
					<span class="material-symbols-outlined text-base shrink-0">error</span>
					{form.error}
				</div>
			{/if}

			<form
				method="POST"
				action={mode === 'login' ? '?/login' : '?/signup'}
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
				class="flex flex-col gap-4"
			>
				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-medium text-gray-700">Email</span>
					<div class="relative">
						<span
							class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none"
						>mail</span>
						<input
							name="email"
							type="email"
							required
							autocomplete="email"
							placeholder="you@example.com"
							class="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm
							       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
						/>
					</div>
				</label>

				<label class="flex flex-col gap-1.5">
					<span class="text-sm font-medium text-gray-700">Password</span>
					<div class="relative">
						<span
							class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none"
						>lock</span>
						<input
							name="password"
							type="password"
							required
							autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
							minlength={mode === 'signup' ? 8 : undefined}
							placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
							class="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm
							       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
						/>
					</div>
				</label>

				<button
					type="submit"
					disabled={loading}
					class="mt-1 w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg
					       hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
				>
					{loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
				</button>
			</form>
		</div>
	</div>
</div>
