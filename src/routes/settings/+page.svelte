<script lang="ts">
	import { enhance } from '$lib/enhance';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let profileLoading = $state(false);
	let passwordLoading = $state(false);
	let leaveConfirm = $state(false);
</script>

<main class="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
	<h1 class="text-base font-medium text-on-surface">Settings</h1>

	<!-- Profile -->
	<section class="bg-surface rounded-[28px] shadow-sm overflow-hidden">
		<div class="px-5 py-4 border-b border-outline-variant bg-surface-container-high">
			<p class="text-sm font-medium text-on-surface">Profile</p>
		</div>
		<form
			method="POST"
			action="?/updateProfile"
			use:enhance={() => {
				profileLoading = true;
				return async ({ update }) => {
					await update();
					profileLoading = false;
				};
			}}
			class="px-5 py-4 flex flex-col gap-4"
		>
			{#if form?.profileError}
				<div
					class="p-3 rounded-xl flex items-center gap-2 text-sm bg-error-container text-on-error-container"
				>
					<span class="material-symbols-outlined text-base shrink-0">error</span>
					{form.profileError}
				</div>
			{/if}
			{#if form?.profileSuccess}
				<div
					class="p-3 rounded-xl flex items-center gap-2 text-sm bg-primary-container text-on-primary-container"
				>
					<span class="material-symbols-outlined text-base shrink-0">check_circle</span>
					Profile updated
				</div>
			{/if}
			<div class="flex gap-3">
				<md-outlined-text-field
					name="firstName"
					label="First name"
					value={data.firstName}
					required
					autocomplete="given-name"
					style="flex: 1"
				></md-outlined-text-field>
				<md-outlined-text-field
					name="lastName"
					label="Last name"
					value={data.lastName}
					required
					autocomplete="family-name"
					style="flex: 1"
				></md-outlined-text-field>
			</div>
			<div class="flex justify-end">
				<md-filled-icon-button type="submit" disabled={profileLoading || null} aria-label="Save">
					<span class="material-symbols-outlined">check</span>
				</md-filled-icon-button>
			</div>
		</form>
	</section>

	<!-- Password -->
	<section class="bg-surface rounded-[28px] shadow-sm overflow-hidden">
		<div class="px-5 py-4 border-b border-outline-variant bg-surface-container-high">
			<p class="text-sm font-medium text-on-surface">Change password</p>
		</div>
		<form
			method="POST"
			action="?/updatePassword"
			use:enhance={() => {
				passwordLoading = true;
				return async ({ update }) => {
					await update();
					passwordLoading = false;
				};
			}}
			class="px-5 py-4 flex flex-col gap-4"
		>
			{#if form?.passwordError}
				<div
					class="p-3 rounded-xl flex items-center gap-2 text-sm bg-error-container text-on-error-container"
				>
					<span class="material-symbols-outlined text-base shrink-0">error</span>
					{form.passwordError}
				</div>
			{/if}
			{#if form?.passwordSuccess}
				<div
					class="p-3 rounded-xl flex items-center gap-2 text-sm bg-primary-container text-on-primary-container"
				>
					<span class="material-symbols-outlined text-base shrink-0">check_circle</span>
					Password updated
				</div>
			{/if}
			<md-outlined-text-field
				name="currentPassword"
				type="password"
				label="Current password"
				required
				autocomplete="current-password"
				style="width: 100%"
			></md-outlined-text-field>
			<md-outlined-text-field
				name="newPassword"
				type="password"
				label="New password"
				required
				minlength={8}
				placeholder="Min. 8 characters"
				autocomplete="new-password"
				style="width: 100%"
			></md-outlined-text-field>
			<div class="flex justify-end">
				<md-filled-icon-button type="submit" disabled={passwordLoading || null} aria-label="Save">
					<span class="material-symbols-outlined">check</span>
				</md-filled-icon-button>
			</div>
		</form>
	</section>

	<!-- Leave home -->
	{#if data.hasHome}
		<section class="bg-surface rounded-[28px] shadow-sm overflow-hidden">
			<div class="px-5 py-4 border-b border-outline-variant bg-surface-container-high">
				<p class="text-sm font-medium text-on-surface">Home</p>
			</div>
			<div class="px-5 py-4">
				{#if leaveConfirm}
					<div class="flex items-center gap-3 flex-wrap">
						<p class="text-sm text-on-surface flex-1">Leave this home? This cannot be undone.</p>
						<form method="POST" action="?/leaveHome" use:enhance>
							<md-filled-button
								type="submit"
								style="--md-filled-button-container-color: var(--md-sys-color-error); --md-filled-button-label-text-color: var(--md-sys-color-on-error);"
								>Leave</md-filled-button
							>
						</form>
						<md-icon-button
							type="button"
							onclick={() => (leaveConfirm = false)}
							aria-label="Cancel"
						>
							<span class="material-symbols-outlined">close</span>
						</md-icon-button>
					</div>
				{:else}
					<button
						type="button"
						onclick={() => (leaveConfirm = true)}
						class="h-10 px-6 rounded-full border text-sm font-medium transition-colors"
						style="border-color: var(--md-sys-color-error); color: var(--md-sys-color-error)"
						>Leave home</button
					>
				{/if}
			</div>
		</section>
	{/if}
</main>
