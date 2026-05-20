<script lang="ts">
	import { userColor, userInitials } from '$lib/userColor';

	interface Props {
		userId: string;
		firstName: string;
		lastName: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { userId, firstName, lastName, size = 'md' }: Props = $props();

	const color = $derived(userColor(userId));
	const initials = $derived(userInitials(firstName, lastName));
</script>

<div
	class="rounded-full flex items-center justify-center font-semibold text-white shrink-0
	       {size === 'sm'
		? 'w-7 h-7 text-xs'
		: size === 'lg'
			? 'w-11 h-11 text-base'
			: 'w-8 h-8 text-xs'}"
	style="background-color: {color}"
	title="{firstName} {lastName}"
>
	{initials}
</div>
