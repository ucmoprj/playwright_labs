// =============================================================================
// LAB 05 — Auto-waiting, Timeouts, and Flaky Tests
// Guide: guides/LABS.md
//
// You learn
//   - why Playwright tests need no `sleep`
//   - the difference between "check once" and "retry until it passes"
//   - why waitForTimeout() is a bad idea
//   - action, assertion and test timeouts
//   - waiting for a network response, and expect.poll
//
// How to use this file
//   Uncomment ONE block at a time (Ctrl+/), run, and answer the OBSERVE notes:
//     npx playwright test tests/labs/lab05-waiting.spec.ts
//
// Web pages are ASYNCHRONOUS: Mini Shop loads its product list with a
// network request AFTER the HTML arrives. A test that checks too early sees
// an empty list. A FLAKY test passes sometimes and fails sometimes.
//
// To make timing problems visible and repeatable, several blocks use
// slowDownProductApi() below. It makes the product API answer 1 second
// late. (Lab 12 explains page.route; here it just simulates a slow server.)
// =============================================================================

import { test, expect, type Page } from '@playwright/test';

async function slowDownProductApi(page: Page) {
  await page.route('**/api/products*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.continue();
  });
}

// -----------------------------------------------------------------------------
// Lab 5.1 — Web-first assertions wait for you
//
// The products arrive 1 second after the page opens. The assertion simply
// keeps retrying until the text appears (up to 5 s by default).
//
// OBSERVE: Run with --headed. The page is empty for a moment, then fills.
//          The test passes without any sleep.
// -----------------------------------------------------------------------------
// test('5.1 expect waits for slow content', async ({ page }) => {
//   await slowDownProductApi(page);
//   await page.goto('/');
//
//   await expect(page.getByText('6 product(s) found.')).toBeVisible();
//   await expect(page.getByRole('listitem')).toHaveCount(6);
// });

// -----------------------------------------------------------------------------
// Lab 5.2 — "Check once" does NOT wait                       [EXPECTED: FAIL]
//
// count() and isVisible() read the page ONE time, right now, without
// waiting. (textContent() and inputValue() wait until the element EXISTS,
// but then also read its value only once.)
// Wrapping the result in expect() does not make it wait: expect() only
// receives the number that was already read.
//
// OBSERVE: The error says Expected 6, Received 0. At the moment count() ran,
//          the list was still empty.
// FIX:     Rewrite it as a web-first assertion:
//            await expect(page.getByRole('listitem')).toHaveCount(6);
//
// THINK:   Without slowDownProductApi() this test might PASS on a fast
//          computer and FAIL on a slow CI server. That is a flaky test.
// -----------------------------------------------------------------------------
// test('5.2 count() reads the page only once', async ({ page }) => {
//   await slowDownProductApi(page);
//   await page.goto('/');
//
//   const count = await page.getByRole('listitem').count();
//   expect(count).toBe(6);
// });

// -----------------------------------------------------------------------------
// Lab 5.3 — waitForTimeout: the "sleep" anti-pattern
//
// waitForTimeout(ms) pauses for a FIXED time. It "fixes" 5.2, but:
//   - if the server is faster, you waste time on every run
//   - if the server is slower than your guess, the test fails anyway
//
// OBSERVE: Note the duration of this test in the output (e.g. "(3.5s)").
//          Compare it with 5.1. Then change 3000 to 500 and run again.
// RULE:    Never use waitForTimeout in a real test. Wait for a CONDITION.
// -----------------------------------------------------------------------------
// test('5.3 a fixed sleep is slow and fragile', async ({ page }) => {
//   await slowDownProductApi(page);
//   await page.goto('/');
//
//   await page.waitForTimeout(3000);                  // DON'T do this
//   const count = await page.getByRole('listitem').count();
//   expect(count).toBe(6);
// });

// -----------------------------------------------------------------------------
// Lab 5.4 — Timeouts                                         [EXPECTED: FAIL]
//
// There are three kinds of timeouts:
//   assertion timeout  expect(...).toBeVisible({ timeout: ms })  default 5 s
//   action timeout     locator.click({ timeout: ms })            default none*
//   test timeout       test.setTimeout(ms)                       default 30 s
//   (* an action is still limited by the test timeout)
//
// Here the product API is slow (1 s) but we only allow 500 ms.
//
// OBSERVE: "Timeout 500ms exceeded". The page was fine — the test was too
//          impatient.
// FIX:     Remove { timeout: 500 } so the default 5 s is used.
// TRY:     Put `test.setTimeout(800);` as the first line of the test and
//          remove the 500 ms option. Which timeout fires now?
// -----------------------------------------------------------------------------
// test('5.4 a timeout that is too short', async ({ page }) => {
//   await slowDownProductApi(page);
//   await page.goto('/');
//
//   await expect(page.getByText('6 product(s) found.')).toBeVisible({ timeout: 500 });
// });

// -----------------------------------------------------------------------------
// Lab 5.5 — Waiting for a network response
//
// page.waitForResponse() waits until the browser receives a matching
// response. Start waiting BEFORE the click (the response could arrive very
// quickly), then await the result AFTER the click.
//
// OBSERVE: You can check what the server sent, not only what the page shows.
// -----------------------------------------------------------------------------
// test('5.5 wait for the search response', async ({ page }) => {
//   await page.goto('/');
//   await expect(page.getByText('6 product(s) found.')).toBeVisible();
//
//   const responsePromise = page.waitForResponse('**/api/products?q=Mouse');
//   await page.getByLabel('Search products').fill('Mouse');
//   await page.getByRole('button', { name: 'Search' }).click();
//   const response = await responsePromise;
//
//   expect(response.status()).toBe(200);
//   const body = await response.json();
//   expect(body.products).toHaveLength(1);
//   expect(body.products[0].name).toBe('Wireless Mouse');
// });

// -----------------------------------------------------------------------------
// Lab 5.6 — expect.poll: retry ANY check
//
// Web-first assertions only work on locators and pages. For other values
// (e.g. something you fetch from an API) use expect.poll(): it calls your
// function again and again until the assertion passes or times out.
//
// Here we click "Add to cart" in the UI and poll the REST API until the cart
// has one item. (Lab 07 covers the `request` API client.)
//
// OBSERVE: expect.poll(fn) — note `fn` is a FUNCTION, so it can be called
//          many times.
// -----------------------------------------------------------------------------
// test('5.6 poll the API until the cart is updated', async ({ page, request }) => {
//   await request.post('/api/test/reset');
//   await page.goto('/login.html');
//   await page.getByLabel('Username').fill('alice');
//   await page.getByLabel('Password').fill('alice123');
//   await page.getByRole('button', { name: 'Log in' }).click();
//   await expect(page.getByText('Signed in as Alice (REGULAR)')).toBeVisible();
//
//   // The browser stores the login token in localStorage. Read it.
//   const token = await page.evaluate(() => localStorage.getItem('minishop.token'));
//
//   await page.getByRole('listitem', { name: 'Paper Notebook' })
//     .getByRole('button', { name: 'Add to cart' }).click();
//
//   await expect.poll(async () => {
//     const res = await request.get('/api/cart', {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const cart = await res.json();
//     return cart.items.length;
//   }).toBe(1);
// });

// -----------------------------------------------------------------------------
// Lab 5.7 — Your turn: check the server with expect.poll
//
// Practice what you learned in 5.6, with a different user and product.
// The first lines (reset + a slow server) are given. Write the TODO steps:
//
//   1. Log in as bob / bob123 through the UI. Wait until the navigation bar
//      shows 'Signed in as Bob (VIP)'.
//   2. Read bob's token from localStorage with page.evaluate().
//   3. Click "Add to cart" on the "Wireless Mouse" card.
//   4. With expect.poll, call GET /api/cart (send the token in the
//      Authorization header) and return cart.subtotal.
//      It must become 2500 ($25.00).
//
// TRY first: instead of expect.poll, call request.get('/api/cart') ONCE and
//   check cart.subtotal with a plain expect. Run it. Why does it fail?
//   (Hint: the server here answers 1 second late — see page.route below.)
//   Then replace it with expect.poll and run again.
// -----------------------------------------------------------------------------
// test('5.7 the server cart gets the mouse', async ({ page, request }) => {
//   await request.post('/api/test/reset');
//   await page.route('**/api/cart/items', async (route) => {
//     await new Promise((resolve) => setTimeout(resolve, 1000)); // slow server
//     await route.continue();
//   });
//
//   // TODO 1: log in as bob through the UI and wait for 'Signed in as Bob (VIP)'
//
//   // TODO 2: const token = await page.evaluate(...)
//
//   // TODO 3: click "Add to cart" on the Wireless Mouse card
//
//   // TODO 4: await expect.poll(async () => { ... return cart.subtotal; }).toBe(2500);
// });
