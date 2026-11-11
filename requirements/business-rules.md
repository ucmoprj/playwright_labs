# Mini Shop — Business Rules

## BR-QTY: Cart Quantity

A cart item's quantity must satisfy **all** of the following:

| Rule | Description |
|---|---|
| BR-QTY-1 | The quantity must be a whole number. |
| BR-QTY-2 | The quantity must be at least **1**. (Use *Remove* to delete an item.) |
| BR-QTY-3 | The quantity must be at most **10** per product. |
| BR-QTY-4 | The quantity must not be greater than the product's current stock. |

When several limits apply, the smaller one wins. For example, a product with
stock 3 allows quantities 1–3; a product with stock 50 allows quantities 1–10.

## BR-DISC: Discounts

The discount depends on the customer's tier and the cart subtotal
(before discount).

| Tier | Subtotal < $100.00 | Subtotal ≥ $100.00 |
|---|---|---|
| REGULAR | 0% | 5% |
| VIP | 10% | 15% |

- The discount amount is rounded to the nearest cent.
- Total = Subtotal − Discount.

## BR-STATE: Order Status

An order is always in exactly one of these states:
`CREATED`, `PAID`, `SHIPPED`, `CANCELLED`.

```
            pay              ship
 CREATED ────────▶ PAID ────────▶ SHIPPED
    │                │
    │ cancel         │ cancel
    ▼                ▼
 CANCELLED ◀─────────┘
```

| Current status | pay | ship | cancel |
|---|---|---|---|
| CREATED | → PAID | not allowed | → CANCELLED |
| PAID | not allowed | → SHIPPED | → CANCELLED |
| SHIPPED | not allowed | not allowed | **not allowed** |
| CANCELLED | not allowed | not allowed | not allowed |

- A "not allowed" action is rejected with an error, and the order status does
  not change.
- Shipping is performed by the warehouse (see the Test Support API in
  requirements.md), not by the customer.

## Product Catalog (initial data)

| ID | Product | Price | Stock |
|---|---|---|---|
| 1 | Mechanical Keyboard | $50.00 | 20 |
| 2 | Wireless Mouse | $25.00 | 15 |
| 3 | USB-C Cable | $10.00 | 50 |
| 4 | Noise Cancelling Headphones | $80.00 | 3 |
| 5 | 27-inch Monitor | $200.00 | 0 |
| 6 | Paper Notebook | $5.00 | 100 |
