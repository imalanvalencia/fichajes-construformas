import { test, expect } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import * as path from 'node:path';

const USERS = {
  valid: { email: 'test@test.com', password: 'password123' },
};

const BUDGET = {
  id: 1,
  projectId: 1,
  projectName: 'Reforma Baño',
  version: 1,
  budgetType: 'ORIGINAL',
  status: 'DRAFT',
  totalAmount: 1000,
  discountAmount: 50,
  finalAmount: 1160,
  includesIva: true,
  validUntil: '2026-12-31',
  notes: 'Notas del presupuesto',
  paymentTerms: '50% anticipo',
  termsConditions: 'Condiciones generales',
  createdById: 1,
  createdByName: 'Test User',
  project: {
    id: 1,
    name: 'Reforma Baño',
    clientName: 'Cliente E2E',
    address: 'Calle Falsa 123',
  },
};

const ITEMS = [
  { id: 10, budgetId: 1, zone: 'Baño', description: 'Demolición', unit: 'ud', quantity: 1, unitPrice: 300, totalPrice: 300, orderNum: 1 },
  { id: 11, budgetId: 1, zone: 'Baño', description: 'Azulejos', unit: 'm2', quantity: 20, unitPrice: 35, totalPrice: 700, orderNum: 2 },
];

// Minimal PDF payload: enough for the browser to treat it as a real download.
const PDF_BYTES = Buffer.from(
  '%PDF-1.4\n' +
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\n' +
    'trailer<</Root 1 0 R>>\n' +
    '%%EOF\n',
  'latin1',
);

const OUTPUT_DIR = path.resolve(__dirname, '../e2e-output');
const OUTPUT_PDF = path.join(OUTPUT_DIR, 'presupuesto-1.pdf');

async function generateJwt(payload: Record<string, unknown>): Promise<string> {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = 'fakesignature';
  return `${header}.${body}.${signature}`;
}

test.describe('Presupuestos - Descarga de PDF e2e', () => {
  test.beforeEach(async ({ page }) => {
    // Single dispatching handler: no route-ordering ambiguity.
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      const json = (body: unknown) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

      if (url.includes('/api/auth/login')) {
        const token = await generateJwt({
          email: 'test@test.com',
          roles: ['OPERATOR'],
          name: 'Test User',
        });
        return json({
          accessToken: token,
          refreshToken: 'refresh-token',
          email: 'test@test.com',
          roles: ['OPERATOR'],
          name: 'Test User',
        });
      }

      if (url.includes('/pdf')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/pdf',
          headers: { 'content-disposition': 'attachment; filename="presupuesto-1.pdf"' },
          body: PDF_BYTES,
        });
      }

      // GET /api/budgets/{id}/items
      if (/\/api\/budgets\/\d+\/items$/.test(url)) return json(ITEMS);

      // GET /api/budgets/{id}
      if (/\/api\/budgets\/\d+$/.test(url)) return json(BUDGET);

      // GET /api/budgets (list)
      if (/\/api\/budgets\/?$/.test(url)) return json([BUDGET]);

      if (url.includes('/api/clients')) return json([]);

      return json({});
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill(USERS.valid.email);
    await page.getByLabel('Password').fill(USERS.valid.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/');
    await page.goto('/budgets/1/editor');
    await expect(page.locator('app-button:has-text("Previsualizar PDF")')).toBeVisible();
  });

  test('descarga el PDF y lo guarda en e2e-output/presupuesto-1.pdf', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('app-button:has-text("Previsualizar PDF")').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('presupuesto-1.pdf');

    mkdirSync(OUTPUT_DIR, { recursive: true });
    await download.saveAs(OUTPUT_PDF);

    const bytes = readFileSync(OUTPUT_PDF);
    expect(bytes.length).toBeGreaterThan(0);
    expect(bytes.subarray(0, 8).toString('latin1')).toBe('%PDF-1.4');

    console.log(`[e2e] PDF generado en: ${OUTPUT_PDF} (${bytes.length} bytes)`);
  });
});
