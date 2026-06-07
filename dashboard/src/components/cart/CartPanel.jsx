import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash, Plus, Minus } from '@phosphor-icons/react';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';

export const CartPanel = () => {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart, clearCart, loading } = useCart();
  const [updating, setUpdating] = useState({});

  const handleQuantityChange = async (productId, newQuantity) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      if (newQuantity <= 0) {
        await removeFromCart(productId);
        toast.success('Item removed from cart');
      } else {
        await updateCartItem(productId, newQuantity);
      }
    } catch (error) {
      toast.error('Failed to update cart');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemove = async (productId) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const handleCreateQuotation = () => {
    navigate('/quotations/new');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center" data-testid="empty-cart">
        <p className="text-zinc-400 mb-4">Your cart is empty</p>
        <Button
          variant="outline"
          onClick={() => navigate('/inventory')}
          className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
          data-testid="browse-products-btn"
        >
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" data-testid="cart-panel">
      <ScrollArea className="flex-1 pr-4 mt-4">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.product_id}
              className="flex gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-md"
              data-testid={`cart-item-${item.product_id}`}
            >
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate">
                  {item.product?.name}
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  SKU: {item.product?.sku}
                </p>
                <p className="text-sm text-zinc-300 mt-2">
                  ₹{item.product?.price?.toFixed(2)} / {item.product?.unit}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-zinc-700"
                    onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                    disabled={updating[item.product_id]}
                    data-testid={`decrease-qty-${item.product_id}`}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-10 text-center text-white font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-zinc-700"
                    onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                    disabled={updating[item.product_id]}
                    data-testid={`increase-qty-${item.product_id}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    ₹{item.item_total?.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-red-500"
                    onClick={() => handleRemove(item.product_id)}
                    disabled={updating[item.product_id]}
                    data-testid={`remove-item-${item.product_id}`}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-zinc-800 pt-4 mt-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Subtotal</span>
          <span className="text-xl font-semibold text-white" data-testid="cart-total">
            ₹{cart.total?.toFixed(2)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
            onClick={handleClearCart}
            data-testid="clear-cart-btn"
          >
            Clear Cart
          </Button>
          <Button
            className="flex-1 bg-white text-black hover:bg-zinc-200"
            onClick={handleCreateQuotation}
            data-testid="create-quotation-btn"
          >
            Create Quotation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPanel;
