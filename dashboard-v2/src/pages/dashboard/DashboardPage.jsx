import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Users, 
  FileText, 
  ShoppingCart, 
  TrendUp, 
  Warning,
  ArrowRight,
  Plus
} from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { getDashboardStats, seedData } from '../../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon: Icon, trend, color = 'white' }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5 card-hover" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
        {trend && (
          <p className={`text-xs mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            <TrendUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-md bg-${color}/10 flex items-center justify-center`}>
        <Icon weight="duotone" className={`w-5 h-5 text-${color}`} />
      </div>
    </div>
  </div>
);

const OrderStatusBadge = ({ status }) => {
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

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const { data } = await seedData();
      toast.success(data.message);
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="dashboard-page">
      <Header title="Dashboard" subtitle="Welcome back! Here's your overview." />
      
      <div className="p-4 sm:p-6 space-y-6">
        {/* Quick Actions */}
        {hasRole(['super_admin', 'admin']) && stats?.total_products === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-md p-4 flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Get Started</h3>
              <p className="text-sm text-zinc-400">Seed mock data to explore the ERP features</p>
            </div>
            <Button 
              onClick={handleSeedData} 
              disabled={seeding}
              className="bg-white text-black hover:bg-zinc-200"
              data-testid="seed-data-btn"
            >
              {seeding ? 'Seeding...' : 'Seed Mock Data'}
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="dashboard-grid">
          <StatCard
            title="Total Products"
            value={stats?.total_products || 0}
            icon={Package}
            color="white"
          />
          <StatCard
            title="Total Customers"
            value={stats?.total_customers || 0}
            icon={Users}
            color="white"
          />
          <StatCard
            title="Total Orders"
            value={stats?.total_orders || 0}
            icon={ShoppingCart}
            color="white"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(stats?.total_revenue || 0).toLocaleString()}`}
            icon={TrendUp}
            color="white"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Pending Orders"
            value={stats?.pending_orders || 0}
            icon={FileText}
            color="yellow-500"
          />
          <StatCard
            title="In Progress"
            value={stats?.in_progress_orders || 0}
            icon={ShoppingCart}
            color="blue-500"
          />
          <StatCard
            title="Low Stock Items"
            value={stats?.low_stock_products || 0}
            icon={Warning}
            color="red-500"
          />
        </div>

        {/* Quick Actions + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
                onClick={() => navigate('/quotations/new')}
                data-testid="quick-new-quotation"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Quotation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
                onClick={() => navigate('/customers/new')}
                data-testid="quick-new-customer"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Customer
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
                onClick={() => navigate('/inventory')}
                data-testid="quick-view-inventory"
              >
                <Package className="w-4 h-4 mr-2" />
                View Inventory
              </Button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white"
                onClick={() => navigate('/orders')}
                data-testid="view-all-orders"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {stats?.recent_orders?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-md cursor-pointer hover:bg-zinc-800/50 transition-colors"
                    onClick={() => navigate(`/orders/${order.id}`)}
                    data-testid={`recent-order-${order.id}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{order.order_number}</p>
                      <p className="text-xs text-zinc-500">{order.customer_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-zinc-300">₹{order.total?.toLocaleString()}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-500">No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
