import { Page, expect } from '@playwright/test';

// Usuário padrão; troque com: SAUCE_USER=problem_user npx playwright test
export const USER = process.env.SAUCE_USER ?? 'standard_user';
export const PASSWORD = 'secret_sauce';

export const SLUG = {
  backpack: 'sauce-labs-backpack',
  bikeLight: 'sauce-labs-bike-light',
  boltShirt: 'sauce-labs-bolt-t-shirt',
  fleece: 'sauce-labs-fleece-jacket',
  onesie: 'sauce-labs-onesie',
  redShirt: 'test.allthethings()-t-shirt-(red)',
} as const;

export const sel = {
  sort: '[data-test="product-sort-container"]',
  itemName: '[data-test="inventory-item-name"]',
  itemPrice: '[data-test="inventory-item-price"]',
  badge: '[data-test="shopping-cart-badge"]',
  cartLink: '[data-test="shopping-cart-link"]',
  cartItem: '[data-test="inventory-item"]',
};

export const add = (page: Page, slug: string) => page.locator(`[data-test="add-to-cart-${slug}"]`);
export const remove = (page: Page, slug: string) => page.locator(`[data-test="remove-${slug}"]`);

export async function login(page: Page) {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill(USER);
  await page.locator('[data-test="password"]').fill(PASSWORD);
  await page.locator('[data-test="login-button"]').click();
  await expect(page).toHaveURL(/inventory\.html/);
}

export async function addItems(page: Page, ...slugs: string[]) {
  for (const s of slugs) await add(page, s).click();
}

export const getNames = (page: Page) => page.locator(sel.itemName).allTextContents();

export async function getPrices(page: Page): Promise<number[]> {
  const raw = await page.locator(sel.itemPrice).allTextContents();
  return raw.map((p) => parseFloat(p.replace('$', '')));
}

export const money = (text: string) => parseFloat(text.match(/\$([\d.]+)/)![1]);
