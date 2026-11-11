// Shared front-end helpers for Mini Shop.
// Every page talks to the REST API through api().

const TOKEN_KEY = 'minishop.token';
const USER_KEY = 'minishop.user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function api(method, url, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401 && url !== '/api/auth/login') clearSession();
    const error = new Error(data.error ? data.error.message : 'Request failed.');
    error.status = res.status;
    throw error;
  }
  return data;
}

function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

// Error messages use role="alert"; success messages use role="status".
function showError(text) {
  document.getElementById('status').textContent = '';
  document.getElementById('error').textContent = text;
}

function showSuccess(text) {
  document.getElementById('error').textContent = '';
  document.getElementById('status').textContent = text;
}

function requireLogin() {
  if (!getToken()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

function renderNav() {
  const nav = document.getElementById('nav');
  const user = getUser();
  nav.innerHTML = `
    <a href="/index.html">Products</a>
    <a href="/cart.html">Cart</a>
    <a href="/orders.html">Orders</a>
    <span class="spacer"></span>
    ${user
      ? `<span id="current-user">Signed in as ${user.name} (${user.tier})</span>
         <button type="button" id="logout-button">Log out</button>`
      : '<a href="/login.html">Log in</a>'}
  `;
  const logout = document.getElementById('logout-button');
  if (logout) {
    logout.addEventListener('click', async () => {
      try {
        await api('POST', '/api/auth/logout');
      } finally {
        clearSession();
        window.location.href = '/login.html';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', renderNav);
