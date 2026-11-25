import { test, expect, Page } from '@playwright/test';
import { login, sel, SLUG, addItems, money } from '../helpers';

async function goToCheckoutStepOne(page: Page, ...slugs: string[]) {
  await addItems(page, ...slugs);
  await page.locator(sel.cartLink).click();
  await page.locator('[data-test="checkout"]').click();
  await expect(page).toHaveURL(/checkout-step-one\.html/);
}

async function fillInfo(page: Page, first = 'Lara', last = 'Fernandes', zip = '29100') {
  if (first) await page.locator('[data-test="firstName"]').fill(first);
  if (last) await page.locator('[data-test="lastName"]').fill(last);
  if (zip) await page.locator('[data-test="postalCode"]').fill(zip);
}

const error = (page: Page) => page.locator('[data-test="error"]');

test.describe('RF03 - Fluxo de Checkout', () => {
  test.beforeEach(async ({ page }) => login(page));

  // CT-CEN-RF03-01
  test('RF03-CHK001: avançar com todos os campos em branco', async ({ page }) => {
    await goToCheckoutStepOne(page, SLUG.backpack);
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(error(page)).toHaveText('Error: First Name is required');
    await expect(page.locator('[data-test="firstName"]')).toHaveClass(/input_error/);
  });

  test('RF03-CHK002: avançar sem preencher Sobrenome', async ({ page }) => {
    await goToCheckoutStepOne(page, SLUG.backpack);
    await fillInfo(page, 'Lara', '', '29100');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(error(page)).toHaveText('Error: Last Name is required');
  });

  test('RF03-CHK003: avançar sem preencher Zip/Postal Code', async ({ page }) => {
    await goToCheckoutStepOne(page, SLUG.backpack);
    await fillInfo(page, 'Lara', 'Fernandes', '');
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(error(page)).toHaveText('Error: Postal Code is required');
  });

  test('RF03-CHK004: cancelar checkout e retornar ao carrinho', async ({ page }) => {
    await goToCheckoutStepOne(page, SLUG.backpack);
    await page.locator('[data-test="cancel"]').click();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator(sel.cartItem)).toHaveCount(1);
  });

  // CT-CEN-RF03-02
  test('RF03-CHK005: cálculo financeiro com item único', async ({ page }) => {
    await goToCheckoutStepOne(page, SLUG.backpack);
    await fillInfo(page);
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    expect(money(await page.locator('[data-test="subtotal-label"]').innerText())).toBe(29.99);
    expect(money(await page.locator('[data-test="tax-label"]').innerText())).toBe(2.4);
    expect(money(await page.locator('[data-test="total-label"]').innerText())).toBe(32.39);
  });

  test('RF03-CHK006: cálculo financeiro com múltiplos itens', async ({ page }) => {
    await goToCheckoutStepOne(page, SLUG.backpack, SLUG.bikeLight);
    await fillInfo(page);
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    const subtotal = money(await page.locator('[data-test="subtotal-label"]').innerText());
    const tax = money(await page.locator('[data-test="tax-label"]').innerText());
    const total = money(await page.locator('[data-test="total-label"]').innerText());
    expect(subtotal).toBe(39.98);
    expect(tax).toBe(3.2);
    expect(total).toBe(43.18);
    expect(+(subtotal + tax).toFixed(2)).toBe(total); // consistência interna
  });

  // CT-CEN-RF03-03
  test('RF03-CHK007: concluir compra com sucesso (Happy Path)', async ({ page }) => {
    await goToCheckoutStepOne(page, SLUG.backpack);
    await fillInfo(page);
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText(/thank you for your order/i);
    await expect(page.locator('[data-test="pony-express"]')).toBeVisible();
    await expect(page.locator(sel.badge)).toHaveCount(0);
  });

  test('RF03-CHK008: retorno à vitrine após conclusão', async ({ page }) => {
    await goToCheckoutStepOne(page, SLUG.backpack);
    await fillInfo(page);
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator(sel.badge)).toHaveCount(0);
    await expect(page.locator('[data-test^="add-to-cart-"]')).toHaveCount(6);
    await expect(page.locator('[data-test^="remove-"]')).toHaveCount(0);
  });
});

// Teste exploratório EXTRA (não está no documento da Entrega 2)
test.describe('Exploratório', () => {
  test('EXTRA-01: checkout não deveria ser possível com carrinho vazio', async ({ page }) => {
    await login(page);
    await page.locator(sel.cartLink).click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).not.toHaveURL(/checkout-step-one\.html/);
  });
});
