# Playwright Lab

In this lab you write automated tests for an existing web application with
**Playwright**: end-to-end (browser) tests and REST API tests.

No AI tools are used in this lab. You design and write every test yourself.

## Lab Steps

| Step | Topic | Guide |
|---|---|---|
| 0 | Setup and Playwright basics | [guides/STEP-0-setup.md](guides/STEP-0-setup.md) |
| Labs 01–12 | Playwright syntax, step by step (locators → fixtures → network mocking) | [guides/LABS.md](guides/LABS.md) |
| … | _more steps coming soon_ | |

## System Under Test: Mini Shop

A small online store with a RESTful JSON API and a plain HTML front end.

```bash
npm install
npm start          # http://localhost:3100
```

- Requirements: [requirements/requirements.md](requirements/requirements.md)
- Business rules: [requirements/business-rules.md](requirements/business-rules.md)
- Test accounts: `alice` / `alice123` (REGULAR), `bob` / `bob123` (VIP)

### REST API

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | – | Log in. Body: `{ username, password }`. Returns `{ token, user }`. |
| POST | `/api/auth/logout` | ✔ | Log out. |
| GET | `/api/auth/me` | ✔ | Current user. |
| GET | `/api/products?q=` | – | List or search products. |
| GET | `/api/products/:id` | – | Product details. |
| GET | `/api/cart` | ✔ | Cart items, subtotal, discount, total. |
| POST | `/api/cart/items` | ✔ | Add a product. Body: `{ productId, quantity }`. |
| PATCH | `/api/cart/items/:productId` | ✔ | Change quantity. Body: `{ quantity }`. |
| DELETE | `/api/cart/items/:productId` | ✔ | Remove an item. |
| GET | `/api/orders` | ✔ | List your orders. |
| GET | `/api/orders/:id` | ✔ | Order details. |
| POST | `/api/orders` | ✔ | Place an order from the cart. |
| POST | `/api/orders/:id/pay` | ✔ | Pay for an order. |
| POST | `/api/orders/:id/cancel` | ✔ | Cancel an order. |
| POST | `/api/test/reset` | – | *Test support:* reset all data. |
| POST | `/api/test/orders/:id/ship` | – | *Test support:* ship a paid order. |

Authenticated requests use the header `Authorization: Bearer <token>`.
Errors are returned as `{ "error": { "code": "...", "message": "..." } }`.

All prices are in **cents** in the API (`2500` = `$25.00`).

> **Rule for this lab:** treat `app/` as code written by another team.
> Do **not** modify it to make tests pass. If you believe the application is
> wrong, write a defect report.
