// =============================================================================
// LAB 07 — REST API Testing with `request`
// Guide: guides/LABS.md     API table: README.md
//
// You learn
//   - the `request` fixture: an HTTP client, no browser needed
//   - GET / POST / PATCH / DELETE, query parameters, JSON bodies
//   - status(), ok(), json(), headers()
//   - sending an auth token in a header
//   - checking error responses
//
// How to use this file
//   Uncomment ONE block at a time (Ctrl+/), run, and answer the OBSERVE notes:
//     npx playwright test tests/labs/lab07-api-testing.spec.ts
//
// Reminder: the API uses CENTS. 2500 means $25.00.
// =============================================================================

import { test, expect } from '@playwright/test';

// Reset the in-memory data before every test (already active).
test.beforeEach(async ({ request }) => {
  await request.post('/api/test/reset');
});

// -----------------------------------------------------------------------------
// Lab 7.1 — Your first API request
//
//   const res = await request.get(url)   send the request, get a response
//   res.status()                          HTTP status code (200, 404, ...)
//   await res.json()                      parse the JSON body
//
// OBSERVE: No browser window is opened for this test (compare the duration
//          with a UI test). Add console.log(body) to see the whole JSON.
// -----------------------------------------------------------------------------
// test('7.1 GET /api/products lists all products', async ({ request }) => {
//   const res = await request.get('/api/products');
//
//   expect(res.status()).toBe(200);
//   const body = await res.json();
//   expect(body.products).toHaveLength(6);
//   expect(body.products[0].name).toBe('Mechanical Keyboard');
// });

// -----------------------------------------------------------------------------
// Lab 7.2 — Checking objects: toEqual and toMatchObject
//
//   toEqual(x)        the body must be EXACTLY x (every field)
//   toMatchObject(x)  the body must contain AT LEAST the fields in x
//
// expect(res).toBeOK() is a shortcut for "status is 200–299" and shows the
// response body in the error message if it fails.
//
// OBSERVE: Which assertion would break if the API added a new field such as
//          "description" to products?
// -----------------------------------------------------------------------------
// test('7.2 GET /api/products/:id returns one product', async ({ request }) => {
//   const res = await request.get('/api/products/3');
//   await expect(res).toBeOK();
//
//   const { product } = await res.json();
//   expect(product).toEqual({ id: 3, name: 'USB-C Cable', price: 1000, stock: 50 });
//   expect(product).toMatchObject({ name: 'USB-C Cable', price: 1000 });
// });

// -----------------------------------------------------------------------------
// Lab 7.3 — Error responses
//
// A good test checks the error path too: status code AND error body.
// Mini Shop errors look like: { "error": { "code": "...", "message": "..." } }
//
// OBSERVE: res.ok() is false for 4xx/5xx. Is that an exception? (No: the
//          request "worked", the server just answered with an error.)
// -----------------------------------------------------------------------------
// test('7.3 an unknown product returns 404', async ({ request }) => {
//   const res = await request.get('/api/products/999');
//
//   expect(res.ok()).toBe(false);
//   expect(res.status()).toBe(404);
//   const body = await res.json();
//   expect(body.error.code).toBe('NOT_FOUND');
//   expect(body.error.message).toBe('Product not found.');
// });

// -----------------------------------------------------------------------------
// Lab 7.4 — Query parameters and headers
//
// { params: { q: 'Mouse' } } adds ?q=Mouse to the URL (and encodes it).
// res.headers() returns the response headers (names in lower case).
//
// TRY: Search for '  Notebook  ' with spaces (REQ-PROD-03). And for 'zzz'.
// -----------------------------------------------------------------------------
// test('7.4 GET /api/products?q= searches by name', async ({ request }) => {
//   const res = await request.get('/api/products', { params: { q: 'Mouse' } });
//
//   expect(res.headers()['content-type']).toContain('application/json');
//   const { products } = await res.json();
//   expect(products).toHaveLength(1);
//   expect(products[0].name).toBe('Wireless Mouse');
//
//   // map() turns the list of products into a list of names
//   const all = await (await request.get('/api/products')).json();
//   const names = all.products.map((p: { name: string }) => p.name);
//   expect(names).toContain('Paper Notebook');
// });

// -----------------------------------------------------------------------------
// Lab 7.5 — POST with a JSON body: log in
//
// { data: {...} } sends a JSON body (Content-Type: application/json).
//
// OBSERVE: The token is a random string, different on every run. We check
//          that it EXISTS (toBeTruthy / typeof), not its exact value.
// TRY:     Send a wrong password. What status and error code come back?
//          Write the assertions for it.
// -----------------------------------------------------------------------------
// test('7.5 POST /api/auth/login returns a token', async ({ request }) => {
//   const res = await request.post('/api/auth/login', {
//     data: { username: 'alice', password: 'alice123' },
//   });
//
//   expect(res.status()).toBe(200);
//   const body = await res.json();
//   expect(typeof body.token).toBe('string');
//   expect(body.token).toBeTruthy();
//   expect(body.user).toEqual({ id: 1, username: 'alice', name: 'Alice', tier: 'REGULAR' });
// });

// -----------------------------------------------------------------------------
// Lab 7.6 — Authorization header
//
// Protected endpoints need:  Authorization: Bearer <token>
// Without it, the server answers 401 UNAUTHORIZED.
//
// OBSERVE: The SAME request gives 401 without the header and 200 with it.
// -----------------------------------------------------------------------------
// test('7.6 /api/auth/me needs a token', async ({ request }) => {
//   const noToken = await request.get('/api/auth/me');
//   expect(noToken.status()).toBe(401);
//   expect((await noToken.json()).error.code).toBe('UNAUTHORIZED');
//
//   const login = await request.post('/api/auth/login', {
//     data: { username: 'bob', password: 'bob123' },
//   });
//   const { token } = await login.json();
//
//   const me = await request.get('/api/auth/me', {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   expect(me.status()).toBe(200);
//   expect((await me.json()).user.tier).toBe('VIP');
// });

// -----------------------------------------------------------------------------
// Lab 7.7 — POST, PATCH, DELETE: a full cart scenario
//
//   POST   /api/cart/items              { productId, quantity }  -> 201
//   PATCH  /api/cart/items/:productId   { quantity }             -> 200
//   DELETE /api/cart/items/:productId                            -> 200
//
// OBSERVE: Each response returns the WHOLE cart, so we can check the result
//          of every step immediately.
// -----------------------------------------------------------------------------
// test('7.7 add, change and remove a cart item', async ({ request }) => {
//   const login = await request.post('/api/auth/login', {
//     data: { username: 'alice', password: 'alice123' },
//   });
//   const { token } = await login.json();
//   const auth = { Authorization: `Bearer ${token}` };
//
//   // add 2 x Wireless Mouse ($25.00)
//   let res = await request.post('/api/cart/items', {
//     headers: auth,
//     data: { productId: 2, quantity: 2 },
//   });
//   expect(res.status()).toBe(201);
//   let cart = await res.json();
//   expect(cart.items).toHaveLength(1);
//   expect(cart.subtotal).toBe(5000);
//
//   // change it to 3
//   res = await request.patch('/api/cart/items/2', { headers: auth, data: { quantity: 3 } });
//   expect(res.status()).toBe(200);
//   cart = await res.json();
//   expect(cart.items[0]).toMatchObject({ productId: 2, quantity: 3, lineTotal: 7500 });
//
//   // remove it
//   res = await request.delete('/api/cart/items/2', { headers: auth });
//   expect(res.status()).toBe(200);
//   cart = await res.json();
//   expect(cart.items).toEqual([]);
//   expect(cart.total).toBe(0);
// });

// -----------------------------------------------------------------------------
// Lab 7.8 — Validation errors
//
// Business rule BR-QTY-4: quantity must not exceed the stock.
// The headphones (id 4) have stock 3.
//
// OBSERVE: After a rejected request, we check the cart did NOT change
//          (REQ-CART-04). Checking "nothing changed" is an important habit.
// -----------------------------------------------------------------------------
// test('7.8 a quantity above stock is rejected', async ({ request }) => {
//   const { token } = await (await request.post('/api/auth/login', {
//     data: { username: 'alice', password: 'alice123' },
//   })).json();
//   const auth = { Authorization: `Bearer ${token}` };
//
//   const res = await request.post('/api/cart/items', {
//     headers: auth,
//     data: { productId: 4, quantity: 4 },
//   });
//   expect(res.status()).toBe(400);
//   expect((await res.json()).error).toEqual({
//     code: 'INVALID_QUANTITY',
//     message: 'Only 3 left in stock.',
//   });
//
//   const cart = await (await request.get('/api/cart', { headers: auth })).json();
//   expect(cart.items).toHaveLength(0);
// });

// -----------------------------------------------------------------------------
// Lab 7.9 — Your turn: place an order
//
// As alice:
//   1. Add 2 x Paper Notebook (id 6) to the cart
//   2. POST /api/orders  -> expect 201, order.status 'CREATED', order.total 1000
//   3. GET /api/cart     -> expect the cart to be empty        (REQ-ORD-01)
//   4. GET /api/products/6 -> expect stock 98                  (REQ-ORD-03)
// -----------------------------------------------------------------------------
// test('7.9 placing an order empties the cart and reduces stock', async ({ request }) => {
//   // TODO
// });
