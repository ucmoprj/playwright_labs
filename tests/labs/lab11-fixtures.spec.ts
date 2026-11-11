// =============================================================================
// LAB 11 — Fixtures: Playwright's Way to Share Setup
// Guide: guides/LABS.md
//
// You learn
//   - what the built-in fixtures are: page, request, browser, context, ...
//   - test.extend() to create YOUR OWN fixtures
//   - setup and teardown around `use()`
//   - fixtures that depend on other fixtures
//   - auto fixtures (run for every test without being asked)
//
// How to use this file
//   Uncomment ONE block at a time (Ctrl+/), run, and answer the OBSERVE notes:
//     npx playwright test tests/labs/lab11-fixtures.spec.ts
//   Blocks 11.4 and later use the fixtures defined in 11.3 — keep 11.3 active.
//
// You have used fixtures since Lab 01: `async ({ page }) => ...`.
// `page` is a fixture. Playwright CREATES it before the test, gives it to
// the test, and CLEANS IT UP afterwards. You only ask for it by name.
// =============================================================================

import { test as base, expect, type Page } from '@playwright/test';

// Note: `test` is imported as `base` here, because in this lab we build our
// own `test` objects on top of it.

// -----------------------------------------------------------------------------
// Lab 11.1 — Built-in fixtures
//
// Ask only for what you need. A test that asks only for `request` never
// starts a browser page.
//
//   page        a new browser tab (inside a new context)
//   context     the browser context (like a private window) that owns `page`
//   request     an HTTP client using baseURL
//   browser     the browser itself (create extra contexts — Lab 8.5)
//   browserName 'chromium', 'firefox' or 'webkit'
//
// OBSERVE: Compare the durations of the two tests.
// -----------------------------------------------------------------------------
// base('11.1 a test that uses page', async ({ page, browserName }) => {
//   console.log('running in', browserName);
//   await page.goto('/');
//   await expect(page).toHaveTitle('Products - Mini Shop');
// });
//
// base('11.1 a test that uses only request', async ({ request }) => {
//   const res = await request.get('/api/products');
//   expect(res.status()).toBe(200);
// });

// -----------------------------------------------------------------------------
// Lab 11.2 — Your first custom fixture
//
//   const myTest = base.extend<{ name: Type }>({
//     name: async ({ otherFixtures }, use) => {
//       ...setup...
//       await use(value);     <- the TEST runs here
//       ...teardown...
//     },
//   });
//
// OBSERVE: Read the order of the console lines. Teardown runs AFTER the
//          test, even if the test fails. TRY: make the test fail.
// -----------------------------------------------------------------------------
// const greetingTest = base.extend<{ greeting: string }>({
//   greeting: async ({}, use) => {
//     console.log('fixture: setup');
//     await use('Hello from a fixture');
//     console.log('fixture: teardown');
//   },
// });
//
// greetingTest('11.2 using a custom fixture', async ({ greeting }) => {
//   console.log('test: received ->', greeting);
//   expect(greeting).toContain('Hello');
// });

// -----------------------------------------------------------------------------
// Lab 11.3 — Useful fixtures for Mini Shop                (keep this active!)
//
// Three fixtures:
//   resetData   (auto) resets Mini Shop before EVERY test, even if the test
//               does not ask for it
//   authHeader  logs alice in via the API, gives { Authorization: ... }
//   alicePage   a `page` where alice is already logged in (token injected)
//
// A fixture can use other fixtures: alicePage uses `page` and `request`.
//
// OBSERVE: Nothing visible happens in 11.3 alone — this block only DEFINES
//          the fixtures. The `smoke` test at the end shows they work.
// -----------------------------------------------------------------------------
// type ShopFixtures = {
//   resetData: void;
//   authHeader: { Authorization: string };
//   alicePage: Page;
// };
//
// const test = base.extend<ShopFixtures>({
//   resetData: [async ({ request }, use) => {
//     await request.post('/api/test/reset');
//     await use();
//   }, { auto: true }],
//
//   authHeader: async ({ request }, use) => {
//     const res = await request.post('/api/auth/login', {
//       data: { username: 'alice', password: 'alice123' },
//     });
//     const { token } = await res.json();
//     await use({ Authorization: `Bearer ${token}` });
//   },
//
//   alicePage: async ({ page, request }, use) => {
//     const res = await request.post('/api/auth/login', {
//       data: { username: 'alice', password: 'alice123' },
//     });
//     const { token, user } = await res.json();
//     await page.addInitScript(({ token, user }) => {
//       localStorage.setItem('minishop.token', token);
//       localStorage.setItem('minishop.user', JSON.stringify(user));
//     }, { token, user });
//     await use(page);
//   },
// });
//
// test('11.3 smoke: the fixtures work', async ({ authHeader, alicePage }) => {
//   expect(authHeader.Authorization).toMatch(/^Bearer /);
//   await alicePage.goto('/');
//   await expect(alicePage.getByText('Signed in as Alice (REGULAR)')).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Lab 11.4 — Tests become short
//
// (Needs 11.3.) The test asks for `alicePage` and starts already logged in.
// It also starts with fresh data, thanks to the auto `resetData` fixture.
//
// OBSERVE: Compare this with Lab 3.5, which did the same with 10 more lines.
// -----------------------------------------------------------------------------
// test('11.4 alice adds the keyboard', async ({ alicePage }) => {
//   await alicePage.goto('/');
//   await alicePage.getByRole('listitem', { name: 'Mechanical Keyboard' })
//     .getByRole('button', { name: 'Add to cart' }).click();
//   await expect(alicePage.getByRole('status')).toHaveText('Mechanical Keyboard was added to your cart.');
//
//   await alicePage.goto('/cart.html');
//   await expect(alicePage.getByTestId('subtotal')).toHaveText('$50.00');
// });

// -----------------------------------------------------------------------------
// Lab 11.5 — Fixtures for API tests
//
// (Needs 11.3.) `authHeader` makes API tests short as well.
//
// OBSERVE: Fixtures are created only when a test ASKS for them. This test
//          never asks for alicePage, so no browser page is opened.
// -----------------------------------------------------------------------------
// test('11.5 an empty cart can not be ordered', async ({ request, authHeader }) => {
//   const res = await request.post('/api/orders', { headers: authHeader });
//
//   expect(res.status()).toBe(400);
//   expect((await res.json()).error.message).toBe('Your cart is empty.');
// });

// -----------------------------------------------------------------------------
// Lab 11.6 — A fixture that creates test data
//
// (Needs 11.3.) A fixture that creates an order BEFORE the test and gives
// the test only the order id. Code after use() is the teardown: it runs when
// the test is finished (here it just prints a line).
//
// test.extend can be chained: orderTest extends the `test` from 11.3, so it
// has resetData, authHeader, alicePage AND orderId.
// -----------------------------------------------------------------------------
// const orderTest = test.extend<{ orderId: number }>({
//   orderId: async ({ request, authHeader }, use) => {
//     await request.post('/api/cart/items', {
//       headers: authHeader,
//       data: { productId: 3, quantity: 1 },
//     });
//     const res = await request.post('/api/orders', { headers: authHeader });
//     const { order } = await res.json();
//
//     await use(order.id);
//
//     console.log(`teardown: order #${order.id} was used by the test`);
//   },
// });
//
// orderTest('11.6 a new order can be cancelled', async ({ request, authHeader, orderId }) => {
//   const res = await request.post(`/api/orders/${orderId}/cancel`, { headers: authHeader });
//   expect(res.status()).toBe(200);
//   expect((await res.json()).order.status).toBe('CANCELLED');
// });

// -----------------------------------------------------------------------------
// Lab 11.7 — Your turn
//
// (Needs 11.3.) Add a `bobPage` fixture to ShopFixtures and to the
// test.extend in 11.3, just like alicePage but for bob / bob123.
// Then write a test that asks for `bobPage`, opens '/', and checks the
// navigation bar shows 'Signed in as Bob (VIP)'.
//
// BONUS: Move the fixtures into tests/labs/fixtures.ts:
//          export const test = base.extend<ShopFixtures>({ ... });
//          export { expect } from '@playwright/test';
//        Then in a spec file:  import { test, expect } from './fixtures';
// -----------------------------------------------------------------------------
// // TODO
