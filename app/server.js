// Mini Shop - a small RESTful web application used as the system under test.
// Run: npm start  ->  http://localhost:3100

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const { createSeedData } = require('./data');
const { validateQuantity, calculateTotals, canTransition, TRANSITIONS } = require('./rules');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/favicon.ico', (req, res) => res.status(204).end());

let db = createSeedData();

// ---------- helpers ----------

function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function publicUser(user) {
  return { id: user.id, username: user.username, name: user.name, tier: user.tier };
}

function findProduct(id) {
  return db.products.find((p) => p.id === Number(id));
}

function requireAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const userId = token && db.sessions[token];
  if (!userId) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Please log in first.');
  }
  req.user = db.users.find((u) => u.id === userId);
  req.token = token;
  next();
}

function getCart(userId) {
  if (!db.carts[userId]) db.carts[userId] = [];
  return db.carts[userId];
}

function cartView(user) {
  const items = getCart(user.id).map((item) => {
    const product = findProduct(item.productId);
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    };
  });
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { items, ...calculateTotals(user.tier, subtotal) };
}

function findOwnOrder(req, res) {
  const order = db.orders.find((o) => o.id === Number(req.params.id) && o.userId === req.user.id);
  if (!order) sendError(res, 404, 'NOT_FOUND', 'Order not found.');
  return order;
}

function transition(order, action, res) {
  if (!canTransition(action, order.status)) {
    sendError(res, 409, 'INVALID_STATE', `Cannot ${action} an order that is ${order.status}.`);
    return false;
  }
  order.status = TRANSITIONS[action].to;
  return true;
}

// ---------- auth ----------

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Username and password are required.');
  }
  const user = db.users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid username or password.');
  }
  const token = crypto.randomUUID();
  db.sessions[token] = user.id;
  res.json({ token, user: publicUser(user) });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  delete db.sessions[req.token];
  res.status(204).end();
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// ---------- products ----------

app.get('/api/products', (req, res) => {
  const q = String(req.query.q || '').trim();
  const products = q ? db.products.filter((p) => p.name.includes(q)) : db.products;
  res.json({ products });
});

app.get('/api/products/:id', (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return sendError(res, 404, 'NOT_FOUND', 'Product not found.');
  res.json({ product });
});

// ---------- cart ----------

app.get('/api/cart', requireAuth, (req, res) => {
  res.json(cartView(req.user));
});

app.post('/api/cart/items', requireAuth, (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  const product = findProduct(productId);
  if (!product) return sendError(res, 404, 'NOT_FOUND', 'Product not found.');

  const cart = getCart(req.user.id);
  const existing = cart.find((i) => i.productId === product.id);
  const newQuantity = (existing ? existing.quantity : 0) + quantity;

  const error = validateQuantity(newQuantity, product);
  if (error) return sendError(res, 400, 'INVALID_QUANTITY', error);

  if (existing) existing.quantity = newQuantity;
  else cart.push({ productId: product.id, quantity: newQuantity });
  res.status(201).json(cartView(req.user));
});

app.patch('/api/cart/items/:productId', requireAuth, (req, res) => {
  const product = findProduct(req.params.productId);
  const item = product && getCart(req.user.id).find((i) => i.productId === product.id);
  if (!item) return sendError(res, 404, 'NOT_FOUND', 'Item is not in the cart.');

  const quantity = (req.body || {}).quantity;
  const error = validateQuantity(quantity, product);
  if (error) return sendError(res, 400, 'INVALID_QUANTITY', error);

  item.quantity = quantity;
  res.json(cartView(req.user));
});

app.delete('/api/cart/items/:productId', requireAuth, (req, res) => {
  const cart = getCart(req.user.id);
  const index = cart.findIndex((i) => i.productId === Number(req.params.productId));
  if (index === -1) return sendError(res, 404, 'NOT_FOUND', 'Item is not in the cart.');
  cart.splice(index, 1);
  res.json(cartView(req.user));
});

// ---------- orders ----------

app.get('/api/orders', requireAuth, (req, res) => {
  res.json({ orders: db.orders.filter((o) => o.userId === req.user.id) });
});

app.get('/api/orders/:id', requireAuth, (req, res) => {
  const order = findOwnOrder(req, res);
  if (order) res.json({ order });
});

app.post('/api/orders', requireAuth, (req, res) => {
  const view = cartView(req.user);
  if (view.items.length === 0) {
    return sendError(res, 400, 'EMPTY_CART', 'Your cart is empty.');
  }
  for (const item of view.items) {
    if (item.quantity > findProduct(item.productId).stock) {
      return sendError(res, 409, 'OUT_OF_STOCK', `${item.name} does not have enough stock.`);
    }
  }
  for (const item of view.items) {
    findProduct(item.productId).stock -= item.quantity;
  }
  const order = {
    id: db.nextOrderId++,
    userId: req.user.id,
    items: view.items,
    subtotal: view.subtotal,
    discountRate: view.discountRate,
    discount: view.discount,
    total: view.total,
    status: 'CREATED',
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  db.carts[req.user.id] = [];
  res.status(201).json({ order });
});

app.post('/api/orders/:id/pay', requireAuth, (req, res) => {
  const order = findOwnOrder(req, res);
  if (order && transition(order, 'pay', res)) res.json({ order });
});

app.post('/api/orders/:id/cancel', requireAuth, (req, res) => {
  const order = findOwnOrder(req, res);
  if (!order) return;
  if (transition(order, 'cancel', res)) {
    for (const item of order.items) findProduct(item.productId).stock += item.quantity;
    res.json({ order });
  }
});

// ---------- test support API (not part of the shop features) ----------

// Resets all data to the initial seed. Used to isolate automated tests.
app.post('/api/test/reset', (req, res) => {
  db = createSeedData();
  res.status(204).end();
});

// Simulates the warehouse shipping a paid order.
app.post('/api/test/orders/:id/ship', (req, res) => {
  const order = db.orders.find((o) => o.id === Number(req.params.id));
  if (!order) return sendError(res, 404, 'NOT_FOUND', 'Order not found.');
  if (transition(order, 'ship', res)) res.json({ order });
});

const PORT = process.env.PORT || 3100;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Mini Shop running at http://localhost:${PORT}`));
}

module.exports = app;
