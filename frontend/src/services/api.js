import axios from 'axios';

const ADMIN_TOKEN_KEY = 'online_book_store_admin_token';

// Fallback high quality SVG placeholder for books without image or failed load
export const DEFAULT_BOOK_COVER = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234f46e5;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23818cf8;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='400' fill='url(%23grad)'/%3E%3Crect x='20' y='20' width='260' height='360' fill='none' stroke='white' stroke-width='2' stroke-dasharray='6 6' rx='8' opacity='0.35'/%3E%3Cpath d='M90 120h120v130H90z' fill='white' opacity='0.2' rx='4'/%3E%3Cpath d='M105 150h90M105 180h90M105 210h60' stroke='white' stroke-width='4' stroke-linecap='round' opacity='0.75'/%3E%3Ctext x='150' y='295' font-family='sans-serif' font-size='16' font-weight='700' fill='white' text-anchor='middle'%3EBook Cover%3C/text%3E%3C/svg%3E";

// Token storage helpers
export const getAdminToken = () => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const removeAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const isAdminAuthenticated = () => {
  return Boolean(getAdminToken());
};

// Create Axios instance for books API
const api = axios.create({
  baseURL: '/api/books',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Interceptor to attach admin token to outgoing requests
api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Admin Login API
 * @param {string} password
 */
export const adminLogin = async (password) => {
  const response = await axios.post('/api/admin/login', { password });
  if (response.data.token) {
    setAdminToken(response.data.token);
  }
  return response.data;
};

/**
 * Admin Logout helper
 */
export const adminLogout = () => {
  removeAdminToken();
};

/**
 * Fetch books with optional search and category filters
 * @param {Object} params - { search, category }
 */
export const getBooks = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.search && params.search.trim()) {
    queryParams.append('search', params.search.trim());
  }

  if (params.category && params.category !== 'All' && params.category !== 'All Categories') {
    queryParams.append('category', params.category.trim());
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/?${queryString}` : '/';
  const response = await api.get(url);
  return response.data;
};

/**
 * Fetch single book details by ID (bookId or MongoDB _id)
 * @param {string} id
 */
export const getBookById = async (id) => {
  const response = await api.get(`/${encodeURIComponent(id)}`);
  return response.data;
};

/**
 * Create a new book (Admin - Protected)
 * @param {Object} bookData
 */
export const createBook = async (bookData) => {
  const response = await api.post('/', bookData);
  return response.data;
};

/**
 * Update an existing book (Admin - Protected)
 * @param {string} id
 * @param {Object} bookData
 */
export const updateBook = async (id, bookData) => {
  const response = await api.put(`/${encodeURIComponent(id)}`, bookData);
  return response.data;
};

/**
 * Delete a book by ID (Admin - Protected)
 * @param {string} id
 */
export const deleteBook = async (id) => {
  const response = await api.delete(`/${encodeURIComponent(id)}`);
  return response.data;
};

// Create Axios instance for orders API
const ordersApi = axios.create({
  baseURL: '/api/orders',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

ordersApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Place a new order (Public checkout)
 * @param {Object} orderData
 */
export const createOrder = async (orderData) => {
  const response = await ordersApi.post('/', orderData);
  return response.data;
};

/**
 * Fetch all orders (Admin - Protected)
 * @param {Object} params - { status, search, paymentMethod, sort }
 */
export const getAdminOrders = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.status && params.status !== 'All' && params.status !== 'all') {
    queryParams.append('status', params.status);
  }

  if (params.search && params.search.trim()) {
    queryParams.append('search', params.search.trim());
  }

  if (params.paymentMethod && params.paymentMethod !== 'all') {
    queryParams.append('paymentMethod', params.paymentMethod);
  }

  if (params.sort) {
    queryParams.append('sort', params.sort);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/?${queryString}` : '/';
  const response = await ordersApi.get(url);
  return response.data;
};

/**
 * Fetch order statistics (Admin - Protected)
 */
export const getAdminOrderStats = async () => {
  const response = await ordersApi.get('/stats');
  return response.data;
};

/**
 * Fetch single order by Order ID (Admin - Protected)
 * @param {string} orderId
 */
export const getAdminOrderById = async (orderId) => {
  const response = await ordersApi.get(`/${encodeURIComponent(orderId)}`);
  return response.data;
};

/**
 * Update order status (Admin - Protected)
 * @param {string} orderId
 * @param {string} status
 * @param {string} [note]
 */
export const updateAdminOrderStatus = async (orderId, status, note = '') => {
  const response = await ordersApi.patch(`/${encodeURIComponent(orderId)}/status`, {
    status,
    note
  });
  return response.data;
};

/**
 * Delete an order (Admin - Protected)
 * @param {string} orderId
 */
export const deleteAdminOrder = async (orderId) => {
  const response = await ordersApi.delete(`/${encodeURIComponent(orderId)}`);
  return response.data;
};

export default api;

