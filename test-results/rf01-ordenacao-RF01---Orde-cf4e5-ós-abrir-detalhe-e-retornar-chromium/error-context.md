# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rf01-ordenacao.spec.ts >> RF01 - Ordenação e Filtro de Produtos >> RF01-ORD006: manter ordenação após abrir detalhe e retornar
- Location: tests\rf01-ordenacao.spec.ts:68:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  locator('[data-test="product-sort-container"]')
Expected: "lohi"
Received: "az"
Timeout:  5000ms

Call log:
  - Expect "toHaveValue" locator('[data-test="product-sort-container"]') with timeout 5000ms
  - waiting for locator('[data-test="product-sort-container"]')
    14 × locator resolved to <select aria-label="Sort products" class="product_sort_container" data-test="product-sort-container">…</select>
       - unexpected value "az"

```

```yaml
- combobox "Sort products":
  - option "Name (A to Z)" [selected]
  - option "Name (Z to A)"
  - option "Price (low to high)"
  - option "Price (high to low)"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { login, sel, getNames, getPrices } from '../helpers';
  3  | 
  4  | test.describe('RF01 - Ordenação e Filtro de Produtos', () => {
  5  |   test.beforeEach(async ({ page }) => login(page));
  6  | 
  7  |   // CT-CEN-RF01-01
  8  |   test('RF01-ORD001: ordenar por Nome (A a Z)', async ({ page }) => {
  9  |     await page.locator(sel.sort).selectOption('az');
  10 |     const names = await getNames(page);
  11 |     expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  12 |     expect(names[0]).toBe('Sauce Labs Backpack');
  13 |     expect(names.at(-1)).toBe('Test.allTheThings() T-Shirt (Red)');
  14 |   });
  15 | 
  16 |   test('RF01-ORD002: ordenar por Nome (Z a A)', async ({ page }) => {
  17 |     await page.locator(sel.sort).selectOption('za');
  18 |     const names = await getNames(page);
  19 |     expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  20 |     expect(names[0]).toBe('Test.allTheThings() T-Shirt (Red)');
  21 |     expect(names.at(-1)).toBe('Sauce Labs Backpack');
  22 |   });
  23 | 
  24 |   // CT-CEN-RF01-02
  25 |   test('RF01-ORD003: ordenar por Preço (menor para maior)', async ({ page }) => {
  26 |     await page.locator(sel.sort).selectOption('lohi');
  27 |     const prices = await getPrices(page);
  28 |     expect(prices).toEqual([...prices].sort((a, b) => a - b));
  29 |     expect(prices[0]).toBe(7.99);
  30 |     expect(prices.at(-1)).toBe(49.99);
  31 |     const names = await getNames(page);
  32 |     expect(names[0]).toContain('Onesie');
  33 |     expect(names.at(-1)).toContain('Fleece Jacket');
  34 |   });
  35 | 
  36 |   test('RF01-ORD004: ordenar por Preço (maior para menor)', async ({ page }) => {
  37 |     await page.locator(sel.sort).selectOption('hilo');
  38 |     const prices = await getPrices(page);
  39 |     expect(prices).toEqual([...prices].sort((a, b) => b - a));
  40 |     expect(prices[0]).toBe(49.99);
  41 |     expect(prices.at(-1)).toBe(7.99);
  42 |     const names = await getNames(page);
  43 |     expect(names[0]).toContain('Fleece Jacket');
  44 |     expect(names.at(-1)).toContain('Onesie');
  45 |   });
  46 | 
  47 |   // CT-CEN-RF01-03
  48 |   test('RF01-ORD005: consistência entre seletor e listagem após recarregar (F5)', async ({ page }) => {
  49 |     await page.locator(sel.sort).selectOption('lohi');
  50 |     await page.reload();
  51 | 
  52 |     // Critério do documento: rótulo do seletor e listagem devem ser coerentes.
  53 |     const value = await page.locator(sel.sort).inputValue();
  54 |     const prices = await getPrices(page);
  55 |     const names = await getNames(page);
  56 | 
  57 |     if (value === 'lohi') {
  58 |       expect(prices).toEqual([...prices].sort((a, b) => a - b));
  59 |     } else if (value === 'az') {
  60 |       expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  61 |     } else {
  62 |       throw new Error(`Seletor em estado inesperado após F5: ${value}`);
  63 |     }
  64 |     // Registra o comportamento observado no relatório
  65 |     test.info().annotations.push({ type: 'observado', description: `Seletor após F5 = "${value}"` });
  66 |   });
  67 | 
  68 |   test('RF01-ORD006: manter ordenação após abrir detalhe e retornar', async ({ page }) => {
  69 |     await page.locator(sel.sort).selectOption('lohi');
  70 |     await page.locator(sel.itemName).first().click();
  71 |     await expect(page).toHaveURL(/inventory-item\.html/);
  72 |     await page.locator('[data-test="back-to-products"]').click();
  73 |     await expect(page).toHaveURL(/inventory\.html/);
  74 | 
  75 |     // Esperado pelo documento: ordenação por menor preço preservada
> 76 |     await expect(page.locator(sel.sort)).toHaveValue('lohi');
     |                                          ^ Error: expect(locator).toHaveValue(expected) failed
  77 |     const prices = await getPrices(page);
  78 |     expect(prices).toEqual([...prices].sort((a, b) => a - b));
  79 |   });
  80 | });
  81 | 
```