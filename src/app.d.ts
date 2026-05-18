declare global {
	namespace App {
		interface Locals {
			user: { id: string; email: string; homeId?: string } | null;
		}
	}
}

export {};
