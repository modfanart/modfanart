import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PaperPlaneTilt, Download } from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ScrollArea } from '../../components/ui/scroll-area';
import { getOrder, updateOrderStatus, addComment, getUsers, downloadInvoicePdf, downloadGatepassPdf } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const statusFlow = ['pending', 'in_progress', 'ready', 'invoiced', 'dispatched', 'completed'];

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

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const canUpdateStatus = hasRole(['super_admin', 'admin', 'sales', 'ops']);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await getOrder(id);
      setOrder(data);
    } catch (error) {
      toast.error('Failed to load order');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      toast.success('Status updated');
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    try {
      await addComment(id, newComment);
      setNewComment('');
      fetchOrder();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getNextStatus = () => {
    if (!order) return null;
    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const handleDownloadInvoice = () => {
    if (order.invoice_id) {
      window.open(downloadInvoicePdf(order.invoice_id), '_blank');
    }
  };

  const handleDownloadGatepass = () => {
    if (order.gatepass_id) {
      window.open(downloadGatepassPdf(order.gatepass_id), '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const nextStatus = getNextStatus();

  return (
    <div className="min-h-screen" data-testid="order-detail-page">
      <Header title={order.order_number} subtitle="Order Details" />
      
      <div className="p-4 sm:p-6">
        <Button
          variant="ghost"
          className="mb-6 text-zinc-400 hover:text-white"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Progress */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Order Progress</h3>
              <div className="flex items-center justify-between overflow-x-auto pb-2">
                {statusFlow.map((status, index) => {
                  const currentIndex = statusFlow.indexOf(order.status);
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  
                  return (
                    <div key={status} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            isCompleted 
                              ? 'bg-white text-black' 
                              : 'bg-zinc-800 text-zinc-500'
                          } ${isCurrent ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950' : ''}`}
                        >
                          {index + 1}
                        </div>
                        <span className={`text-xs mt-2 capitalize ${isCompleted ? 'text-white' : 'text-zinc-500'}`}>
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      {index < statusFlow.length - 1 && (
                        <div className={`w-12 h-0.5 mx-2 ${index < currentIndex ? 'bg-white' : 'bg-zinc-800'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {canUpdateStatus && nextStatus && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <Button
                    className="bg-white text-black hover:bg-zinc-200"
                    onClick={() => handleStatusChange(nextStatus)}
                    data-testid="update-status-btn"
                  >
                    Mark as {nextStatus.replace('_', ' ')}
                  </Button>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="text-white">{item.product_name}</td>
                        <td className="font-mono text-xs">{item.sku}</td>
                        <td>{item.quantity} {item.unit}</td>
                        <td>₹{item.unit_price?.toFixed(2)}</td>
                        <td className="text-white font-medium">₹{item.total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Comments</h3>
              
              <ScrollArea className="h-64 mb-4">
                {order.comments?.length > 0 ? (
                  <div className="space-y-3 pr-4">
                    {order.comments.map((comment) => (
                      <div 
                        key={comment.id} 
                        className={`p-3 rounded-md ${
                          comment.user_id === user?._id 
                            ? 'bg-zinc-800 ml-8' 
                            : 'bg-zinc-950 mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">{comment.user_name}</span>
                          <span className="text-xs text-zinc-500">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-zinc-500 py-8">No comments yet</p>
                )}
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="bg-zinc-950 border-zinc-800 text-white min-h-[60px]"
                  data-testid="comment-input"
                />
                <Button
                  className="bg-white text-black hover:bg-zinc-200"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submittingComment}
                  data-testid="submit-comment-btn"
                >
                  <PaperPlaneTilt className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Status</h3>
                <StatusBadge status={order.status} />
              </div>
              
              {/* Documents */}
              <div className="space-y-2">
                {order.invoice_id && (
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 justify-start"
                    onClick={handleDownloadInvoice}
                    data-testid="download-invoice-btn"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                )}
                {order.gatepass_id && (
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 justify-start"
                    onClick={handleDownloadGatepass}
                    data-testid="download-gatepass-btn"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Gatepass
                  </Button>
                )}
              </div>
            </div>

            {/* Customer */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Customer</h3>
              <div className="space-y-2 text-sm">
                <p className="text-white font-medium">{order.customer_name}</p>
                <p className="text-zinc-400">{order.customer_phone}</p>
                {order.customer_company && (
                  <p className="text-zinc-500">{order.customer_company}</p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">₹{order.subtotal?.toFixed(2)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Discount ({order.discount_percent}%)</span>
                    <span className="text-green-500">-₹{order.discount_amount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-zinc-800 text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">₹{order.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <div className="space-y-2 text-sm">
                {order.quotation_number && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">From Quotation</span>
                    <span className="text-zinc-300">{order.quotation_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-400">Created By</span>
                  <span className="text-zinc-300">{order.created_by_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Created At</span>
                  <span className="text-zinc-300">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
