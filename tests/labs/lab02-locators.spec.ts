// =============================================================================
// LAB 02 — Locators: Finding Elements
// Guide: guides/LABS.md
//
// You learn
//   - user-facing locators: getByRole, getByLabel, getByText
//   - strict mode: a locator used for an action must match exactly ONE element
//   - narrowing: first(), nth(), filter(), and chaining locators
//   - CSS locators (and why they are the last resort)
//   - codegen: let Playwright suggest a locator for you
//
// How to use this file
//   Uncomment ONE block at a time (Ctrl+/), run, and answer the OBSERVE notes:
//     npx playwright test tests/labs/lab02-locators.spec.ts
//   "No tests found" means you have not uncommented a block yet.
//
// A LOCATOR is a recipe for finding element(s). Creating one does NOT touch
// the page. Playwright looks for the element only when you act on it
// (click, fill) or assert on it (expect).
// =============================================================================

import { test, expect } from '@playwright/test';

// -----------------------------------------------------------------------------
// Lab 2.1 — getByRole: find elements the way a user (or screen reader) does
//
// Every element has a ROLE (heading, link, button, textbox, listitem, ...) and
// an accessible NAME (usually its visible text or its label).
//   <h1>Products</h1>              -> role 'heading', name 'Products'
//   <a href="/cart.html">Cart</a>  -> role 'link',    name 'Cart'
//   <button>Search</button>        -> role 'button',  name 'Search'
//
// OBSERVE: There is no id or class in any locator below. The test would still
//          pass if a developer renamed every CSS class in the app.
// -----------------------------------------------------------------------------
// test('2.1 getByRole finds heading, links and buttons', async ({ page }) => {
//   await page.goto('/');
//
//   await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
//   await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();
//   await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
//   await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
//
//   // The heading level can be part of the recipe: <h2> is level 2.
//   await expect(page.getByRole('heading', { name: 'Wireless Mouse', level: 2 })).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Lab 2.2 — getByLabel and getByText
//
//   getByLabel('Username')  -> the input connected to <label for="username">
//   getByText('...')        -> an element by its visible text
//
// By default getByText matches PART of the text and ignores upper/lower case.
// Use { exact: true } to match the whole text exactly.
//
// OBSERVE: getByText('keyboard') is lower case and only PART of the heading
//          "Mechanical Keyboard", yet it is found. Why?
// TRY:     Add { exact: true } to getByText('keyboard'). Run again. What
//          does the error say, and why? Then change the text to
//          'Mechanical Keyboard' (with exact: true) and make it pass.
// -----------------------------------------------------------------------------
// test('2.2 getByLabel and getByText', async ({ page }) => {
//   await page.goto('/login.html');
//   await expect(page.getByLabel('Username')).toBeVisible();
//   await expect(page.getByLabel('Password')).toBeVisible();
//
//   await page.goto('/');
//   await expect(page.getByText('keyboard')).toBeVisible();
//   await expect(page.getByText('Out of stock', { exact: true })).toBeVisible();
//   await expect(page.getByText('$200.00')).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Lab 2.3 — Strict mode violation                            [EXPECTED: FAIL]
//
// Every product card has an "Add to cart" button, so this locator matches
// SIX elements. Playwright refuses to guess which one you meant.
//
// OBSERVE: Read the error "strict mode violation". Playwright lists every
//          element that matched, and even suggests better locators.
//
// FIX: Lab 2.4 shows how to narrow it down. For now, change the assertion to
//      count the buttons instead:
//        await expect(page.getByRole('button', { name: 'Add to cart' })).toHaveCount(6);
// -----------------------------------------------------------------------------
// test('2.3 a locator that matches too many elements', async ({ page }) => {
//   await page.goto('/');
//
//   await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Lab 2.4 — Narrowing down: first, last, nth, filter, chaining
//
//   locator.first() / .last() / .nth(i)   by position (nth starts at 0!)
//   locator.filter({ hasText: '...' })    keep only matches containing text
//   parent.getByRole(...)                 search INSIDE another locator
//
// Each product card is an <li aria-label="Product name">, so
// getByRole('listitem', { name: 'USB-C Cable' }) finds exactly one card.
//
// OBSERVE: Which style tells a reader MOST clearly which button is meant?
//          Position-based locators (nth) break when the order changes.
// -----------------------------------------------------------------------------
// test('2.4 narrowing a locator', async ({ page }) => {
//   await page.goto('/');
//   const cards = page.getByRole('listitem');
//
//   await expect(cards).toHaveCount(6);
//   await expect(cards.first()).toContainText('Mechanical Keyboard');
//   await expect(cards.last()).toContainText('Paper Notebook');
//   await expect(cards.nth(2)).toContainText('USB-C Cable');
//
//   // filter: the card that contains the text 'Out of stock'
//   const outOfStock = cards.filter({ hasText: 'Out of stock' });
//   await expect(outOfStock).toContainText('27-inch Monitor');
//
//   // chaining: the button INSIDE one card (best: clear and robust)
//   const cable = page.getByRole('listitem', { name: 'USB-C Cable' });
//   await expect(cable.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
//
//   const monitor = page.getByRole('listitem', { name: '27-inch Monitor' });
//   await expect(monitor.getByRole('button', { name: 'Add to cart' })).toBeDisabled();
// });

// -----------------------------------------------------------------------------
// Lab 2.5 — CSS locators: the last resort
//
// page.locator('css selector') works with ids (#), classes (.) and tags.
// It is sometimes necessary, but it ties the test to the HTML structure,
// not to what the user sees.
//
// OBSERVE: Both lines check the same search box. Which one would survive if
//          a developer changed id="search" to id="q"?
// -----------------------------------------------------------------------------
// test('2.5 CSS locators', async ({ page }) => {
//   await page.goto('/');
//
//   await expect(page.locator('#search')).toBeVisible();            // by id
//   await expect(page.getByLabel('Search products')).toBeVisible(); // by label
//
//   await expect(page.locator('.price')).toHaveCount(6);            // by class
//   await expect(page.locator('li .price').first()).toHaveText('$50.00');
// });

// -----------------------------------------------------------------------------
// Lab 2.6 — Locators are lazy
//
// A locator can be created BEFORE the element is visible. Mini Shop's error
// area (<div role="alert">) is EMPTY and HIDDEN when the page loads
// (CSS: .message:empty { display: none }) and appears when it gets text.
//
// getByRole() only finds elements a user can perceive, so a hidden element
// counts as "not there".
//
// OBSERVE: `message` is created once and checked twice. Each check looks at
//          the page at THAT moment.
// TRY:     Replace toBeHidden() with toHaveText(''). Why does it fail with
//          "element(s) not found"?
// -----------------------------------------------------------------------------
// test('2.6 a locator is a recipe, not an element', async ({ page }) => {
//   await page.goto('/login.html');
//   const message = page.getByRole('alert');   // nothing happens yet
//
//   await expect(message).toBeHidden();         // empty, so hidden at first
//
//   await page.getByRole('button', { name: 'Log in' }).click();
//   await expect(message).toHaveText('Username and password are required.');
// });

// -----------------------------------------------------------------------------
// Lab 2.7 — Your turn (and a helper tool)
//
// Playwright can suggest locators for you. In a terminal run:
//   npm start                                   (keep it running)
//   npx playwright codegen http://localhost:3100   (in a second terminal)
// Click around in the browser that opens; codegen writes the code.
// Use the "Pick locator" button to hover an element and see its locator.
//
// Then complete this test WITHOUT CSS selectors:
//   - On the home page, find the "Noise Cancelling Headphones" card
//   - Assert it contains the price '$80.00'
//   - Assert its "Add to cart" button is enabled
// -----------------------------------------------------------------------------
// test('2.7 the headphones card', async ({ page }) => {
//   await page.goto('/');
//   // TODO
// });
