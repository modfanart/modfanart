import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart,
  Eye
} from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getOrders } from '../../lib/api';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready', label: 'Ready' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'completed', label: 'Completed' },
];

const StatusBadge = ({ status }) => {
  const statusClasses = {
    pending: 'status-pending',
    in_progress: 'status-in_progress',
    ready: 'status-ready',
    invoiced: 'status-invoiced',
    dispatched: 'status-dispatched',
    completed: 'status-completed',
  };

  return (
    <span className={`badge ${statusClasses[status] || 'border-zinc-700 text-zinc-400'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await getOrders(statusFilter !== 'all' ? statusFilter : undefined);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  return (
    <div className="min-h-screen" data-testid="orders-page">
      <Header title="Orders" subtitle={`${orders.length} orders`} />
      
      <div className="p-4 sm:p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-800 text-white" data-testid="order-status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-zinc-300">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ShoppingCart weight="duotone" className="w-12 h-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400">No orders found</p>
              <p className="text-xs text-zinc-500 mt-2">Orders are created from quotations</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} data-testid={`order-row-${order.id}`}>
                      <td className="font-mono text-white">{order.order_number}</td>
                      <td>
                        <div>
                          <p className="text-white">{order.customer_name}</p>
                          <p className="text-xs text-zinc-500">{order.customer_phone}</p>
                        </div>
                      </td>
                      <td>{order.items?.length || 0} items</td>
                      <td className="text-white font-medium">₹{order.total?.toLocaleString()}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td className="text-zinc-500 text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-white"
                          onClick={() => navigate(`/orders/${order.id}`)}
                          title="View Details"
                          data-testid={`view-order-${order.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
