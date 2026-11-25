# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: rf03-checkout.spec.ts >> Exploratório >> EXTRA-01: checkout não deveria ser possível com carrinho vazio
- Location: tests\rf03-checkout.spec.ts:108:3

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /checkout-step-one\.html/
Received string: "https://www.saucedemo.com/checkout-step-one.html"
Timeout: 5000ms

Call log:
  - Expect "not toHaveURL" with timeout 5000ms
    14 × locator resolved to <html lang="en">…</html>
       - unexpected value "https://www.saucedemo.com/checkout-step-one.html"

```

```yaml
- banner:
  - button "Open Menu"
  - img "Open Menu"
  - text: Swag Labs
  - button "Cart, empty"
  - text: "Checkout: Your Information"
- main:
  - form "Checkout information":
    - textbox "First Name"
    - textbox "Last Name"
    - textbox "Zip/Postal Code"
    - button "Cancel"
    - button "Continue"
- contentinfo:
  - list:
    - listitem:
      - link "X":
        - /url: https://x.com/saucelabs
    - listitem:
      - link "Facebook":
        - /url: https://www.facebook.com/saucelabs
    - listitem:
      - link "LinkedIn":
        - /url: https://www.linkedin.com/company/sauce-labs/
  - text: © 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy
```

# Test source

```ts
  12  |   if (first) await page.locator('[data-test="firstName"]').fill(first);
  13  |   if (last) await page.locator('[data-test="lastName"]').fill(last);
  14  |   if (zip) await page.locator('[data-test="postalCode"]').fill(zip);
  15  | }
  16  | 
  17  | const error = (page: Page) => page.locator('[data-test="error"]');
  18  | 
  19  | test.describe('RF03 - Fluxo de Checkout', () => {
  20  |   test.beforeEach(async ({ page }) => login(page));
  21  | 
  22  |   // CT-CEN-RF03-01
  23  |   test('RF03-CHK001: avançar com todos os campos em branco', async ({ page }) => {
  24  |     await goToCheckoutStepOne(page, SLUG.backpack);
  25  |     await page.locator('[data-test="continue"]').click();
  26  |     await expect(page).toHaveURL(/checkout-step-one\.html/);
  27  |     await expect(error(page)).toHaveText('Error: First Name is required');
  28  |     await expect(page.locator('[data-test="firstName"]')).toHaveClass(/input_error/);
  29  |   });
  30  | 
  31  |   test('RF03-CHK002: avançar sem preencher Sobrenome', async ({ page }) => {
  32  |     await goToCheckoutStepOne(page, SLUG.backpack);
  33  |     await fillInfo(page, 'Lara', '', '29100');
  34  |     await page.locator('[data-test="continue"]').click();
  35  |     await expect(page).toHaveURL(/checkout-step-one\.html/);
  36  |     await expect(error(page)).toHaveText('Error: Last Name is required');
  37  |   });
  38  | 
  39  |   test('RF03-CHK003: avançar sem preencher Zip/Postal Code', async ({ page }) => {
  40  |     await goToCheckoutStepOne(page, SLUG.backpack);
  41  |     await fillInfo(page, 'Lara', 'Fernandes', '');
  42  |     await page.locator('[data-test="continue"]').click();
  43  |     await expect(page).toHaveURL(/checkout-step-one\.html/);
  44  |     await expect(error(page)).toHaveText('Error: Postal Code is required');
  45  |   });
  46  | 
  47  |   test('RF03-CHK004: cancelar checkout e retornar ao carrinho', async ({ page }) => {
  48  |     await goToCheckoutStepOne(page, SLUG.backpack);
  49  |     await page.locator('[data-test="cancel"]').click();
  50  |     await expect(page).toHaveURL(/cart\.html/);
  51  |     await expect(page.locator(sel.cartItem)).toHaveCount(1);
  52  |   });
  53  | 
  54  |   // CT-CEN-RF03-02
  55  |   test('RF03-CHK005: cálculo financeiro com item único', async ({ page }) => {
  56  |     await goToCheckoutStepOne(page, SLUG.backpack);
  57  |     await fillInfo(page);
  58  |     await page.locator('[data-test="continue"]').click();
  59  |     await expect(page).toHaveURL(/checkout-step-two\.html/);
  60  | 
  61  |     expect(money(await page.locator('[data-test="subtotal-label"]').innerText())).toBe(29.99);
  62  |     expect(money(await page.locator('[data-test="tax-label"]').innerText())).toBe(2.4);
  63  |     expect(money(await page.locator('[data-test="total-label"]').innerText())).toBe(32.39);
  64  |   });
  65  | 
  66  |   test('RF03-CHK006: cálculo financeiro com múltiplos itens', async ({ page }) => {
  67  |     await goToCheckoutStepOne(page, SLUG.backpack, SLUG.bikeLight);
  68  |     await fillInfo(page);
  69  |     await page.locator('[data-test="continue"]').click();
  70  |     await expect(page).toHaveURL(/checkout-step-two\.html/);
  71  | 
  72  |     const subtotal = money(await page.locator('[data-test="subtotal-label"]').innerText());
  73  |     const tax = money(await page.locator('[data-test="tax-label"]').innerText());
  74  |     const total = money(await page.locator('[data-test="total-label"]').innerText());
  75  |     expect(subtotal).toBe(39.98);
  76  |     expect(tax).toBe(3.2);
  77  |     expect(total).toBe(43.18);
  78  |     expect(+(subtotal + tax).toFixed(2)).toBe(total); // consistência interna
  79  |   });
  80  | 
  81  |   // CT-CEN-RF03-03
  82  |   test('RF03-CHK007: concluir compra com sucesso (Happy Path)', async ({ page }) => {
  83  |     await goToCheckoutStepOne(page, SLUG.backpack);
  84  |     await fillInfo(page);
  85  |     await page.locator('[data-test="continue"]').click();
  86  |     await page.locator('[data-test="finish"]').click();
  87  |     await expect(page).toHaveURL(/checkout-complete\.html/);
  88  |     await expect(page.locator('[data-test="complete-header"]')).toHaveText(/thank you for your order/i);
  89  |     await expect(page.locator('[data-test="pony-express"]')).toBeVisible();
  90  |     await expect(page.locator(sel.badge)).toHaveCount(0);
  91  |   });
  92  | 
  93  |   test('RF03-CHK008: retorno à vitrine após conclusão', async ({ page }) => {
  94  |     await goToCheckoutStepOne(page, SLUG.backpack);
  95  |     await fillInfo(page);
  96  |     await page.locator('[data-test="continue"]').click();
  97  |     await page.locator('[data-test="finish"]').click();
  98  |     await page.locator('[data-test="back-to-products"]').click();
  99  |     await expect(page).toHaveURL(/inventory\.html/);
  100 |     await expect(page.locator(sel.badge)).toHaveCount(0);
  101 |     await expect(page.locator('[data-test^="add-to-cart-"]')).toHaveCount(6);
  102 |     await expect(page.locator('[data-test^="remove-"]')).toHaveCount(0);
  103 |   });
  104 | });
  105 | 
  106 | // Teste exploratório EXTRA (não está no documento da Entrega 2)
  107 | test.describe('Exploratório', () => {
  108 |   test('EXTRA-01: checkout não deveria ser possível com carrinho vazio', async ({ page }) => {
  109 |     await login(page);
  110 |     await page.locator(sel.cartLink).click();
  111 |     await page.locator('[data-test="checkout"]').click();
> 112 |     await expect(page).not.toHaveURL(/checkout-step-one\.html/);
      |                            ^ Error: expect(page).not.toHaveURL(expected) failed
  113 |   });
  114 | });
  115 | 
```