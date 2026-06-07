import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to format API errors
export function formatApiError(error) {
  const detail = error.response?.data?.detail;
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

// Users
export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.patch(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Brands
export const getBrands = () => api.get('/brands');
export const createBrand = (data) => api.post('/brands', data);
export const deleteBrand = (id) => api.delete(`/brands/${id}`);

// Categories
export const getCategories = (brandId) => api.get('/categories', { params: { brand_id: brandId } });
export const createCategory = (data) => api.post('/categories', data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.patch(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const addStock = (id, data) => api.post(`/products/${id}/add-stock`, data);
export const reduceStock = (id, data) => api.post(`/products/${id}/reduce-stock`, data);
export const getStockHistory = (id) => api.get(`/products/${id}/stock-history`);
export const pruneProduct = (id) => api.post(`/products/${id}/prune`);

// Customers
export const getCustomers = (search) => api.get('/customers', { params: { search } });
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.patch(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);
export const addAddress = (customerId, data) => api.post(`/customers/${customerId}/addresses`, data);
export const removeAddress = (customerId, addressId) => api.delete(`/customers/${customerId}/addresses/${addressId}`);

// Cart
export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart/add', data);
export const updateCartItem = (data) => api.post('/cart/update', data);
export const removeFromCart = (data) => api.post('/cart/remove', data);
export const clearCart = () => api.post('/cart/clear');

// Quotations
export const getQuotations = (status) => api.get('/quotations', { params: { status } });
export const getQuotation = (id) => api.get(`/quotations/${id}`);
export const createQuotation = (data) => api.post('/quotations', data);
export const updateQuotationStatus = (id, status) => api.patch(`/quotations/${id}/status?status=${status}`);
export const convertToOrder = (id) => api.post(`/quotations/${id}/convert-to-order`);

// Orders
export const getOrders = (status) => api.get('/orders', { params: { status } });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const assignOrder = (id, userIds) => api.patch(`/orders/${id}/assign`, userIds);
export const addComment = (orderId, content) => api.post(`/orders/${orderId}/comments`, { content });
export const getComments = (orderId) => api.get(`/orders/${orderId}/comments`);

// Invoices
export const getInvoices = () => api.get('/invoices');
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const downloadInvoicePdf = (id) => `${API_URL}/api/invoices/${id}/pdf`;

// Gatepasses
export const getGatepasses = () => api.get('/gatepasses');
export const getGatepass = (id) => api.get(`/gatepasses/${id}`);
export const downloadGatepassPdf = (id) => `${API_URL}/api/gatepasses/${id}/pdf`;

// Seed Data
export const seedData = () => api.post('/seed-data');

// Permissions
export const getPermissions = () => api.get('/permissions');
export const getPermissionsByModule = () => api.get('/permissions/modules');
export const createPermission = (data) => api.post('/permissions', data);
export const deletePermission = (id) => api.delete(`/permissions/${id}`);

// Roles
export const getRoles = () => api.get('/roles');
export const getRole = (id) => api.get(`/roles/${id}`);
export const createRole = (data) => api.post('/roles', data);
export const updateRole = (id, data) => api.patch(`/roles/${id}`, data);
export const updateRolePermissions = (id, permissions) => api.patch(`/roles/${id}/permissions`, permissions);
export const deleteRole = (id) => api.delete(`/roles/${id}`);

export default api;
