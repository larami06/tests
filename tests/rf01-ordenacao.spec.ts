import { test, expect } from '@playwright/test';
import { login, sel, getNames, getPrices } from '../helpers';

test.describe('RF01 - Ordenação e Filtro de Produtos', () => {
  test.beforeEach(async ({ page }) => login(page));

  // CT-CEN-RF01-01
  test('RF01-ORD001: ordenar por Nome (A a Z)', async ({ page }) => {
    await page.locator(sel.sort).selectOption('az');
    const names = await getNames(page);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(names[0]).toBe('Sauce Labs Backpack');
    expect(names.at(-1)).toBe('Test.allTheThings() T-Shirt (Red)');
  });

  test('RF01-ORD002: ordenar por Nome (Z a A)', async ({ page }) => {
    await page.locator(sel.sort).selectOption('za');
    const names = await getNames(page);
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
    expect(names[0]).toBe('Test.allTheThings() T-Shirt (Red)');
    expect(names.at(-1)).toBe('Sauce Labs Backpack');
  });

  // CT-CEN-RF01-02
  test('RF01-ORD003: ordenar por Preço (menor para maior)', async ({ page }) => {
    await page.locator(sel.sort).selectOption('lohi');
    const prices = await getPrices(page);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(prices[0]).toBe(7.99);
    expect(prices.at(-1)).toBe(49.99);
    const names = await getNames(page);
    expect(names[0]).toContain('Onesie');
    expect(names.at(-1)).toContain('Fleece Jacket');
  });

  test('RF01-ORD004: ordenar por Preço (maior para menor)', async ({ page }) => {
    await page.locator(sel.sort).selectOption('hilo');
    const prices = await getPrices(page);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
    expect(prices[0]).toBe(49.99);
    expect(prices.at(-1)).toBe(7.99);
    const names = await getNames(page);
    expect(names[0]).toContain('Fleece Jacket');
    expect(names.at(-1)).toContain('Onesie');
  });

  // CT-CEN-RF01-03
  test('RF01-ORD005: consistência entre seletor e listagem após recarregar (F5)', async ({ page }) => {
    await page.locator(sel.sort).selectOption('lohi');
    await page.reload();

    // Critério do documento: rótulo do seletor e listagem devem ser coerentes.
    const value = await page.locator(sel.sort).inputValue();
    const prices = await getPrices(page);
    const names = await getNames(page);

    if (value === 'lohi') {
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    } else if (value === 'az') {
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    } else {
      throw new Error(`Seletor em estado inesperado após F5: ${value}`);
    }
    // Registra o comportamento observado no relatório
    test.info().annotations.push({ type: 'observado', description: `Seletor após F5 = "${value}"` });
  });

  test('RF01-ORD006: manter ordenação após abrir detalhe e retornar', async ({ page }) => {
    await page.locator(sel.sort).selectOption('lohi');
    await page.locator(sel.itemName).first().click();
    await expect(page).toHaveURL(/inventory-item\.html/);
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/inventory\.html/);

    // Esperado pelo documento: ordenação por menor preço preservada
    await expect(page.locator(sel.sort)).toHaveValue('lohi');
    const prices = await getPrices(page);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
