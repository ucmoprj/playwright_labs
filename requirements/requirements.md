# Mini Shop — Functional Requirements

Mini Shop is a small online store. Customers log in, search products, manage a
shopping cart, and place, pay for, and cancel orders.

These requirements are the **source of truth** for testing. When the
application's behavior differs from this document, the application is
considered defective unless the requirement itself is shown to be wrong.

Detailed rules (limits, discounts, order states) are in
[business-rules.md](business-rules.md).

---

## 1. Authentication

| ID | Requirement |
|---|---|
| REQ-AUTH-01 | A user can log in with a valid username and password. |
| REQ-AUTH-02 | After a successful login, the user is taken to the Products page and the navigation bar shows `Signed in as <name> (<tier>)`. |
| REQ-AUTH-03 | If the username or password is wrong, the system shows the error `Invalid username or password.` and the user stays on the Login page. The message must not reveal which field was wrong. |
| REQ-AUTH-04 | If the username or password is empty, the system shows the error `Username and password are required.` |
| REQ-AUTH-05 | A logged-in user can log out. After logging out, the user is taken to the Login page. |
| REQ-AUTH-06 | Cart and Orders pages require login. A user who is not logged in and opens these pages is redirected to the Login page. |

## 2. Product Search

| ID | Requirement |
|---|---|
| REQ-PROD-01 | The Products page lists all products with name, price, and stock status. |
| REQ-PROD-02 | A user can search products by name. Search matches any part of the product name and is **case-insensitive**. |
| REQ-PROD-03 | Leading and trailing spaces in the search text are ignored. An empty search shows all products. |
| REQ-PROD-04 | If no product matches, the page shows `No products found.` |
| REQ-PROD-05 | A product with stock 0 is shown as `Out of stock` and cannot be added to the cart. |

## 3. Shopping Cart

| ID | Requirement |
|---|---|
| REQ-CART-01 | A logged-in user can add a product to the cart from the Products page. Each click adds 1 unit. |
| REQ-CART-02 | Adding a product that is already in the cart increases its quantity by 1. |
| REQ-CART-03 | A user can change the quantity of an item in the cart. Allowed quantities are defined in BR-QTY. |
| REQ-CART-04 | If a quantity is not allowed, the system shows an error message and the cart keeps its previous quantity. |
| REQ-CART-05 | A user can remove an item from the cart. |
| REQ-CART-06 | The cart shows the subtotal, the discount (amount and percent), and the total. Discounts follow BR-DISC. |

## 4. Orders

| ID | Requirement |
|---|---|
| REQ-ORD-01 | A user can place an order from a non-empty cart. The new order has status `CREATED`, and the cart becomes empty. |
| REQ-ORD-02 | Placing an order with an empty cart is rejected with the error `Your cart is empty.` |
| REQ-ORD-03 | Placing an order reduces the stock of each ordered product by the ordered quantity. |
| REQ-ORD-04 | The order stores the subtotal, discount, and total calculated at the time the order was placed. |
| REQ-ORD-05 | A user can pay for an order. Payment follows BR-STATE. |
| REQ-ORD-06 | A user can cancel an order. Cancellation follows BR-STATE. When an order is cancelled, the stock of each product is restored. |
| REQ-ORD-07 | A user can see only their own orders. |

---

## 5. Test Accounts

| Username | Password | Name | Tier |
|---|---|---|---|
| `alice` | `alice123` | Alice | REGULAR |
| `bob` | `bob123` | Bob | VIP |

## 6. Test Support API

These endpoints exist only to support automated testing. They are **not**
shop features and are not covered by the requirements above.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/test/reset` | Restore all data (products, stock, carts, orders, sessions) to the initial state. |
| POST | `/api/test/orders/:id/ship` | Simulate the warehouse shipping a `PAID` order (`PAID` → `SHIPPED`). |
