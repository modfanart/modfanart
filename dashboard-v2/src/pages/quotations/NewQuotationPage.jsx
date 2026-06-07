import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash } from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useCart } from '../../contexts/CartContext';
import { getCustomers, createQuotation } from '../../lib/api';
import { toast } from 'sonner';

export const NewQuotationPage = () => {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    notes: '',
    discount_percent: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await getCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
    } else {
      await updateCartItem(productId, quantity);
    }
  };

  const handleSubmit = async () => {
    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return;
    }
    if (cart.items.length === 0) {
      toast.error('Cart is empty. Add products to create a quotation.');
      return;
    }

    setLoading(true);
    try {
      const quotationData = {
        customer_id: formData.customer_id,
        items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        notes: formData.notes || null,
        discount_percent: parseFloat(formData.discount_percent) || 0
      };

      const { data } = await createQuotation(quotationData);
      toast.success(`Quotation ${data.quotation_number} created!`);
      navigate(`/quotations/${data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.total;
  const discountAmount = subtotal * (parseFloat(formData.discount_percent) || 0) / 100;
  const total = subtotal - discountAmount;

  const selectedCustomer = customers.find(c => c.id === formData.customer_id);

  return (
    <div className="min-h-screen" data-testid="new-quotation-page">
      <Header title="New Quotation" subtitle="Create a quotation from cart items" />
      
      <div className="p-4 sm:p-6">
        <Button
          variant="ghost"
          className="mb-6 text-zinc-400 hover:text-white"
          onClick={() => navigate('/quotations')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quotations
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Cart Items</h3>
              
              {cart.items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-zinc-400 mb-4">Your cart is empty</p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/inventory')}
                    className="border-zinc-700 text-zinc-300"
                    data-testid="browse-products"
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div 
                      key={item.product_id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-md"
                      data-testid={`quotation-item-${item.product_id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{item.product?.name}</p>
                        <p className="text-xs text-zinc-500">SKU: {item.product?.sku}</p>
                        <p className="text-sm text-zinc-400 mt-1">₹{item.product?.price?.toFixed(2)} / {item.product?.unit}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value) || 0)}
                          className="w-20 bg-zinc-900 border-zinc-800 text-white text-center"
                        />
                        <span className="text-white font-medium w-24 text-right">
                          ₹{item.item_total?.toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-400"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Customer Selection */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Customer</h3>
              <Select 
                value={formData.customer_id} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, customer_id: v }))}
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white" data-testid="select-customer">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id} className="text-zinc-300">
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedCustomer && (
                <div className="mt-3 p-3 bg-zinc-950 rounded-md text-sm">
                  <p className="text-white font-medium">{selectedCustomer.name}</p>
                  <p className="text-zinc-400">{selectedCustomer.phone}</p>
                  {selectedCustomer.company && (
                    <p className="text-zinc-500">{selectedCustomer.company}</p>
                  )}
                </div>
              )}

              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-zinc-700 text-zinc-300"
                  onClick={() => navigate('/customers')}
                >
                  Manage Customers
                </Button>
              </div>
            </div>

            {/* Discount & Notes */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5 space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Discount (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_percent: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-white"
                  data-testid="discount-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-white min-h-[80px]"
                  placeholder="Add any notes for this quotation..."
                  data-testid="notes-input"
                />
              </div>
            </div>

            {/* Totals */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Discount ({formData.discount_percent}%)</span>
                    <span className="text-green-500">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-zinc-800">
                  <span className="text-white">Total</span>
                  <span className="text-white" data-testid="quotation-total">₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button
                className="w-full mt-4 bg-white text-black hover:bg-zinc-200"
                onClick={handleSubmit}
                disabled={loading || cart.items.length === 0 || !formData.customer_id}
                data-testid="create-quotation-submit"
              >
                {loading ? 'Creating...' : 'Create Quotation'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewQuotationPage;
