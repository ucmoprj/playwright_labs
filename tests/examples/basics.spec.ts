// =============================================================================
// STEP 0 — Playwright Basics
// Guide: guides/STEP-0-setup.md
//
// How to use this file
//   1. Block 0.1 is already active. Run it first:
//        npx playwright test tests/examples/basics.spec.ts
//   2. Then uncomment ONE block at a time (select the lines, press Ctrl+/ in
//      VS Code), run the file again, and read the result before moving on.
//   3. Read the comments in each block. They explain the concept you are
//      practicing.
//
// These examples use behavior that is NOT related to the seeded test targets
// in later steps. You write your own tests in the later steps.
// =============================================================================

import { test, expect } from '@playwright/test';

// -----------------------------------------------------------------------------
// Block 0.1 — Open a page and check it              (already active)
//
// `page` is a fresh browser tab that Playwright gives to every test.
// `page.goto('/')` uses `baseURL` from playwright.config.ts, so '/' means
// http://localhost:3100/.
// `expect(...)` assertions wait automatically (up to 5 s) until they pass.
// -----------------------------------------------------------------------------
test('0.1 the Products page opens', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Products - Mini Shop');
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
});

// -----------------------------------------------------------------------------
// Block 0.2 — Find elements the way a user sees them
//
// Prefer user-facing locators:
//   getByRole('button', { name: 'Search' })   - role + accessible name
//   getByLabel('Search products')             - form field by its <label>
//   getByText('...')                          - visible text
// Avoid CSS selectors like '#search' or '.btn-primary' when you can: they
// break when the markup changes, and they do not prove the UI is usable.
//
// Notice there is no `sleep` or `wait`: the search result arrives by AJAX,
// and `expect` simply waits for the text to appear.
// -----------------------------------------------------------------------------
// test('0.2 search finds the keyboard', async ({ page }) => {
//   await page.goto('/');
//
//   await page.getByLabel('Search products').fill('Keyboard');
//   await page.getByRole('button', { name: 'Search' }).click();
//
//   await expect(page.getByText('1 product(s) found.')).toBeVisible();
//   await expect(page.getByRole('heading', { name: 'Mechanical Keyboard' })).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Block 0.3 — Log in through the UI
//
// A test describes one user goal: Arrange → Act → Assert.
// The expected text comes from requirements/requirements.md (REQ-AUTH-02),
// NOT from whatever the application happens to show.
// -----------------------------------------------------------------------------
// test('0.3 a user can log in', async ({ page }) => {
//   // Arrange
//   await page.goto('/login.html');
//
//   // Act
//   await page.getByLabel('Username').fill('alice');
//   await page.getByLabel('Password').fill('alice123');
//   await page.getByRole('button', { name: 'Log in' }).click();
//
//   // Assert
//   await expect(page).toHaveURL(/index\.html/);
//   await expect(page.getByText('Signed in as Alice (REGULAR)')).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Block 0.4 — Test isolation with a reset
//
// Mini Shop keeps its data in memory. Without a reset, a test could start with
// a cart or stock level left over by an earlier test, and then pass or fail
// depending on the ORDER the tests run in.
//
// `test.beforeEach` runs before every test inside this `describe` block.
// `request` is Playwright's HTTP client; here it calls the test support API.
//
// Try it: comment out the beforeEach, then run this block twice in a row
// without restarting the server (`npm start` in another terminal keeps the
// server alive between runs). What happens to the second run?
// -----------------------------------------------------------------------------
// test.describe('0.4 cart (isolated)', () => {
//   test.beforeEach(async ({ request }) => {
//     await request.post('/api/test/reset');
//   });
//
//   test('adding a product puts exactly one unit in the cart', async ({ page }) => {
//     await page.goto('/login.html');
//     await page.getByLabel('Username').fill('alice');
//     await page.getByLabel('Password').fill('alice123');
//     await page.getByRole('button', { name: 'Log in' }).click();
//     await expect(page.getByText('Signed in as Alice (REGULAR)')).toBeVisible();
//
//     // Scope the locator to ONE product card, because every card has an
//     // "Add to cart" button.
//     const card = page.getByRole('listitem', { name: 'USB-C Cable' });
//     await card.getByRole('button', { name: 'Add to cart' }).click();
//     await expect(page.getByRole('status')).toHaveText('USB-C Cable was added to your cart.');
//
//     await page.getByRole('link', { name: 'Cart' }).click();
//     const row = page.getByRole('row', { name: /USB-C Cable/ });
//     await expect(row.getByLabel('Quantity')).toHaveValue('1');
//   });
// });

// -----------------------------------------------------------------------------
// Block 0.5 — Test the REST API directly
//
// Not every test needs a browser. API tests are faster and check business
// rules without the UI. Here: a REGULAR customer with a $100.00 subtotal gets
// a 5% discount (requirements/business-rules.md, BR-DISC).
//
// Remember: the API uses cents. 10000 = $100.00.
// -----------------------------------------------------------------------------
// test('0.5 API: REGULAR customer gets 5% at $100.00', async ({ request }) => {
//   await request.post('/api/test/reset');
//
//   const login = await request.post('/api/auth/login', {
//     data: { username: 'alice', password: 'alice123' },
//   });
//   expect(login.status()).toBe(200);
//   const { token } = await login.json();
//   const auth = { Authorization: `Bearer ${token}` };
//
//   // 2 x Mechanical Keyboard ($50.00) = $100.00
//   const res = await request.post('/api/cart/items', {
//     headers: auth,
//     data: { productId: 1, quantity: 2 },
//   });
//   expect(res.status()).toBe(201);
//
//   const cart = await res.json();
//   expect(cart.subtotal).toBe(10000);
//   expect(cart.discountRate).toBe(0.05);
//   expect(cart.discount).toBe(500);
//   expect(cart.total).toBe(9500);
// });

// -----------------------------------------------------------------------------
// Block 0.6 — Read a failing test
//
// This test FAILS on purpose: the expected message is wrong.
// Run it and practice reading the failure:
//   1. The terminal shows the locator, the expected text, and the actual text.
//   2. Open the HTML report:      npx playwright show-report
//   3. Open the trace (click the failed test → "Trace"). You can step through
//      every action, see the DOM snapshot, and the network requests.
//
// Then decide: is this a defect in the APPLICATION or in the TEST?
// (Check REQ-AUTH-03 in requirements/requirements.md.)
// Fix the test, run it again, and see it pass.
// -----------------------------------------------------------------------------
// test('0.6 wrong password shows an error', async ({ page }) => {
//   await page.goto('/login.html');
//   await page.getByLabel('Username').fill('alice');
//   await page.getByLabel('Password').fill('wrong-password');
//   await page.getByRole('button', { name: 'Log in' }).click();
//
//   await expect(page.getByRole('alert')).toHaveText('Wrong password.');
//   await expect(page).toHaveURL(/login\.html/);
// });
