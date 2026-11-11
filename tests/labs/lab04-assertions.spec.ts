// =============================================================================
// LAB 04 — Assertions: Checking Results
// Guide: guides/LABS.md
//
// You learn
//   - web-first assertions on locators (they WAIT and RETRY):
//       toBeVisible, toHaveText, toContainText, toHaveCount, toHaveValue,
//       toBeEnabled, toBeDisabled, toHaveAttribute, toBeHidden
//   - .not to reverse an assertion
//   - plain value assertions (they do NOT wait):
//       toBe, toEqual, toContain, toBeGreaterThan, toMatchObject
//   - soft assertions and custom failure messages
//
// How to use this file
//   Uncomment ONE block at a time (Ctrl+/), run, and answer the OBSERVE notes:
//     npx playwright test tests/labs/lab04-assertions.spec.ts
//
// Two kinds of expect:
//   await expect(locator).toHaveText('x')   -> looks at the PAGE, retries up
//                                              to 5 s until it passes
//   expect(value).toBe('x')                 -> checks a VALUE you already
//                                              have, once, immediately
// =============================================================================

import { test, expect } from '@playwright/test';

// -----------------------------------------------------------------------------
// Lab 4.1 — toHaveText vs toContainText
//
//   toHaveText('abc')     the WHOLE text must be 'abc'
//   toContainText('abc')  the text must CONTAIN 'abc'
//   Both also accept a regular expression: /abc/ or /abc/i (i = ignore case)
//
// Whitespace at the start/end is ignored by both.
//
// OBSERVE: The card text is "Wireless Mouse $25.00 In stock: 15 Add to cart".
// TRY:     Change the toContainText to toHaveText. Read the error.
// -----------------------------------------------------------------------------
// test('4.1 toHaveText vs toContainText', async ({ page }) => {
//   await page.goto('/');
//   const mouse = page.getByRole('listitem', { name: 'Wireless Mouse' });
//
//   await expect(mouse.getByRole('heading')).toHaveText('Wireless Mouse');
//   await expect(mouse).toContainText('$25.00');
//   await expect(mouse).toContainText(/in stock: \d+/i);
//   await expect(page.getByText(/product\(s\) found/)).toHaveText('6 product(s) found.');
// });

// -----------------------------------------------------------------------------
// Lab 4.2 — Lists: toHaveCount and toHaveText([...])
//
// When a locator matches several elements:
//   toHaveCount(n)          checks HOW MANY matched
//   toHaveText([a, b, c])   checks the text of EACH one, in order
//
// OBSERVE: `names` matches six <h2> elements, one per product card.
// TRY:     Swap the first two names in the array. What does the error show?
// -----------------------------------------------------------------------------
// test('4.2 check a whole list at once', async ({ page }) => {
//   await page.goto('/');
//   const names = page.getByRole('listitem').getByRole('heading');
//
//   await expect(names).toHaveCount(6);
//   await expect(names).toHaveText([
//     'Mechanical Keyboard',
//     'Wireless Mouse',
//     'USB-C Cable',
//     'Noise Cancelling Headphones',
//     '27-inch Monitor',
//     'Paper Notebook',
//   ]);
// });

// -----------------------------------------------------------------------------
// Lab 4.3 — State of form elements
//
//   toHaveValue('x')          text inside an input
//   toHaveAttribute(n, v)     an HTML attribute
//   toBeEnabled/toBeDisabled  can the user use it?
//   toBeEmpty()               an input with no value
//
// OBSERVE: toHaveAttribute('type', 'password') proves the password is hidden
//          (shown as dots) — a small security check.
// -----------------------------------------------------------------------------
// test('4.3 form element state', async ({ page }) => {
//   await page.goto('/login.html');
//   const username = page.getByLabel('Username');
//   const password = page.getByLabel('Password');
//
//   await expect(username).toBeEmpty();
//   await expect(password).toHaveAttribute('type', 'password');
//   await expect(page.getByRole('button', { name: 'Log in' })).toBeEnabled();
//
//   await username.fill('alice');
//   await expect(username).toHaveValue('alice');
//   await expect(username).not.toBeEmpty();
// });

// -----------------------------------------------------------------------------
// Lab 4.4 — .not and toBeHidden
//
// .not reverses any assertion. A "not" assertion ALSO waits: it retries until
// the thing is gone (or the timeout passes).
//
// OBSERVE: After the search, "Wireless Mouse" is no longer on the page.
//          toBeHidden() and not.toBeVisible() mean the same thing.
// -----------------------------------------------------------------------------
// test('4.4 not and hidden', async ({ page }) => {
//   await page.goto('/');
//   const mouse = page.getByRole('heading', { name: 'Wireless Mouse' });
//   await expect(mouse).toBeVisible();
//
//   await page.getByLabel('Search products').fill('Keyboard');
//   await page.getByRole('button', { name: 'Search' }).click();
//
//   await expect(mouse).toBeHidden();
//   await expect(mouse).not.toBeVisible();
//   await expect(page).not.toHaveURL(/login/);
//   await expect(page.getByText('No products found.')).not.toBeVisible();
// });

// -----------------------------------------------------------------------------
// Lab 4.5 — Plain value assertions (no page, no await on expect)
//
//   toBe(x)            same value (use for numbers, strings, booleans)
//   toEqual(obj)       same CONTENT (use for objects and arrays)
//   toContain(item)    array contains item / string contains text
//   toMatchObject(o)   object has AT LEAST these properties
//   toBeGreaterThan(n), toBeLessThanOrEqual(n), toBeTruthy(), toBeNull() ...
//
// OBSERVE: These checks run instantly; there is nothing to wait for.
// TRY:     Change `toEqual` on the object to `toBe`. Why does it fail even
//          though the content is identical? (toBe checks "is it the SAME
//          object in memory", not "does it look the same".)
// -----------------------------------------------------------------------------
// test('4.5 plain value assertions', async () => {
//   const price = 2500;
//   const name = 'Wireless Mouse';
//   const tiers = ['REGULAR', 'VIP'];
//   const user = { id: 1, name: 'Alice', tier: 'REGULAR' };
//
//   expect(price).toBe(2500);
//   expect(price / 100).toBe(25);
//   expect(price).toBeGreaterThan(1000);
//   expect(name).toContain('Mouse');
//   expect(name).toMatch(/^Wireless/);
//   expect(tiers).toContain('VIP');
//   expect(tiers).toHaveLength(2);
//   expect(user).toEqual({ id: 1, name: 'Alice', tier: 'REGULAR' });
//   expect(user).toMatchObject({ tier: 'REGULAR' });
// });

// -----------------------------------------------------------------------------
// Lab 4.6 — Reading values from the page
//
// Sometimes you need the text as a value, e.g. to do arithmetic.
//   await locator.textContent()   -> string (or null)
//   await locator.inputValue()    -> the value of an input
//   await locator.count()         -> number of matches
//   await locator.allTextContents() -> array of strings, one per match
//
// WARNING: these read the value ONCE and never retry. count() and
// allTextContents() do not even wait for the element. Prefer web-first
// assertions (Lab 4.1–4.4) whenever possible. Here we first wait with a
// web-first assertion, THEN read the values.
//
// OBSERVE: The test parses "$50.00" into the number 50.
// -----------------------------------------------------------------------------
// test('4.6 read text and compute with it', async ({ page }) => {
//   await page.goto('/');
//   const prices = page.locator('.price');
//   await expect(prices).toHaveCount(6);            // wait until loaded
//
//   const first = await prices.first().textContent(); // "$50.00" //textContent can return null
//   const value = Number(first!.replace('$', ''));
//   expect(value).toBe(50);
//
//   const all = await prices.allTextContents();      // ["$50.00", "$25.00", ...]
//   const total = all.map((t) => Number(t.replace('$', ''))).reduce((a, b) => a + b, 0);
//   expect(total).toBe(370);
// });

// -----------------------------------------------------------------------------
// Lab 4.7 — Soft assertions                                  [EXPECTED: FAIL]
//
// A normal assertion STOPS the test at the first failure.
// expect.soft() records the failure and CONTINUES, so you see every problem
// in one run. The test is still marked as failed at the end.
//
// Two of the soft checks below are wrong on purpose.
//
// OBSERVE: How many errors are reported? Did the last line (a normal
//          expect) still run?
// TRY:     Change the two expect.soft to plain expect. How many errors now?
// FIX:     Correct the two wrong values (look at the page or the catalog in
//          requirements/business-rules.md).
// -----------------------------------------------------------------------------
// test('4.7 soft assertions report every failure', async ({ page }) => {
//   await page.goto('/');
//   const keyboard = page.getByRole('listitem', { name: 'Mechanical Keyboard' });
//
//   await expect.soft(keyboard).toContainText('$55.00');
//   await expect.soft(keyboard).toContainText('In stock: 25');
//   await expect.soft(keyboard.getByRole('button')).toBeEnabled();
//
//   await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Lab 4.8 — Custom messages and custom timeouts             [EXPECTED: FAIL]
//
//   expect(locator, 'message').toBeVisible()      message shown on failure
//   toBeVisible({ timeout: 1000 })                wait at most 1 s
//
// The text below never appears (wrong spelling), so the test fails after 1 s.
//
// OBSERVE: Your custom message appears at the top of the error. Which is
//          easier to understand: your message, or the locator alone?
// FIX:     REQ-PROD-04 gives the exact text. Correct it.
// -----------------------------------------------------------------------------
// test('4.8 a helpful failure message', async ({ page }) => {
//   await page.goto('/');
//   await page.getByLabel('Search products').fill('Spaceship');
//   await page.getByRole('button', { name: 'Search' }).click();
//
//   await expect(
//     page.getByText('No product found.'),
//     'an unknown product should show the "not found" message (REQ-PROD-04)',
//   ).toBeVisible({ timeout: 1000 });
// });

// -----------------------------------------------------------------------------
// Lab 4.9 — Your turn
//
// On the home page, write assertions that check:
//   - exactly ONE card contains the text 'Out of stock'
//   - the "Paper Notebook" card contains '$5.00'
//   - the search box is empty when the page opens
//   - after searching 'Mouse', exactly one card is shown
// -----------------------------------------------------------------------------
// test('4.9 your assertions', async ({ page }) => {
//   await page.goto('/');
//   // TODO
// });
