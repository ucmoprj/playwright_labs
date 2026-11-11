// =============================================================================
// BEFORE YOU START — Setup (do this once)
//
// 1. Install the packages and the test browser (from the project folder):
//      npm install
//      npx playwright install chromium
//    You do NOT need to start Mini Shop yourself: Playwright starts it
//    automatically when you run tests (see `webServer` in playwright.config.ts).
//
// 2. Open the `lab-playwright` folder itself in VS Code (File > Open Folder),
//    not a parent folder.
//
// 3. Install the VS Code extension "Playwright Test for VSCode"
//    (ms-playwright.playwright). VS Code suggests it when you open the folder.
//    No suggestion? Press Ctrl+Shift+X, type @recommended, click Install.
//    Then a green ▶ button appears next to every UNCOMMENTED test(...).
//    (After uncommenting a block, save with Ctrl+S to see its button.)
//
// 4. Watching the browser
//    By default tests run HEADLESS: the browser works in the background and
//    you see no window. To see what happens:
//      VS Code : Testing sidebar (flask icon) > PLAYWRIGHT panel >
//                check "Show browser" (and "Show trace viewer"), then run ▶
//      Terminal: add --headed  (a browser window opens)
//                add --ui      (UI mode: click each step to see the page
//                               at that moment — best for short tests)
//                add --debug   (step through the test line by line)
//    Short tests finish in under a second. If the window only flashes, use
//    --ui and click the steps in the "Actions" list.
// =============================================================================
//
// =============================================================================
// LAB 01 — Your First Test
// Guide: guides/LABS.md
//
// You learn
//   - the shape of a Playwright test: test(), async/await, the `page` fixture
//   - page.goto() and baseURL
//   - your first assertions: toHaveTitle, toHaveURL
//   - how to run ONE file, ONE test, and watch the browser
//   - how to read a failing test
//
// How to use this file
//   1. Block 1.1 is already active. Run it:
//        npx playwright test tests/labs/lab01-first-test.spec.ts
//   2. Uncomment ONE block at a time (select the lines, press Ctrl+/ in
//      VS Code), run the file again, and answer the OBSERVE questions.
//   3. Blocks marked [EXPECTED: FAIL] fail on purpose. Read the error, then
//      follow the FIX instructions.
// =============================================================================

import { test, expect } from "@playwright/test";

// -----------------------------------------------------------------------------
// Lab 1.1 — The smallest useful test                       (already active)
//
//   test('title', async ({ page }) => { ... })
//     - 'title'      : a sentence that says what the test checks
//     - async        : the function contains `await`
//     - { page }     : Playwright gives every test a NEW, empty browser tab
//
//   await page.goto('/')
//     - '/' is joined with `baseURL` from playwright.config.ts, so the browser
//       opens http://localhost:3100/
//     - `await` means "wait until this step is finished before the next line"
//
// OBSERVE: How many tests ran? How long did it take? Where does the output say
//          "passed"?
// -----------------------------------------------------------------------------
test("1.1 the home page has the right title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Products - Mini Shop");
});

// -----------------------------------------------------------------------------
// Lab 1.2 — One test, several checks
//
// A test can visit more than one page and make more than one assertion.
// toHaveURL accepts a full string OR a regular expression (/.../).
// In a regular expression a dot means "any character", so we write `\.` to
// mean a real dot.
//
// OBSERVE: Both pages are checked in ONE test. If the first check failed,
//          would the second one still run?
// -----------------------------------------------------------------------------
// test('1.2 the login page opens from its URL', async ({ page }) => {
//   await page.goto('/login.html');
//
//   await expect(page).toHaveURL('http://localhost:3100/login.html');
//   await expect(page).toHaveURL(/login\.html$/);
//   await expect(page).toHaveTitle('Log in - Mini Shop');
//
//   await page.goto('/cart.html');
//   await expect(page).toHaveTitle(/Mini Shop/);
// });

// -----------------------------------------------------------------------------
// Lab 1.3 — Run only what you want, and watch it
//
// Try these commands one by one (from the project folder):
//
//   npx playwright test tests/labs/lab01-first-test.spec.ts -g "1.3"
//       -g (grep) runs only tests whose title contains "1.3"
//   npx playwright test tests/labs/lab01-first-test.spec.ts -g "1.3" --headed
//       --headed opens a real browser window so you can watch
//   npx playwright test tests/labs/lab01-first-test.spec.ts --ui
//       UI mode: click a test to run it, then click each step to time-travel
//
// The test below clicks through the navigation bar so there is something to
// watch. `page.getByRole('link', { name: 'Cart' })` finds the link whose text
// is "Cart" (Lab 02 explains locators in detail).
//
// OBSERVE: In --headed mode the browser closes very quickly. In --ui mode,
//          click each line in the "Actions" list. What do you see?
// -----------------------------------------------------------------------------
// test('1.3 the navigation bar links to the Login page', async ({ page }) => {
//   await page.goto('/');
//
//   await page.getByRole('link', { name: 'Log in' }).click();
//
//   await expect(page).toHaveURL(/login\.html/);
//   await expect(page).toHaveTitle('Log in - Mini Shop');
// });

// -----------------------------------------------------------------------------
// Lab 1.4 — Read a failing test                              [EXPECTED: FAIL]
//
// The expected title below is wrong on purpose.
//
// OBSERVE in the terminal:
//   - "Expected" vs "Received"  : what the test wanted vs what the page had
//   - "5 × locator resolved..." : Playwright RETRIED for 5 seconds before
//                                 giving up (assertions wait automatically)
//   - the code frame with ">"   : the exact failing line
// Then open the HTML report:   npx playwright show-report
//   and click the failed test. Look at the screenshot and the trace.
//
// FIX: The title shown in the browser tab is the truth here. Correct the
//      expected value and run again until it passes.
// -----------------------------------------------------------------------------
// test('1.4 the login page title (contains a mistake)', async ({ page }) => {
//   await page.goto('/login.html');
//
//   await expect(page).toHaveTitle('Login - Mini Shop');
// });

// -----------------------------------------------------------------------------
// Lab 1.5 — Forgetting `await`                               [EXPECTED: FAIL]
//
// Almost every Playwright call returns a Promise and needs `await`.
// The second assertion below has NO `await`, AND its expected value is wrong.
//
// OBSERVE: Look for "Test ended." in the call log. That line is the clue that
//          the test finished BEFORE the assertion was done — usually because
//          an `await` is missing.
//
// FIX: Add `await` in front of the second `expect`. Run again: now the error
//      is a normal "Expected/Received" failure. Then fix the title too.
//
// TIP: VS Code can warn you about missing awaits. Rule of thumb:
//      every line that starts with `page.` or `expect(` needs `await`.
// -----------------------------------------------------------------------------
// test('1.5 a missing await', async ({ page }) => {
//   await page.goto('/');
//
//   await expect(page).toHaveURL(/localhost:3100/);
//   expect(page).toHaveTitle('Mini Shop');
// });

// -----------------------------------------------------------------------------
// Lab 1.6 — Screenshots and console output
//
// page.screenshot() saves a picture of the page. console.log() prints to the
// terminal where you ran the test (NOT to the browser console).
//
// OBSERVE: After the run, open test-results/lab01-products.png.
//          Find the console.log line in the terminal output.
// TRY:     Add `fullPage: true` to the screenshot options. What changes?
// -----------------------------------------------------------------------------
// test('1.6 take a screenshot', async ({ page }) => {
//   await page.goto('/');
//   await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
//
//   await page.screenshot({ path: 'test-results/lab01-products.png' });
//
//   console.log('The current URL is', page.url());
// });

// -----------------------------------------------------------------------------
// Lab 1.7 — Your turn
//
// Write a test that opens the Orders page ('/orders.html') WITHOUT logging in.
// Requirement REQ-AUTH-06 says the user must be redirected to the Login page.
//   - Assert the URL ends with login.html
//   - Assert the title is 'Log in - Mini Shop'
// -----------------------------------------------------------------------------
// test('1.7 orders page redirects to login when logged out', async ({ page }) => {
//   // TODO: write the test
// });
