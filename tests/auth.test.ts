import { test, expect } from '@playwright/test';

// Unique email per test run so repeated runs don't collide.
const email = () => `test_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
const PASSWORD = 'testpass123';

test.describe('login page', () => {
	test('submit button is enabled on load', async ({ page }) => {
		await page.goto('/login');
		const btn = page.locator('md-filled-button[type="submit"]');
		await expect(btn).toHaveJSProperty('disabled', false);
	});

	test('signup creates account and redirects to /setup', async ({ page }) => {
		await page.goto('/login');
		await page.getByRole('button', { name: 'Sign up' }).click();

		await page.locator('md-outlined-text-field[name="email"]').click();
		await page.keyboard.type(email());
		await page.locator('md-outlined-text-field[name="password"]').click();
		await page.keyboard.type(PASSWORD);

		await page.locator('md-filled-button[type="submit"]').click();
		await expect(page).toHaveURL(/\/setup/);
	});

	test('login with valid credentials redirects to /setup', async ({ page }) => {
		const e = email();

		// Create account first.
		await page.goto('/login');
		await page.getByRole('button', { name: 'Sign up' }).click();
		await page.locator('md-outlined-text-field[name="email"]').click();
		await page.keyboard.type(e);
		await page.locator('md-outlined-text-field[name="password"]').click();
		await page.keyboard.type(PASSWORD);
		await page.locator('md-filled-button[type="submit"]').click();
		await expect(page).toHaveURL(/\/setup/);

		// Log out by clearing cookies, then log back in.
		await page.context().clearCookies();
		await page.goto('/login');

		await page.locator('md-outlined-text-field[name="email"]').click();
		await page.keyboard.type(e);
		await page.locator('md-outlined-text-field[name="password"]').click();
		await page.keyboard.type(PASSWORD);
		await page.locator('md-filled-button[type="submit"]').click();
		await expect(page).toHaveURL(/\/setup/);
	});

	test('login with wrong password shows error', async ({ page }) => {
		const e = email();

		await page.goto('/login');
		await page.getByRole('button', { name: 'Sign up' }).click();
		await page.locator('md-outlined-text-field[name="email"]').click();
		await page.keyboard.type(e);
		await page.locator('md-outlined-text-field[name="password"]').click();
		await page.keyboard.type(PASSWORD);
		await page.locator('md-filled-button[type="submit"]').click();
		await expect(page).toHaveURL(/\/setup/);

		await page.context().clearCookies();
		await page.goto('/login');

		await page.locator('md-outlined-text-field[name="email"]').click();
		await page.keyboard.type(e);
		await page.locator('md-outlined-text-field[name="password"]').click();
		await page.keyboard.type('wrongpassword');
		await page.locator('md-filled-button[type="submit"]').click();
		await expect(page.locator('[class*="error-container"]')).toContainText(
			'Invalid email or password'
		);
	});

	test('signup with duplicate email shows error', async ({ page }) => {
		const e = email();

		await page.goto('/login');
		await page.getByRole('button', { name: 'Sign up' }).click();
		await page.locator('md-outlined-text-field[name="email"]').click();
		await page.keyboard.type(e);
		await page.locator('md-outlined-text-field[name="password"]').click();
		await page.keyboard.type(PASSWORD);
		await page.locator('md-filled-button[type="submit"]').click();
		await expect(page).toHaveURL(/\/setup/);

		await page.context().clearCookies();
		await page.goto('/login');
		await page.getByRole('button', { name: 'Sign up' }).click();
		await page.locator('md-outlined-text-field[name="email"]').click();
		await page.keyboard.type(e);
		await page.locator('md-outlined-text-field[name="password"]').click();
		await page.keyboard.type(PASSWORD);
		await page.locator('md-filled-button[type="submit"]').click();
		await expect(page.locator('[class*="error-container"]')).toContainText(
			'An account with this email already exists'
		);
	});
});
