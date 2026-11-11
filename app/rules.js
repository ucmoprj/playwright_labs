// Business rules for Mini Shop.
// See requirements/business-rules.md for the specification.

const MAX_QTY_PER_ITEM = 10;
const DISCOUNT_THRESHOLD = 10000; // $100.00 in cents

// Returns an error message if the quantity is not allowed, otherwise null.
function validateQuantity(quantity, product) {
  if (!Number.isInteger(quantity)) {
    return 'Quantity must be a whole number.';
  }
  if (quantity < 1) {
    return 'Quantity must be at least 1.';
  }
  if (quantity >= MAX_QTY_PER_ITEM) {
    return `You can buy at most ${MAX_QTY_PER_ITEM} of each item.`;
  }
  if (quantity > product.stock) {
    return `Only ${product.stock} left in stock.`;
  }
  return null;
}

// Returns the discount rate (0.0 - 1.0) for a user tier and subtotal in cents.
function discountRate(tier, subtotal) {
  if (subtotal >= DISCOUNT_THRESHOLD) {
    return tier === 'VIP' ? 0.15 : 0.05;
  }
  return 0;
}

function calculateTotals(tier, subtotal) {
  const rate = discountRate(tier, subtotal);
  const discount = Math.round(subtotal * rate);
  return { subtotal, discountRate: rate, discount, total: subtotal - discount };
}

// Order state machine: which actions are allowed from which status.
const TRANSITIONS = {
  pay: { from: ['CREATED'], to: 'PAID' },
  ship: { from: ['PAID'], to: 'SHIPPED' },
  cancel: { from: ['CREATED', 'PAID', 'SHIPPED'], to: 'CANCELLED' },
};

function canTransition(action, status) {
  return TRANSITIONS[action].from.includes(status);
}

module.exports = {
  MAX_QTY_PER_ITEM,
  DISCOUNT_THRESHOLD,
  validateQuantity,
  discountRate,
  calculateTotals,
  TRANSITIONS,
  canTransition,
};
