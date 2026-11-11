// =============================================================================
// LAB 09 — Data-Driven Tests and Helper Functions
// Guide: guides/LABS.md
//
// You learn
//   - generate many tests from a table of data (a for loop around test())
//   - TypeScript types for test data
//   - helper functions to remove repeated code
//   - put shared helpers in a separate file and import them
//
// How to use this file
//   Uncomment ONE block at a time (Ctrl+/), run, and answer the OBSERVE notes:
//     npx playwright test tests/labs/lab09-data-driven.spec.ts
// =============================================================================

import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('/api/test/reset');
});

// -----------------------------------------------------------------------------
// Lab 9.1 — The problem: copy-paste tests
//
// These three tests are identical except for two values.
//
// OBSERVE: If the search box label changed, how many places would you edit?
//          Lab 9.2 fixes this.
// -----------------------------------------------------------------------------
// test('9.1 search Keyboard', async ({ page }) => {
//   await page.goto('/');
//   await page.getByLabel('Search products').fill('Keyboard');
//   await page.getByRole('button', { name: 'Search' }).click();
//   await expect(page.getByText('1 product(s) found.')).toBeVisible();
// });
//
// test('9.1 search Mouse', async ({ page }) => {
//   await page.goto('/');
//   await page.getByLabel('Search products').fill('Mouse');
//   await page.getByRole('button', { name: 'Search' }).click();
//   await expect(page.getByText('1 product(s) found.')).toBeVisible();
// });
//
// test('9.1 search xyz', async ({ page }) => {
//   await page.goto('/');
//   await page.getByLabel('Search products').fill('xyz');
//   await page.getByRole('button', { name: 'Search' }).click();
//   await expect(page.getByText('No products found.')).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Lab 9.2 — One test body, many data rows
//
// A for...of loop calls test() once per row, so Playwright sees SEPARATE
// tests. Each one gets its own name, its own pass/fail, and its own page.
// Test names MUST be unique — put the data in the name.
//
// OBSERVE: How many tests are reported? What are their names?
// TRY:     Add a row: search 'e' (lower case) — how many products contain
//          the letter "e"? Predict first, then run. Then add the row
//          { query: '  Monitor  ', expected: '1 product(s) found.' }.
// -----------------------------------------------------------------------------
// const searchCases = [
//   { query: 'Keyboard', expected: '1 product(s) found.' },
//   { query: 'Mouse',    expected: '1 product(s) found.' },
//   { query: 'xyz',      expected: 'No products found.' },
//   { query: '',         expected: '6 product(s) found.' },
// ];
//
// for (const { query, expected } of searchCases) {
//   test(`9.2 search "${query}" shows "${expected}"`, async ({ page }) => {
//     await page.goto('/');
//     await page.getByLabel('Search products').fill(query);
//     await page.getByRole('button', { name: 'Search' }).click();
//     await expect(page.getByText(expected)).toBeVisible();
//   });
// }

// -----------------------------------------------------------------------------
// Lab 9.3 — Typed test data
//
// A TypeScript `type` describes what each row must contain. VS Code then
// warns you if a row is missing a field or has a typo.
//
// The data below is a DECISION TABLE for the discount rule BR-DISC (REGULAR
// customer). All money in cents.
//
// OBSERVE: Hover over `c` in VS Code to see its type.
// TRY:     Remove `discount` from one row. What does VS Code say?
//          (Playwright still runs it, so the test fails at runtime.)
// -----------------------------------------------------------------------------
// type DiscountCase = {
//   title: string;
//   productId: number;
//   quantity: number;
//   subtotal: number;
//   discount: number;
// };
//
// const regularCases: DiscountCase[] = [
//   { title: 'below $100 -> 0%',  productId: 2, quantity: 3, subtotal: 7500,  discount: 0 },
//   { title: 'exactly $100 -> 5%', productId: 2, quantity: 4, subtotal: 10000, discount: 500 },
//   { title: 'above $100 -> 5%',  productId: 1, quantity: 3, subtotal: 15000, discount: 750 },
// ];
//
// for (const c of regularCases) {
//   test(`9.3 REGULAR ${c.title}`, async ({ request }) => {
//     const { token } = await (await request.post('/api/auth/login', {
//       data: { username: 'alice', password: 'alice123' },
//     })).json();
//
//     const res = await request.post('/api/cart/items', {
//       headers: { Authorization: `Bearer ${token}` },
//       data: { productId: c.productId, quantity: c.quantity },
//     });
//     const cart = await res.json();
//
//     expect(cart.subtotal).toBe(c.subtotal);
//     expect(cart.discount).toBe(c.discount);
//     expect(cart.total).toBe(c.subtotal - c.discount);
//   });
// }

// -----------------------------------------------------------------------------
// Lab 9.4 — Helper functions
//
// Repeated steps become a function. Pass the `page` (or `request`) in as a
// parameter. Give the function a name that describes the USER's goal.
//
//   async function loginAs(page: Page, username: string, password: string)
//
// OBSERVE: The tests now read like a description of what the user does.
// -----------------------------------------------------------------------------
// async function loginAs(page: Page, username: string, password: string) {
//   await page.goto('/login.html');
//   await page.getByLabel('Username').fill(username);
//   await page.getByLabel('Password').fill(password);
//   await page.getByRole('button', { name: 'Log in' }).click();
// }
//
// async function addToCart(page: Page, productName: string) {
//   await page.getByRole('listitem', { name: productName })
//     .getByRole('button', { name: 'Add to cart' }).click();
//   await expect(page.getByRole('status')).toHaveText(`${productName} was added to your cart.`);
// }
//
// test('9.4 alice adds a cable', async ({ page }) => {
//   await loginAs(page, 'alice', 'alice123');
//   await addToCart(page, 'USB-C Cable');
//
//   await page.getByRole('link', { name: 'Cart' }).click();
//   await expect(page.getByRole('row', { name: /USB-C Cable/ })).toBeVisible();
// });
//
// test('9.4 bob adds a notebook', async ({ page }) => {
//   await loginAs(page, 'bob', 'bob123');
//   await addToCart(page, 'Paper Notebook');
//
//   await page.getByRole('link', { name: 'Cart' }).click();
//   await expect(page.getByRole('row', { name: /Paper Notebook/ })).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Lab 9.5 — Helpers that return a value
//
// An API helper can return what the test needs next (here: the auth header).
//
// The quantity cases come from business rule BR-QTY. All three rows are
// rejected; the test checks the exact error message for each one.
// -----------------------------------------------------------------------------
// async function apiLogin(request: APIRequestContext, username: string, password: string) {
//   const res = await request.post('/api/auth/login', { data: { username, password } });
//   expect(res.status()).toBe(200);
//   const { token } = await res.json();
//   return { Authorization: `Bearer ${token}` };
// }
//
// const invalidQuantities = [
//   { quantity: 0,   message: 'Quantity must be at least 1.' },
//   { quantity: -1,  message: 'Quantity must be at least 1.' },
//   { quantity: 1.5, message: 'Quantity must be a whole number.' },
// ];
//
// for (const { quantity, message } of invalidQuantities) {
//   test(`9.5 quantity ${quantity} is rejected`, async ({ request }) => {
//     const auth = await apiLogin(request, 'alice', 'alice123');
//
//     const res = await request.post('/api/cart/items', {
//       headers: auth,
//       data: { productId: 6, quantity },
//     });
//
//     expect(res.status()).toBe(400);
//     expect((await res.json()).error.message).toBe(message);
//   });
// }

// -----------------------------------------------------------------------------
// Lab 9.6 — Your turn
//
// 1. Write a data table for LOGIN errors and generate one test per row:
//      { username: '',      password: 'alice123', error: 'Username and password are required.' }
//      { username: 'alice', password: '',         error: 'Username and password are required.' }
//      { username: 'alice', password: 'nope',     error: 'Invalid username or password.' }
//      { username: 'nobody',password: 'alice123', error: 'Invalid username or password.' }
//    Each test fills the form, clicks Log in, and checks the alert text.
// 2. Use the loginAs() helper from 9.4 (uncomment it, or copy it).
// 3. BONUS: move loginAs() into a new file tests/labs/helpers.ts with
//    `export async function loginAs(...)`, and import it here with
//      import { loginAs } from './helpers';
// -----------------------------------------------------------------------------
// // TODO: write your data table and the for loop here
