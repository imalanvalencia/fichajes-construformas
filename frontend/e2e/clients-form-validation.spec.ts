import { test, expect } from '@playwright/test';

const USERS = {
  valid: { email: 'test@test.com', password: 'password123' },
};

async function generateJwt(payload: Record<string, unknown>): Promise<string> {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = 'fakesignature';
  return `${header}.${body}.${signature}`;
}

async function openNewClientModal(page: import('@playwright/test').Page) {
  await page.click('button:has-text("+ Nuevo Cliente")');
  await expect(page.locator('h2:has-text("Nuevo Cliente")')).toBeVisible();
}

test.describe('Clientes - Validacion de formularios e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/api/auth/login')) {
        const token = await generateJwt({
          email: 'test@test.com',
          roles: ['OPERATOR'],
          name: 'Test User',
        });
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            accessToken: token,
            refreshToken: 'refresh-token',
            email: 'test@test.com',
            roles: ['OPERATOR'],
            name: 'Test User',
          }),
        });
      } else if (url.includes('/api/clients')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      }
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(USERS.valid.email);
    await page.getByLabel('Password').fill(USERS.valid.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/');
    await page.goto('/clients');
  });

  test('muestra error al ingresar email invalido', async ({ page }) => {
    await openNewClientModal(page);

    const emailInput = page.getByLabel('Email');
    await emailInput.fill('x');
    await emailInput.fill('invalid-email');
    await page.waitForTimeout(300);

    const error = page.getByText(/email no tiene un formato/i);
    await expect(error).toBeVisible({ timeout: 5000 });
  });

  test('oculta error al corregir email a uno valido', async ({ page }) => {
    await openNewClientModal(page);

    const emailInput = page.getByLabel('Email');
    await emailInput.fill('x');
    await emailInput.fill('invalid-email');
    await page.waitForTimeout(300);

    const error = page.getByText(/email no tiene un formato/i);
    await expect(error).toBeVisible({ timeout: 5000 });

    await emailInput.fill('test@test.com');
    await expect(error).not.toBeVisible({ timeout: 3000 });
  });

  test('muestra error al dejar nombre vacio', async ({ page }) => {
    await openNewClientModal(page);

    const nameInput = page.getByLabel('Nombre *');
    // Write something first, then clear - so the input event fires with empty value
    await nameInput.fill('x');
    await nameInput.fill('');
    await page.waitForTimeout(300);

    const error = page.getByText('El nombre es obligatorio.');
    await expect(error).toBeVisible({ timeout: 5000 });
  });

  test('permite guardar cuando todos los campos son validos', async ({ page }) => {
    await openNewClientModal(page);

    await page.getByLabel('Nombre *').fill('Nuevo Cliente');
    await page.getByLabel('Email').fill('nuevo@test.com');
    await page.waitForTimeout(300);

    await expect(page.getByText('El nombre es obligatorio.')).not.toBeVisible();
    await expect(page.getByText(/email no tiene un formato/i)).not.toBeVisible();

    await page.locator('app-button:has-text("Crear")').click();
  });
});
