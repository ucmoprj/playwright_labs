// =============================================================================
// LAB 12 — Network: Observe, Mock, and Break Requests
// Guide: guides/LABS.md
//
// You learn
//   - page.on('request'/'response')  watch the traffic between page and server
//   - page.route() + route.fulfill() answer a request with FAKE data (mock)
//   - route.fulfill({ status: 500 })  simulate a server error
//   - route.abort()                   simulate a network failure
//   - route.fetch()                   change a REAL response before the page
//                                     sees it
//
// How to use this file
//   Uncomment ONE block at a time (Ctrl+/), run, and answer the OBSERVE notes:
//     npx playwright test tests/labs/lab12-network.spec.ts
//
// Why mock? To test how the UI handles situations that are hard to create
// with the real server: an empty list, a huge list, an error, a timeout.
// Mocking only affects THIS page in THIS test. The real server is unchanged.
// =============================================================================

import { test, expect } from '@playwright/test';

// -----------------------------------------------------------------------------
// Lab 12.1 — Watch the network
//
// page.on('event', handler) calls handler every time the event happens.
// Register it BEFORE goto so you catch the first requests.
//
// OBSERVE: Which requests does the home page make? In which order?
//          Which one loads the product data?
// -----------------------------------------------------------------------------
// test('12.1 log every request and response', async ({ page }) => {
//   page.on('request', (req) => console.log('>>', req.method(), req.url()));
//   page.on('response', (res) => console.log('<<', res.status(), res.url()));
//
//   await page.goto('/');
//   await expect(page.getByText('6 product(s) found.')).toBeVisible();
// });

// -----------------------------------------------------------------------------
// Lab 12.2 — Mock a response with fake data
//
// page.route(urlPattern, handler) intercepts matching requests.
// route.fulfill({ json }) answers immediately — the request never reaches
// the server.
//
// URL patterns: '**' matches anything, so '**/api/products*' matches
// http://localhost:3100/api/products and /api/products?q=...
//
// OBSERVE: The page shows a product that does not exist in Mini Shop.
//          The UI is tested in isolation from the real data.
// -----------------------------------------------------------------------------
// test('12.2 show mocked products', async ({ page }) => {
//   await page.route('**/api/products*', async (route) => {
//     await route.fulfill({
//       json: {
//         products: [
//           { id: 101, name: 'Test Rocket', price: 999999, stock: 1 },
//           { id: 102, name: 'Test Pencil', price: 50, stock: 0 },
//         ],
//       },
//     });
//   });
//
//   await page.goto('/');
//
//   await expect(page.getByText('2 product(s) found.')).toBeVisible();
//   const rocket = page.getByRole('listitem', { name: 'Test Rocket' });
//   await expect(rocket).toContainText('$9999.99');
//   await expect(rocket).toContainText('In stock: 1');
//   await expect(page.getByRole('listitem', { name: 'Test Pencil' })).toContainText('Out of stock');
// });

// -----------------------------------------------------------------------------
// Lab 12.3 — Edge case: an empty list
//
// With the real data it is impossible to have zero products. With a mock it
// takes one line.
//
// TRY: Generate 100 products with Array.from and check the count message.
//        products: Array.from({ length: 100 }, (_, i) =>
//          ({ id: i + 1, name: `Item ${i + 1}`, price: 100, stock: 5 }))
// -----------------------------------------------------------------------------
// test('12.3 an empty catalog', async ({ page }) => {
//   await page.route('**/api/products*', (route) => route.fulfill({ json: { products: [] } }));
//
//   await page.goto('/');
//
//   await expect(page.getByText('No products found.')).toBeVisible();
//   await expect(page.getByRole('listitem')).toHaveCount(0);
// });

// -----------------------------------------------------------------------------
// Lab 12.4 — Simulate a server error
//
// What does the user see when the server fails? Mini Shop shows the error
// message from the response body in the role="alert" area.
//
// OBSERVE: You can test error handling without breaking the real server.
// -----------------------------------------------------------------------------
// test('12.4 a 500 error is shown to the user', async ({ page }) => {
//   await page.route('**/api/products*', (route) =>
//     route.fulfill({
//       status: 500,
//       json: { error: { code: 'SERVER_ERROR', message: 'The shop is temporarily unavailable.' } },
//     }),
//   );
//
//   await page.goto('/');
//
//   await expect(page.getByRole('alert')).toHaveText('The shop is temporarily unavailable.');
// });

// -----------------------------------------------------------------------------
// Lab 12.5 — Simulate a network failure
//
// route.abort() acts as if the connection was lost. The browser's fetch()
// throws an error, and Mini Shop shows its message.
//
// OBSERVE: The message comes from the BROWSER ("Failed to fetch" in
//          Chromium), not from the server. Is that a good message for a user?
//          (A finding like this could go into a usability defect report.)
// -----------------------------------------------------------------------------
// test('12.5 a lost connection', async ({ page }) => {
//   await page.route('**/api/products*', (route) => route.abort());
//
//   await page.goto('/');
//
//   await expect(page.getByRole('alert')).toHaveText('Failed to fetch');
// });

// -----------------------------------------------------------------------------
// Lab 12.6 — Change a real response
//
// route.fetch() sends the request to the REAL server and returns its
// response. You can then modify it before giving it to the page.
//
// Here: get the real product list, but set every stock to 0.
//
// OBSERVE: Real names and prices, fake stock. Every button is disabled.
// -----------------------------------------------------------------------------
// test('12.6 everything is out of stock', async ({ page }) => {
//   await page.route('**/api/products*', async (route) => {
//     const response = await route.fetch();
//     const body = await response.json();
//     for (const p of body.products) p.stock = 0;
//     await route.fulfill({ response, json: body });
//   });
//
//   await page.goto('/');
//
//   await expect(page.getByRole('listitem')).toHaveCount(6);
//   await expect(page.getByText('Out of stock', { exact: true })).toHaveCount(6);
//   for (const button of await page.getByRole('button', { name: 'Add to cart' }).all()) {
//     await expect(button).toBeDisabled();
//   }
// });

// -----------------------------------------------------------------------------
// Lab 12.7 — Check what the page SENDS
//
// page.waitForRequest() catches an outgoing request so you can inspect its
// body and headers. Useful to verify the UI sends the right data to the API.
//
// OBSERVE: The UI sends quantity 1 and the correct productId, plus the
//          Bearer token header.
// -----------------------------------------------------------------------------
// test('12.7 the Add to cart button sends the right request', async ({ page, request }) => {
//   await request.post('/api/test/reset');
//   await page.goto('/login.html');
//   await page.getByLabel('Username').fill('alice');
//   await page.getByLabel('Password').fill('alice123');
//   await page.getByRole('button', { name: 'Log in' }).click();
//   await expect(page.getByText('Signed in as Alice (REGULAR)')).toBeVisible();
//
//   const requestPromise = page.waitForRequest(
//     (req) => req.url().endsWith('/api/cart/items') && req.method() === 'POST',
//   );
//   await page.getByRole('listitem', { name: 'Wireless Mouse' })
//     .getByRole('button', { name: 'Add to cart' }).click();
//   const sent = await requestPromise;
//
//   expect(sent.postDataJSON()).toEqual({ productId: 2, quantity: 1 });
//   expect(sent.headers()['authorization']).toMatch(/^Bearer /);
// });

// -----------------------------------------------------------------------------
// Lab 12.8 — Your turn
//
// Log in as alice (any way you like), then mock POST /api/cart/items so it
// answers with status 400 and the body
//   { error: { code: 'INVALID_QUANTITY', message: 'Only 0 left in stock.' } }
// Click "Add to cart" on any product and check:
//   - the alert shows 'Only 0 left in stock.'
//   - the status area is empty
// Hint: in page.route you can check route.request().method().
// -----------------------------------------------------------------------------
// test('12.8 the UI shows a cart error from the server', async ({ page }) => {
//   // TODO
// });
