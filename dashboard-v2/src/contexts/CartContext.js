import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, hasAccess } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !hasAccess) return;
    
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/cart`, { withCredentials: true });
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, hasAccess]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await axios.post(
        `${API_URL}/api/cart/add`,
        { product_id: productId, quantity },
        { withCredentials: true }
      );
      await fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      await axios.post(
        `${API_URL}/api/cart/update`,
        { product_id: productId, quantity },
        { withCredentials: true }
      );
      await fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.post(
        `${API_URL}/api/cart/remove`,
        { product_id: productId, quantity: 0 },
        { withCredentials: true }
      );
      await fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  };

  const clearCart = async () => {
    try {
      await axios.post(`${API_URL}/api/cart/clear`, {}, { withCredentials: true });
      setCart({ items: [], total: 0 });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || error.message };
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    itemCount: cart.items.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
