import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Dashboard
export const fetchDashboard = () => api.get('/dashboard');

// Orders
export const fetchOrders = (params) => api.get('/orders', { params });
export const fetchOrderById = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data);

// Customers
export const fetchCustomers = () => api.get('/customers');
export const createCustomer = (data) => api.post('/customers', data);

// Products
export const fetchProducts = () => api.get('/products');
export const createProduct = (data) => api.post('/products', data);

export default api;
