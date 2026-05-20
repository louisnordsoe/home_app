const COLORS = [
	'#6750A4',
	'#B5264C',
	'#006874',
	'#6D5E0F',
	'#146C2E',
	'#984061',
	'#1B6CA8',
	'#7B4F00'
];

export function userColor(userId: string): string {
	let hash = 0;
	for (let i = 0; i < userId.length; i++) {
		hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
	}
	return COLORS[hash % COLORS.length];
}

export function userInitials(firstName: string, lastName: string): string {
	return ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase();
}
