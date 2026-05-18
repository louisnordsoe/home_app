<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import '../app.css';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

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
		{ href: '/stats', label: 'Stats', icon: 'bar_chart' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if data.user?.homeId}
	<div class="min-h-screen bg-gray-50 flex flex-col">
		<header class="bg-white border-b border-gray-200">
			<div class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span class="material-symbols-outlined text-indigo-600">home</span>
					<span class="font-semibold text-gray-900">{data.homeName ?? 'Home'}</span>
				</div>
				<div class="flex items-center gap-3">
					<span class="text-sm text-gray-400 hidden sm:block">{data.user.email}</span>
					<form method="POST" action="/logout" use:enhance>
						<button
							type="submit"
							class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
						>
							<span class="material-symbols-outlined text-base">logout</span>
							<span class="hidden sm:block">Log out</span>
						</button>
					</form>
				</div>
			</div>
			<nav class="max-w-3xl mx-auto px-4 flex gap-1 pb-2">
				{#each navLinks as link}
					<a
						href={link.href}
						class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors
						       {$page.url.pathname === link.href
							       ? 'bg-indigo-50 text-indigo-700 font-medium'
							       : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}"
					>
						<span class="material-symbols-outlined text-base">{link.icon}</span>
						{link.label}
					</a>
				{/each}
			</nav>
		</header>
		<div class="flex-1">
			{@render children()}
		</div>
	</div>
{:else}
	{@render children()}
{/if}
