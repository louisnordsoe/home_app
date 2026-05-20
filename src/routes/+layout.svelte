<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { enhance } from '$lib/enhance';
	import '../app.css';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import UserAvatar from '$lib/components/UserAvatar.svelte';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	const navLinks = [
		{ href: '/', label: 'Home', icon: 'home' },
		{ href: '/meal-plan', label: 'Meal Plan', icon: 'restaurant' },
		{ href: '/tasks', label: 'Tasks', icon: 'task_alt' },
		{ href: '/todos', label: 'To-do', icon: 'checklist' },
		{ href: '/stats', label: 'Stats', icon: 'bar_chart' },
		{ href: '/settings', label: 'Settings', icon: 'settings' }
	];

	let menuOpen = $state(false);

	onMount(() => {
		import('$lib/md3');
	});

	function closeMenu() {
		menuOpen = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if data.user?.homeId}
	<div class="min-h-screen bg-background flex flex-col">
		<!-- MD3 Top App Bar (small) -->
		<header class="bg-surface-container relative z-20">
			<div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span class="material-symbols-outlined text-primary">home</span>
					<span class="font-medium text-on-surface">{data.homeName ?? 'Home'}</span>
				</div>
				<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
				<md-icon-button onclick={() => (menuOpen = !menuOpen)} aria-label="Toggle menu">
					<span class="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
				</md-icon-button>
			</div>
		</header>

		{#if menuOpen}
			<!-- Scrim -->
			<div
				class="fixed inset-0 z-40"
				style="background: rgba(0,0,0,0.32)"
				role="presentation"
				onclick={closeMenu}
				onkeydown={(e) => e.key === 'Escape' && closeMenu()}
			></div>

			<!-- MD3 Modal Navigation Drawer (right side) -->
			<div
				class="fixed top-0 right-0 bottom-0 z-50 w-80 flex flex-col shadow-xl bg-surface-container-low"
				style="border-radius: 28px 0 0 28px"
			>
				<div class="h-16 flex items-center justify-end px-4">
					<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
					<md-icon-button onclick={closeMenu} aria-label="Close menu">
						<span class="material-symbols-outlined">close</span>
					</md-icon-button>
				</div>

				<div class="px-6 pb-5 flex items-center gap-3">
					<span class="material-symbols-outlined text-primary">home</span>
					<span class="font-medium text-on-surface">{data.homeName ?? 'Home'}</span>
				</div>

				<nav class="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
					{#each navLinks as link (link.href)}
						<a
							href={link.href}
							onclick={closeMenu}
							class="flex items-center gap-3 px-4 h-14 rounded-full text-sm no-underline transition-colors
							       {$page.url.pathname === link.href
								? 'bg-secondary-container text-on-secondary-container font-medium'
								: 'text-on-surface-variant hover:bg-surface-container-high'}"
						>
							<span class="material-symbols-outlined text-xl">{link.icon}</span>
							{link.label}
						</a>
					{/each}
				</nav>

				<div class="px-6 py-4 border-t border-outline-variant">
					<div class="flex items-center gap-3 mb-3">
						<UserAvatar
							userId={data.user.id}
							firstName={data.user.firstName}
							lastName={data.user.lastName}
						/>
						<div class="min-w-0">
							<p class="text-sm font-medium text-on-surface truncate">
								{data.user.firstName}
								{data.user.lastName}
							</p>
							<p class="text-xs text-on-surface-variant truncate">{data.user.email}</p>
						</div>
					</div>
					<form method="POST" action="/logout" use:enhance>
						<md-text-button type="submit">
							<span slot="icon" class="material-symbols-outlined">logout</span>
							Log out
						</md-text-button>
					</form>
				</div>
			</div>
		{/if}

		<div class="flex-1">
			{@render children()}
		</div>
	</div>
{:else}
	{@render children()}
{/if}
