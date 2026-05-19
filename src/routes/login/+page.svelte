<script lang="ts">
	import { enhance } from '$lib/enhance';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	let mode = $state<'login' | 'signup'>('login');
	let loading = $state(false);
</script>

<div class="min-h-screen bg-background flex items-center justify-center p-4">
	<div class="w-full max-w-sm">
		<div class="text-center mb-8">
			<span class="material-symbols-outlined text-5xl text-primary">home</span>
			<h1 class="mt-1 text-2xl font-medium text-on-surface">Home App</h1>
		</div>

		<div class="bg-surface rounded-[28px] shadow-sm p-6">
			<!-- Mode toggle -->
			<div class="flex rounded-full bg-surface-container p-1 mb-6">
				<button
					type="button"
					onclick={() => (mode = 'login')}
					class="flex-1 py-1.5 text-sm font-medium rounded-full transition-all
					       {mode === 'login'
						? 'bg-surface shadow-sm text-on-surface'
						: 'text-on-surface-variant hover:text-on-surface'}"
				>
					Log in
				</button>
				<button
					type="button"
					onclick={() => (mode = 'signup')}
					class="flex-1 py-1.5 text-sm font-medium rounded-full transition-all
					       {mode === 'signup'
						? 'bg-surface shadow-sm text-on-surface'
						: 'text-on-surface-variant hover:text-on-surface'}"
				>
					Sign up
				</button>
			</div>

			{#if form?.error}
				<div
					class="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm bg-error-container text-on-error-container"
				>
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
				<md-outlined-text-field
					name="email"
					type="email"
					label="Email"
					required
					autocomplete="email"
					placeholder="you@example.com"
					style="width: 100%"
				></md-outlined-text-field>

				<md-outlined-text-field
					name="password"
					type="password"
					label="Password"
					required
					autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
					minlength={mode === 'signup' ? 8 : undefined}
					placeholder={mode === 'signup' ? 'Min. 8 characters' : ''}
					style="width: 100%"
				></md-outlined-text-field>

				<md-filled-button
					type="submit"
					disabled={loading || null}
					style="width: 100%; margin-top: 4px"
				>
					{loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
				</md-filled-button>
			</form>
		</div>
	</div>
</div>
