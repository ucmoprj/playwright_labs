// Seed data for Mini Shop.
// All prices are stored in cents to avoid floating-point rounding errors.

function createSeedData() {
  return {
    users: [
      { id: 1, username: 'alice', password: 'alice123', name: 'Alice', tier: 'REGULAR' },
      { id: 2, username: 'bob', password: 'bob123', name: 'Bob', tier: 'VIP' },
    ],
    products: [
      { id: 1, name: 'Mechanical Keyboard', price: 5000, stock: 20 },
      { id: 2, name: 'Wireless Mouse', price: 2500, stock: 15 },
      { id: 3, name: 'USB-C Cable', price: 1000, stock: 50 },
      { id: 4, name: 'Noise Cancelling Headphones', price: 8000, stock: 3 },
      { id: 5, name: '27-inch Monitor', price: 20000, stock: 0 },
      { id: 6, name: 'Paper Notebook', price: 500, stock: 100 },
    ],
    carts: {},      // userId -> [{ productId, quantity }]
    orders: [],     // { id, userId, items, subtotal, discount, total, status, createdAt }
    sessions: {},   // token -> userId
    nextOrderId: 1,
  };
}

module.exports = { createSeedData };
