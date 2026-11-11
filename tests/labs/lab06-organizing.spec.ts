// =============================================================================
// LAB 06 — Organizing Tests: describe, Hooks, Steps, Tags
// Guide: guides/LABS.md
//
// You learn
//   - test.describe        group related tests
//   - beforeEach/afterEach run code around EVERY test
//   - beforeAll/afterAll   run code ONCE per group
//   - test.step            name the steps inside a long test
//   - test.only, test.skip, test.fixme, test.fail
//   - tags and --grep      run a chosen subset of tests
//
// How to use this file
//   Uncomment ONE block at a time (Ctrl+/), run, and answer the OBSERVE notes:
//     npx playwright test tests/labs/lab06-organizing.spec.ts
//   Many blocks print with console.log — read the ORDER of the lines.
// =============================================================================

import { test, expect } from '@playwright/test';

// -----------------------------------------------------------------------------
// Lab 6.1 — describe and the order of hooks
//
// OBSERVE: Write down the order of the printed lines. How many times does
//          each hook run for the two tests?
//            beforeAll  -> ? times     beforeEach -> ? times
//            afterEach  -> ? times     afterAll   -> ? times
//
// Note: the test title in the report becomes "6.1 hooks › first test".
// -----------------------------------------------------------------------------
// test.describe('6.1 hooks', () => {
//   test.beforeAll(async () => {
//     console.log('beforeAll  (once, before the first test)');
//   });
//
//   test.beforeEach(async () => {
//     console.log('  beforeEach');
//   });
//
//   test.afterEach(async () => {
//     console.log('  afterEach');
//   });
//
//   test.afterAll(async () => {
//     console.log('afterAll   (once, after the last test)');
//   });
//
//   test('first test', async () => {
//     console.log('    first test');
//   });
//
//   test('second test', async () => {
//     console.log('    second test');
//   });
// });

// -----------------------------------------------------------------------------
// Lab 6.2 — beforeEach for shared setup
//
// Each test in this group needs a reset AND a logged-in user on the home page.
// Put that in beforeEach so each test only contains what is special about it.
// Hooks can use fixtures too: { page, request }.
//
// OBSERVE: Both tests start from the same state, even though the first one
//          adds an item to the cart. Why? (Hint: reset + a NEW page per test.)
// -----------------------------------------------------------------------------
// test.describe('6.2 logged-in user', () => {
//   test.beforeEach(async ({ page, request }) => {
//     await request.post('/api/test/reset');
//     await page.goto('/login.html');
//     await page.getByLabel('Username').fill('alice');
//     await page.getByLabel('Password').fill('alice123');
//     await page.getByRole('button', { name: 'Log in' }).click();
//     await expect(page.getByText('Signed in as Alice (REGULAR)')).toBeVisible();
//   });
//
//   test('can add a product to the cart', async ({ page }) => {
//     await page.getByRole('listitem', { name: 'Wireless Mouse' })
//       .getByRole('button', { name: 'Add to cart' }).click();
//     await expect(page.getByRole('status')).toHaveText('Wireless Mouse was added to your cart.');
//   });
//
//   test('starts with an empty cart', async ({ page }) => {
//     await page.getByRole('link', { name: 'Cart' }).click();
//     await expect(page.getByText('Your cart is empty.')).toBeVisible();
//   });
// });

// -----------------------------------------------------------------------------
// Lab 6.3 — Nested describe
//
// describe blocks can be nested. Outer hooks run BEFORE inner hooks.
//
// OBSERVE: For the inner test, which beforeEach runs first?
// -----------------------------------------------------------------------------
// test.describe('6.3 outer', () => {
//   test.beforeEach(async () => console.log('outer beforeEach'));
//
//   test('outer test', async () => console.log('  outer test'));
//
//   test.describe('inner', () => {
//     test.beforeEach(async () => console.log('inner beforeEach'));
//
//     test('inner test', async () => console.log('  inner test'));
//   });
// });

// -----------------------------------------------------------------------------
// Lab 6.4 — test.step: readable reports
//
// Long tests are easier to read when they are divided into named steps.
//
// OBSERVE: Run this block, then open the report (npx playwright show-report)
//          and click the test. The steps appear as a collapsible tree.
// TRY:     Break the last assertion (e.g. wrong text). Which step is marked
//          as failed in the report?
// -----------------------------------------------------------------------------
// test('6.4 search flow with steps', async ({ page }) => {
//   await test.step('open the Products page', async () => {
//     await page.goto('/');
//     await expect(page.getByText('6 product(s) found.')).toBeVisible();
//   });
//
//   await test.step('search for "Cable"', async () => {
//     await page.getByLabel('Search products').fill('Cable');
//     await page.getByRole('button', { name: 'Search' }).click();
//   });
//
//   await test.step('only the USB-C Cable is shown', async () => {
//     await expect(page.getByRole('listitem')).toHaveCount(1);
//     await expect(page.getByRole('heading', { name: 'USB-C Cable' })).toBeVisible();
//   });
// });

// -----------------------------------------------------------------------------
// Lab 6.5 — only, skip, fixme, fail
//
//   test.only(...)   run ONLY this test (in this file)  — never commit it!
//   test.skip(...)   do not run this test
//   test.fixme(...)  do not run: the test (or app) is known to be broken
//   test.fail()      run it, and EXPECT it to fail
//   test.skip(condition, 'reason')  skip at runtime when condition is true
//
// OBSERVE: In the summary, count "passed", "skipped". Why is the test.fail()
//          test reported as passed?
// TRY:     Change the first `test(` to `test.only(` and run again.
//          (playwright.config.ts sets forbidOnly on CI: a forgotten
//          test.only makes the CI build FAIL on purpose.)
// -----------------------------------------------------------------------------
// test.describe('6.5 controlling which tests run', () => {
//   test('a normal test', async ({ page }) => {
//     await page.goto('/');
//     await expect(page).toHaveTitle('Products - Mini Shop');
//   });
//
//   test.skip('a skipped test', async () => {
//     throw new Error('this never runs');
//   });
//
//   test.fixme('a test we will fix later', async () => {
//     throw new Error('this never runs either');
//   });
//
//   test('a test that is expected to fail', async () => {
//     test.fail();
//     expect(1 + 1).toBe(3);
//   });
//
//   test('skipped only on Firefox', async ({ page, browserName }) => {
//     test.skip(browserName === 'firefox', 'not supported on Firefox');
//     await page.goto('/');
//   });
// });

// -----------------------------------------------------------------------------
// Lab 6.6 — Tags: run a subset
//
// Add tags to tests, then choose which ones to run:
//   npx playwright test tests/labs/lab06-organizing.spec.ts --grep "@smoke"
//   npx playwright test tests/labs/lab06-organizing.spec.ts --grep-invert "@slow"
//
// OBSERVE: Which tests run for each command?
// -----------------------------------------------------------------------------
// test.describe('6.6 tags', () => {
//   test('home page opens', { tag: '@smoke' }, async ({ page }) => {
//     await page.goto('/');
//     await expect(page).toHaveTitle('Products - Mini Shop');
//   });
//
//   test('login page opens', { tag: ['@smoke', '@auth'] }, async ({ page }) => {
//     await page.goto('/login.html');
//     await expect(page).toHaveTitle('Log in - Mini Shop');
//   });
//
//   test('a slow full check', { tag: '@slow' }, async ({ page }) => {
//     for (const path of ['/', '/login.html', '/cart.html', '/orders.html']) {
//       await page.goto(path);
//       await expect(page).toHaveTitle(/Mini Shop/);
//     }
//   });
// });

// -----------------------------------------------------------------------------
// Lab 6.7 — Your turn
//
// Create a describe group '6.7 login errors' with:
//   - a beforeEach that opens '/login.html'
//   - test 'empty fields'  : click Log in without typing.
//       Expect alert text 'Username and password are required.' (REQ-AUTH-04)
//   - test 'unknown user'  : username 'nobody', password 'x'.
//       Expect alert text 'Invalid username or password.'      (REQ-AUTH-03)
//   - tag both tests with '@auth'
// -----------------------------------------------------------------------------
// test.describe('6.7 login errors', () => {
//   // TODO
// });
