// =============================================================================
// LAB 03 — Actions: Interacting with the Page
// Guide: guides/LABS.md
//
// You learn
//   - fill, clear, pressSequentially   (typing)
//   - click, press('Enter'), keyboard   (clicking and keys)
//   - goBack, reload                    (navigation)
//   - what happens when you act on a disabled element
//
// How to use this file
//   Uncomment ONE block at a time (Ctrl+/), run, and answer the OBSERVE notes:
//     npx playwright test tests/labs/lab03-actions.spec.ts
//   Add --headed to WATCH the actions:
//     npx playwright test tests/labs/lab03-actions.spec.ts --headed
//
// Before every action Playwright waits until the element is ready: attached,
// visible, stable (not moving), enabled, and not covered by another element.
// This is called AUTO-WAITING. You never need to write `sleep`.
// =============================================================================

import { test, expect } from '@playwright/test';

// Mini Shop keeps its data in memory. This (already active) hook resets it
// before every test in this file, so each test starts with the initial
// products and empty carts. Lab 06 explains beforeEach in detail.
test.beforeEach(async ({ request }) => {
  await request.post('/api/test/reset');
});

// -----------------------------------------------------------------------------
// Lab 3.1 — fill and click: log in
//
// fill(text) clears the field and types the text in one step.
// click()    clicks the element.
//
// OBSERVE (with --headed): The password field shows dots, but fill() works
//          exactly the same as for the username field.
// -----------------------------------------------------------------------------
// test('3.1 log in with fill and click', async ({ page }) => {
//   await page.goto('/login.html');
//
//   await page.getByLabel('Username').fill('alice');
//   await page.getByLabel('Password').fill('alice123');
//   await page.getByRole('button', { name: 'Log in' }).click();
//
//   await expect(page.getByText('Signed in as Alice (REGULAR)')).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Lab 3.2 — press: use the keyboard
//
// Users often press Enter instead of clicking a button.
// locator.press('Enter') presses a key while that element has focus.
//
// OBSERVE: There is no click in this test, but the search still runs.
// TRY:     Search for 'Mouse' instead. Then search for '  Mouse  ' with
//          spaces around it (REQ-PROD-03 says spaces are ignored).
// -----------------------------------------------------------------------------
// test('3.2 search with the Enter key', async ({ page }) => {
//   await page.goto('/');
//
//   const search = page.getByLabel('Search products');
//   await search.fill('Cable');
//   await search.press('Enter');
//
//   await expect(page.getByText('1 product(s) found.')).toBeVisible();
//   await expect(page.getByRole('heading', { name: 'USB-C Cable' })).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Lab 3.3 — fill replaces, pressSequentially adds, clear empties
//
//   fill('abc')              -> the field becomes exactly 'abc'
//   pressSequentially('abc') -> types a, b, c one key at a time, AFTER any
//                               text that is already there
//   clear()                  -> empties the field
//
// toHaveValue checks what is typed inside an input.
//
// OBSERVE: Predict the value BEFORE each assertion, then run and check.
// -----------------------------------------------------------------------------
// test('3.3 fill vs pressSequentially vs clear', async ({ page }) => {
//   await page.goto('/');
//   const search = page.getByLabel('Search products');
//
//   await search.fill('Key');
//   await expect(search).toHaveValue('Key');
//
//   await search.fill('Mouse');
//   await expect(search).toHaveValue('Mouse');          // replaced
//
//   await search.pressSequentially(' Pad');
//   await expect(search).toHaveValue('Mouse Pad');      // added
//
//   await search.clear();
//   await expect(search).toHaveValue('');
// });

// -----------------------------------------------------------------------------
// Lab 3.4 — Navigation: links, back, reload
//
// page.goBack() is the browser's Back button. page.reload() refreshes.
//
// OBSERVE: After reload(), is the search text still there? Is the list still
//          filtered? Why? (Think: is the search stored in the URL?)
// -----------------------------------------------------------------------------
// test('3.4 navigate with links, back and reload', async ({ page }) => {
//   await page.goto('/');
//   await page.getByRole('link', { name: 'Log in' }).click();
//   await expect(page).toHaveURL(/login\.html/);
//
//   await page.goBack();
//   await expect(page).toHaveTitle('Products - Mini Shop');
//
//   await page.getByLabel('Search products').fill('Notebook');
//   await page.getByRole('button', { name: 'Search' }).click();
//   await expect(page.getByText('1 product(s) found.')).toBeVisible();
//
//   await page.reload();
//   await expect(page.getByText('6 product(s) found.')).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Lab 3.5 — A small user flow: add to cart, change quantity
//
// Actions inside a locator chain: the "Update" button of ONE cart row.
// A table row (<tr>) has role 'row'; its name is the text in its cells.
//
// OBSERVE: The quantity input is type="number". fill() still takes a STRING.
// TRY:     Change '3' to '4'. The headphones have stock 3 (business rule
//          BR-QTY-4). What does the page show? Which assertions fail?
// -----------------------------------------------------------------------------
// test('3.5 change the quantity in the cart', async ({ page }) => {
//   await page.goto('/login.html');
//   await page.getByLabel('Username').fill('alice');
//   await page.getByLabel('Password').fill('alice123');
//   await page.getByRole('button', { name: 'Log in' }).click();
//
//   const card = page.getByRole('listitem', { name: 'Noise Cancelling Headphones' });
//   await card.getByRole('button', { name: 'Add to cart' }).click();
//   await expect(page.getByRole('status')).toHaveText('Noise Cancelling Headphones was added to your cart.');
//
//   await page.getByRole('link', { name: 'Cart' }).click();
//   const row = page.getByRole('row', { name: /Noise Cancelling Headphones/ });
//   await row.getByLabel('Quantity').fill('3');
//   await row.getByRole('button', { name: 'Update' }).click();
//
//   await expect(page.getByRole('status')).toHaveText('Cart updated.');
//   await expect(row.getByLabel('Quantity')).toHaveValue('3');
// });

// -----------------------------------------------------------------------------
// Lab 3.6 — Clicking a disabled button                       [EXPECTED: FAIL]
//
// The 27-inch Monitor is out of stock, so its button is disabled.
// click() WAITS for the button to become enabled... and it never does.
// We shorten the wait to 2 seconds with { timeout: 2000 }.
//
// OBSERVE: Read the call log: "element is not enabled", "retrying click
//          action". Playwright kept trying until the timeout.
//
// FIX: A disabled button is the CORRECT behavior (REQ-PROD-05). Replace the
//      click with an assertion:
//        await expect(button).toBeDisabled();
// -----------------------------------------------------------------------------
// test('3.6 the out-of-stock button cannot be clicked', async ({ page }) => {
//   await page.goto('/');
//   const card = page.getByRole('listitem', { name: '27-inch Monitor' });
//   const button = card.getByRole('button', { name: 'Add to cart' });
//
//   await button.click({ timeout: 2000 });
// });

// -----------------------------------------------------------------------------
// Lab 3.7 — Focus and the Tab key
//
// page.keyboard presses keys on whatever element has focus.
// toBeFocused() checks which element has the keyboard focus.
//
// OBSERVE: A test can check keyboard accessibility: can a user move from the
//          Username field to the Password field with Tab?
// -----------------------------------------------------------------------------
// test('3.7 Tab moves focus from Username to Password', async ({ page }) => {
//   await page.goto('/login.html');
//
//   await page.getByLabel('Username').click();
//   await expect(page.getByLabel('Username')).toBeFocused();
//
//   await page.keyboard.press('Tab');
//   await expect(page.getByLabel('Password')).toBeFocused();
//
//   await page.keyboard.type('alice123');
//   await expect(page.getByLabel('Password')).toHaveValue('alice123');
// });

// -----------------------------------------------------------------------------
// Lab 3.8 — Your turn
//
// Log in as bob / bob123, then click "Log out".
// REQ-AUTH-05: after logging out, the user is on the Login page.
//   - Assert the URL ends with login.html
//   - Assert the navigation bar shows a "Log in" link again
// -----------------------------------------------------------------------------
// test('3.8 a user can log out', async ({ page }) => {
//   // TODO
// });
