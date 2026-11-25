import { test, expect } from '@playwright/test';
import { login, sel, SLUG, add, remove, addItems } from '../helpers';

const ALL = Object.values(SLUG);

test.describe('RF02 - Gestão de Itens no Carrinho', () => {
  test.beforeEach(async ({ page }) => login(page));

  // CT-CEN-RF02-01
  test('RF02-CAR001: adicionar um único produto pela vitrine', async ({ page }) => {
    await add(page, SLUG.backpack).click();
    await expect(remove(page, SLUG.backpack)).toBeVisible();
    await expect(page.locator(sel.badge)).toHaveText('1');
  });

  test('RF02-CAR002: adicionar múltiplos produtos consecutivamente', async ({ page }) => {
    const trio = [SLUG.backpack, SLUG.bikeLight, SLUG.boltShirt];
    let n = 0;
    for (const s of trio) {
      await add(page, s).click();
      n++;
      await expect(remove(page, s)).toBeVisible();
      await expect(page.locator(sel.badge)).toHaveText(String(n));
    }
  });

  test('RF02-CAR003: adicionar a totalidade do catálogo (6 itens)', async ({ page }) => {
    await addItems(page, ...ALL);
    for (const s of ALL) await expect(remove(page, s)).toBeVisible();
    await expect(page.locator(sel.badge)).toHaveText('6');
  });

  // CT-CEN-RF02-02
  test('RF02-CAR004: remover produto diretamente pelo catálogo', async ({ page }) => {
    await add(page, SLUG.backpack).click();
    await expect(page.locator(sel.badge)).toHaveText('1');
    await remove(page, SLUG.backpack).click();
    await expect(add(page, SLUG.backpack)).toBeVisible();
    await expect(page.locator(sel.badge)).toHaveCount(0);
  });

  test('RF02-CAR005: remover produto pela página /cart.html', async ({ page }) => {
    await addItems(page, SLUG.backpack, SLUG.bikeLight);
    await page.locator(sel.cartLink).click();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator(sel.cartItem)).toHaveCount(2);
    await page.locator('[data-test^="remove-"]').first().click();
    await expect(page.locator(sel.cartItem)).toHaveCount(1);
    await expect(page.locator(sel.badge)).toHaveText('1');
  });

  test('RF02-CAR006: esvaziar o carrinho completamente', async ({ page }) => {
    await add(page, SLUG.backpack).click();
    await page.locator(sel.cartLink).click();
    await page.locator('[data-test^="remove-"]').first().click();
    await expect(page.locator(sel.cartItem)).toHaveCount(0);
    await expect(page.locator(sel.badge)).toHaveCount(0);
    // navegação continua funcional
    await page.locator('[data-test="continue-shopping"]').click();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  // CT-CEN-RF02-03
  test('RF02-CAR007: adicionar item pela página de detalhes', async ({ page }) => {
    await page.locator(sel.itemName).first().click(); // Backpack (ordem padrão A-Z)
    await expect(page).toHaveURL(/inventory-item\.html/);
    await page.locator('[data-test="add-to-cart"]').click();
    await expect(page.locator('[data-test="remove"]')).toBeVisible();
    await expect(page.locator(sel.badge)).toHaveText('1');
    await page.locator('[data-test="back-to-products"]').click();
    await expect(remove(page, SLUG.backpack)).toBeVisible();
  });

  test('RF02-CAR008: persistência dos itens durante a navegação', async ({ page }) => {
    await addItems(page, SLUG.backpack, SLUG.bikeLight);
    await page.locator(sel.cartLink).click();
    const before = await page.locator(sel.cartItem).allTextContents();
    await page.locator('[data-test="continue-shopping"]').click();
    await page.locator(sel.cartLink).click();
    const after = await page.locator(sel.cartItem).allTextContents();
    expect(after).toEqual(before);
    await expect(page.locator(sel.cartItem)).toHaveCount(2);
    await expect(page.locator(sel.badge)).toHaveText('2');
  });
});
