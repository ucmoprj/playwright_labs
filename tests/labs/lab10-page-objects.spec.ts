// =============================================================================
// LAB 10 — The Page Object Model (POM)
// Guide: guides/LABS.md
//
// You learn
//   - what a page object is and why teams use it
//   - a TypeScript class with a constructor, readonly locators, and methods
//   - page objects that return other page objects (navigation)
//   - keeping assertions in the TEST, not hidden in the page object
//
// How to use this file
//   The blocks in this lab BUILD ON EACH OTHER. Uncomment 10.1 first, then
//   10.2 (keep 10.1 active), and so on. Run after each block:
//     npx playwright test tests/labs/lab10-page-objects.spec.ts
//
// A PAGE OBJECT is a class that knows HOW to use one page (its locators and
// actions). Tests say WHAT the user does. When the HTML changes, you fix the
// page object in ONE place instead of in every test.
// =============================================================================

import { test, expect, type Page, type Locator } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('/api/test/reset');
});

// -----------------------------------------------------------------------------
// Lab 10.1 — Your first page object: LoginPage
//
//   class LoginPage {
//     readonly username: Locator;      a property that never changes
//     constructor(page: Page) { ... }  runs once when you write `new LoginPage(page)`
//     async login(u, p) { ... }        a method: one user action
//   }
//
// OBSERVE: The test has no getByLabel / getByRole. If the "Log in" button
//          were renamed "Sign in", which lines would you change?
// -----------------------------------------------------------------------------
// class LoginPage {
//   readonly page: Page;
//   readonly username: Locator;
//   readonly password: Locator;
//   readonly submit: Locator;
//   readonly error: Locator;
//
//   constructor(page: Page) {
//     this.page = page;
//     this.username = page.getByLabel('Username');
//     this.password = page.getByLabel('Password');
//     this.submit = page.getByRole('button', { name: 'Log in' });
//     this.error = page.getByRole('alert');
//   }
//
//   async goto() {
//     await this.page.goto('/login.html');
//   }
//
//   async login(username: string, password: string) {
//     await this.username.fill(username);
//     await this.password.fill(password);
//     await this.submit.click();
//   }
// }
//
// test('10.1 wrong password shows an error', async ({ page }) => {
//   const loginPage = new LoginPage(page);
//   await loginPage.goto();
//   await loginPage.login('alice', 'wrong');
//
//   await expect(loginPage.error).toHaveText('Invalid username or password.');
//   await expect(page).toHaveURL(/login\.html/);
// });

// -----------------------------------------------------------------------------
// Lab 10.2 — ProductsPage: methods with parameters
//
// productCard(name) returns a Locator, so the test can still make its own
// assertions on it.
//
// RULE OF THUMB: page objects do ACTIONS and give LOCATORS. The TEST decides
//                what is correct (the expect calls stay in the test).
// -----------------------------------------------------------------------------
// class ProductsPage {
//   readonly page: Page;
//   readonly searchBox: Locator;
//   readonly searchButton: Locator;
//   readonly resultCount: Locator;
//   readonly status: Locator;
//   readonly currentUser: Locator;
//
//   constructor(page: Page) {
//     this.page = page;
//     this.searchBox = page.getByLabel('Search products');
//     this.searchButton = page.getByRole('button', { name: 'Search' });
//     this.resultCount = page.getByText(/product\(s\) found|No products found/);
//     this.status = page.getByRole('status');
//     this.currentUser = page.getByText(/Signed in as/);
//   }
//
//   async goto() {
//     await this.page.goto('/');
//   }
//
//   async search(text: string) {
//     await this.searchBox.fill(text);
//     await this.searchButton.click();
//   }
//
//   productCard(name: string): Locator {
//     return this.page.getByRole('listitem', { name });
//   }
//
//   async addToCart(name: string) {
//     await this.productCard(name).getByRole('button', { name: 'Add to cart' }).click();
//   }
// }
//
// test('10.2 search with the ProductsPage object', async ({ page }) => {
//   const products = new ProductsPage(page);
//   await products.goto();
//   await products.search('Headphones');
//
//   await expect(products.resultCount).toHaveText('1 product(s) found.');
//   await expect(products.productCard('Noise Cancelling Headphones')).toContainText('$80.00');
// });

// -----------------------------------------------------------------------------
// Lab 10.3 — Page objects together
//
// Several page objects in one test. Notice how the test reads almost like
// the requirement it checks (REQ-AUTH-02 and REQ-CART-01).
//
// (Keep 10.1 and 10.2 active: this block uses LoginPage and ProductsPage.)
// -----------------------------------------------------------------------------
// test('10.3 log in and add a product', async ({ page }) => {
//   const loginPage = new LoginPage(page);
//   const products = new ProductsPage(page);
//
//   await loginPage.goto();
//   await loginPage.login('alice', 'alice123');
//   await expect(products.currentUser).toHaveText('Signed in as Alice (REGULAR)');
//
//   await products.addToCart('Wireless Mouse');
//   await expect(products.status).toHaveText('Wireless Mouse was added to your cart.');
// });

// -----------------------------------------------------------------------------
// Lab 10.4 — CartPage and a row helper
//
// A cart row has several parts (quantity input, Update, Remove). A small
// helper method returns an object of locators for one row.
//
// (Keep 10.1–10.3 active.)
//
// OBSERVE: The test changes the quantity without knowing that the input is
//          type="number" or that the button is inside a <td>.
// -----------------------------------------------------------------------------
// class CartPage {
//   readonly page: Page;
//   readonly status: Locator;
//   readonly error: Locator;
//   readonly subtotal: Locator;
//   readonly total: Locator;
//
//   constructor(page: Page) {
//     this.page = page;
//     this.status = page.getByRole('status');
//     this.error = page.getByRole('alert');
//     this.subtotal = page.getByTestId('subtotal');
//     this.total = page.getByTestId('total');
//   }
//
//   async goto() {
//     await this.page.goto('/cart.html');
//   }
//
//   row(productName: string) {
//     const row = this.page.getByRole('row', { name: new RegExp(productName) });
//     return {
//       quantity: row.getByLabel('Quantity'),
//       update: row.getByRole('button', { name: 'Update' }),
//       remove: row.getByRole('button', { name: 'Remove' }),
//     };
//   }
//
//   async setQuantity(productName: string, quantity: number) {
//     const row = this.row(productName);
//     await row.quantity.fill(String(quantity));
//     await row.update.click();
//   }
// }
//
// test('10.4 change a quantity with the CartPage object', async ({ page }) => {
//   const loginPage = new LoginPage(page);
//   const products = new ProductsPage(page);
//   const cart = new CartPage(page);
//
//   await loginPage.goto();
//   await loginPage.login('alice', 'alice123');
//   await products.addToCart('Paper Notebook');
//   await expect(products.status).toHaveText('Paper Notebook was added to your cart.');
//
//   await cart.goto();
//   await cart.setQuantity('Paper Notebook', 4);
//
//   await expect(cart.status).toHaveText('Cart updated.');
//   await expect(cart.row('Paper Notebook').quantity).toHaveValue('4');
//   await expect(cart.subtotal).toHaveText('$20.00');
// });

// -----------------------------------------------------------------------------
// Lab 10.5 — Your turn
//
// Write an OrdersPage class with:
//   - goto()                     opens '/orders.html'
//   - status                     the role="status" message
//   - orderStatus(id: number)    returns the status cell Locator of
//                                "Order #<id>"  (hint: getByTestId('order-status')
//                                inside the row)
//   - pay(id: number)            clicks Pay in that row
// Then write a test: log in, add a product, place the order on the cart page
// (add a placeOrder() method to CartPage), pay it, and check status 'PAID'.
//
// BONUS: Move all page objects into tests/labs/pages/*.ts files and import
//        them. This is how real projects organize page objects.
// -----------------------------------------------------------------------------
// // TODO: class OrdersPage { ... }
// // TODO: test('10.5 ...', async ({ page }) => { ... });
