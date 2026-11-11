// =============================================================================
// LAB 08 — Combining API and UI
// Guide: guides/LABS.md
//
// You learn
//   - Arrange with the API, check with the UI  (fast, focused UI tests)
//   - log in without the login form: page.addInitScript + localStorage
//   - Act in the UI, verify with the API
//   - page.evaluate: run JavaScript inside the browser
//   - getByTestId
//
// How to use this file
//   Uncomment ONE block at a time (Ctrl+/), run, and answer the OBSERVE notes:
//     npx playwright test tests/labs/lab08-api-and-ui.spec.ts
//
// How Mini Shop remembers a login: after login the browser stores the token
// in localStorage under 'minishop.token' (and the user under
// 'minishop.user'). Every page reads it from there. See app/public/app.js.
// =============================================================================

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('/api/test/reset');
});

// -----------------------------------------------------------------------------
// Lab 8.1 — Arrange with the API, verify in the UI
//
// To test how the CART PAGE shows a discount, we don't need to click through
// the Products page. Filling the cart with the API is faster and the test
// focuses on what it is really about.
//
// The cart is stored on the SERVER per user, so items added via the API are
// visible when the same user logs in through the browser.
//
// getByTestId('subtotal') finds <span data-testid="subtotal">. Use test ids
// for values that have no good role or label.
//
// OBSERVE: 2 x $50.00 = $100.00 -> REGULAR gets 5% (BR-DISC).
// -----------------------------------------------------------------------------
// test('8.1 the cart page shows totals for items added via the API', async ({ page, request }) => {
//   // Arrange (API)
//   const { token } = await (await request.post('/api/auth/login', {
//     data: { username: 'alice', password: 'alice123' },
//   })).json();
//   await request.post('/api/cart/items', {
//     headers: { Authorization: `Bearer ${token}` },
//     data: { productId: 1, quantity: 2 },
//   });
//
//   // Act (UI)
//   await page.goto('/login.html');
//   await page.getByLabel('Username').fill('alice');
//   await page.getByLabel('Password').fill('alice123');
//   await page.getByRole('button', { name: 'Log in' }).click();
//   await page.getByRole('link', { name: 'Cart' }).click();
//
//   // Assert (UI)
//   await expect(page.getByTestId('subtotal')).toHaveText('$100.00');
//   await expect(page.getByTestId('discount')).toHaveText('-$5.00 (5%)');
//   await expect(page.getByTestId('total')).toHaveText('$95.00');
// });

// -----------------------------------------------------------------------------
// Lab 8.2 — Skip the login form: inject the session
//
// page.addInitScript(fn, arg) runs fn inside the browser BEFORE any page
// script, on every page load. We use it to put the token into localStorage,
// so the app thinks we have already logged in.
//
// The login FORM itself is tested once (Lab 3.1). Other tests can skip it.
//
// OBSERVE: There is no login form in this test, yet the nav bar shows
//          "Signed in as Bob (VIP)" and the cart page opens.
// -----------------------------------------------------------------------------
// test('8.2 log in by injecting the token', async ({ page, request }) => {
//   const { token, user } = await (await request.post('/api/auth/login', {
//     data: { username: 'bob', password: 'bob123' },
//   })).json();
//
//   await page.addInitScript(({ token, user }) => {
//     localStorage.setItem('minishop.token', token);
//     localStorage.setItem('minishop.user', JSON.stringify(user));
//   }, { token, user });
//
//   await page.goto('/cart.html');
//   await expect(page.getByText('Signed in as Bob (VIP)')).toBeVisible();
//   await expect(page.getByText('Your cart is empty.')).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Lab 8.3 — Act in the UI, verify with the API
//
// page.evaluate(fn) runs fn inside the browser and returns the result to the
// test. Here we read the token the app saved after a UI login, then ask the
// API what is really in the cart.
//
// OBSERVE: The UI said "added". The API confirms the server state really
//          changed: quantity 2 after two clicks (REQ-CART-02).
// -----------------------------------------------------------------------------
// test('8.3 clicks in the UI change the server cart', async ({ page, request }) => {
//   await page.goto('/login.html');
//   await page.getByLabel('Username').fill('alice');
//   await page.getByLabel('Password').fill('alice123');
//   await page.getByRole('button', { name: 'Log in' }).click();
//   await expect(page.getByText('Signed in as Alice (REGULAR)')).toBeVisible();
//
//   const button = page.getByRole('listitem', { name: 'Wireless Mouse' })
//     .getByRole('button', { name: 'Add to cart' });
//   const status = page.getByRole('status');
//
//   await button.click();
//   await expect(status).toHaveText('Wireless Mouse was added to your cart.');
//
//   // The 2nd click shows the SAME message, so the text cannot tell us when
//   // it is done. Wait for the server's response instead (Lab 5.5).
//   const second = page.waitForResponse('**/api/cart/items');
//   await button.click();
//   expect((await second).status()).toBe(201);
//
//   const token = await page.evaluate(() => localStorage.getItem('minishop.token'));
//   const cart = await (await request.get('/api/cart', {
//     headers: { Authorization: `Bearer ${token}` },
//   })).json();
//   expect(cart.items).toEqual([
//     expect.objectContaining({ name: 'Wireless Mouse', quantity: 2 }),
//   ]);
// });

// -----------------------------------------------------------------------------
// Lab 8.4 — An order, end to end
//
// Arrange via API (cart), Act via UI (place order, pay), Assert via UI.
// The orders page marks the status cell with data-testid="order-status".
//
// OBSERVE: Every part of the flow uses the fastest tool that still tests what
//          matters: the API for setup, the UI for what the user does.
// TRY:     After paying, check the order status with the API as well
//          (GET /api/orders/1 -> order.status should be 'PAID').
// -----------------------------------------------------------------------------
// test('8.4 place and pay for an order', async ({ page, request }) => {
//   const { token, user } = await (await request.post('/api/auth/login', {
//     data: { username: 'alice', password: 'alice123' },
//   })).json();
//   await request.post('/api/cart/items', {
//     headers: { Authorization: `Bearer ${token}` },
//     data: { productId: 3, quantity: 2 },
//   });
//   await page.addInitScript(({ token, user }) => {
//     localStorage.setItem('minishop.token', token);
//     localStorage.setItem('minishop.user', JSON.stringify(user));
//   }, { token, user });
//
//   await page.goto('/cart.html');
//   await page.getByRole('button', { name: 'Place order' }).click();
//
//   await expect(page).toHaveURL(/orders\.html/);
//   await expect(page.getByRole('status')).toHaveText('Order #1 was placed.');
//   const row = page.getByRole('row', { name: /Order #1/ });
//   await expect(row.getByTestId('order-status')).toHaveText('CREATED');
//
//   await row.getByRole('button', { name: 'Pay' }).click();
//   await expect(page.getByRole('status')).toHaveText('Order #1 was paid.');
//   await expect(row.getByTestId('order-status')).toHaveText('PAID');
//   await expect(row.getByRole('button', { name: 'Pay' })).toHaveCount(0);
// });

// -----------------------------------------------------------------------------
// Lab 8.5 — Two users, two browsers
//
// The `browser` fixture can open several independent contexts (like two
// private windows). Each has its own localStorage, so two users can be
// logged in at the same time.
//
// OBSERVE: Alice's order is not visible to Bob (REQ-ORD-07).
// -----------------------------------------------------------------------------
// test('8.5 users see only their own orders', async ({ browser, request }) => {
//   const { token } = await (await request.post('/api/auth/login', {
//     data: { username: 'alice', password: 'alice123' },
//   })).json();
//   const auth = { Authorization: `Bearer ${token}` };
//   await request.post('/api/cart/items', { headers: auth, data: { productId: 6, quantity: 1 } });
//   await request.post('/api/orders', { headers: auth });
//
//   const aliceContext = await browser.newContext();
//   const bobContext = await browser.newContext();
//   const alicePage = await aliceContext.newPage();
//   const bobPage = await bobContext.newPage();
//
//   for (const [p, username, password] of [
//     [alicePage, 'alice', 'alice123'],
//     [bobPage, 'bob', 'bob123'],
//   ] as const) {
//     await p.goto('/login.html');
//     await p.getByLabel('Username').fill(username);
//     await p.getByLabel('Password').fill(password);
//     await p.getByRole('button', { name: 'Log in' }).click();
//     await expect(p.getByText(/Signed in as/)).toBeVisible();
//     await p.getByRole('link', { name: 'Orders' }).click();
//   }
//
//   await expect(alicePage.getByRole('row', { name: /Order #1/ })).toBeVisible();
//   await expect(bobPage.getByText('You have no orders yet.')).toBeVisible();
//
//   await aliceContext.close();
//   await bobContext.close();
// });

// -----------------------------------------------------------------------------
// Lab 8.6 — Your turn
//
// Using the API, put 1 x USB-C Cable (id 3) into alice's cart.
// Log in with addInitScript (Lab 8.2), open '/cart.html', click "Remove".
// Then verify with BOTH:
//   - the UI: 'Item removed.' message and 'Your cart is empty.'
//   - the API: GET /api/cart returns no items
// -----------------------------------------------------------------------------
// test('8.6 removing an item updates the server cart', async ({ page, request }) => {
//   // TODO
// });
