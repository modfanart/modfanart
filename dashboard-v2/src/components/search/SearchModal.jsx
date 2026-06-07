import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlass, 
  X, 
  Package, 
  Users, 
  FileText, 
  ShoppingCart,
  ArrowRight
} from '@phosphor-icons/react';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { getProducts, getCustomers, getQuotations, getOrders } from '../../lib/api';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner';

export const SearchModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    products: [],
    customers: [],
    quotations: [],
    orders: []
  });

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const performSearch = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setResults({ products: [], customers: [], quotations: [], orders: [] });
      return;
    }

    setLoading(true);
    try {
      const [productsRes, customersRes, quotationsRes, ordersRes] = await Promise.all([
        getProducts({ search: term, limit: 10 }),
        getCustomers(term),
        getQuotations(),
        getOrders()
      ]);

      // Filter quotations and orders by search term
      const filteredQuotations = quotationsRes.data.filter(q => 
        q.quotation_number?.toLowerCase().includes(term.toLowerCase()) ||
        q.customer_name?.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 10);

      const filteredOrders = ordersRes.data.filter(o => 
        o.order_number?.toLowerCase().includes(term.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 10);

      setResults({
        products: productsRes.data.products.slice(0, 10),
        customers: customersRes.data.slice(0, 10),
        quotations: filteredQuotations,
        orders: filteredOrders
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(debounce(performSearch, 300), [performSearch]);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setResults({ products: [], customers: [], quotations: [], orders: [] });
      setActiveTab('products');
    }
  }, [open]);

  const handleAddToCart = async (product) => {
    const result = await addToCart(product.id, 1);
    if (result.success) {
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const tabs = [
    { id: 'products', label: 'Products', icon: Package, count: results.products.length },
    { id: 'customers', label: 'Customers', icon: Users, count: results.customers.length },
    { id: 'quotations', label: 'Quotations', icon: FileText, count: results.quotations.length },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, count: results.orders.length },
  ];

  const totalResults = results.products.length + results.customers.length + results.quotations.length + results.orders.length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl w-[calc(100vw-2rem)] p-0 overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              autoFocus
              placeholder="Search products, customers, orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 h-12 bg-zinc-950 border-zinc-800 text-white text-lg placeholder-zinc-500"
              data-testid="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'text-white border-b-2 border-white -mb-px' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                data-testid={`search-tab-${tab.id}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-zinc-800 rounded">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : searchTerm.length < 2 ? (
            <div className="flex flex-col items-center justify-center h-32 text-zinc-500">
              <MagnifyingGlass className="w-8 h-8 mb-2" />
              <p>Type at least 2 characters to search</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-zinc-500">
              <p>No results found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="p-2">
              {/* Products */}
              {activeTab === 'products' && (
                <div className="space-y-1">
                  {results.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-zinc-800 transition-colors"
                      data-testid={`search-result-product-${product.id}`}
                    >
                      <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center">
                        <Package className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{product.name}</p>
                        <p className="text-xs text-zinc-500">SKU: {product.sku} • ₹{product.price?.toFixed(2)}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-white text-black hover:bg-zinc-200"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Customers */}
              {activeTab === 'customers' && (
                <div className="space-y-1">
                  {results.customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-zinc-800 cursor-pointer transition-colors"
                      onClick={() => handleNavigate('/customers')}
                      data-testid={`search-result-customer-${customer.id}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white font-medium">
                        {customer.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{customer.name}</p>
                        <p className="text-xs text-zinc-500">{customer.phone} {customer.company && `• ${customer.company}`}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-500" />
                    </div>
                  ))}
                </div>
              )}

              {/* Quotations */}
              {activeTab === 'quotations' && (
                <div className="space-y-1">
                  {results.quotations.map((quotation) => (
                    <div
                      key={quotation.id}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-zinc-800 cursor-pointer transition-colors"
                      onClick={() => handleNavigate(`/quotations/${quotation.id}`)}
                      data-testid={`search-result-quotation-${quotation.id}`}
                    >
                      <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{quotation.quotation_number}</p>
                        <p className="text-xs text-zinc-500">{quotation.customer_name} • ₹{quotation.total?.toLocaleString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded capitalize ${
                        quotation.status === 'converted' ? 'bg-purple-500/20 text-purple-400' :
                        quotation.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                        'bg-zinc-700 text-zinc-400'
                      }`}>
                        {quotation.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-1">
                  {results.orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-zinc-800 cursor-pointer transition-colors"
                      onClick={() => handleNavigate(`/orders/${order.id}`)}
                      data-testid={`search-result-order-${order.id}`}
                    >
                      <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{order.order_number}</p>
                        <p className="text-xs text-zinc-500">{order.customer_name} • ₹{order.total?.toLocaleString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded capitalize ${
                        order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'dispatched' ? 'bg-orange-500/20 text-orange-400' :
                        order.status === 'invoiced' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-zinc-700 text-zinc-400'
                      }`}>
                        {order.status?.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">
            Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">ESC</kbd> to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
