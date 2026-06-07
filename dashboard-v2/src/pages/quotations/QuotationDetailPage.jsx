import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText } from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { getQuotation, updateQuotationStatus, convertToOrder } from '../../lib/api';
import { toast } from 'sonner';

const StatusBadge = ({ status }) => {
  const statusClasses = {
    draft: 'border-zinc-500/50 text-zinc-400',
    sent: 'border-blue-500/50 text-blue-500',
    accepted: 'border-green-500/50 text-green-500',
    rejected: 'border-red-500/50 text-red-500',
    converted: 'border-purple-500/50 text-purple-500',
  };

  return (
    <span className={`badge ${statusClasses[status] || 'border-zinc-700 text-zinc-400'} bg-zinc-950`}>
      {status}
    </span>
  );
};

export const QuotationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const { data } = await getQuotation(id);
      setQuotation(data);
    } catch (error) {
      toast.error('Failed to load quotation');
      navigate('/quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateQuotationStatus(id, newStatus);
      toast.success('Status updated');
      fetchQuotation();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleConvertToOrder = async () => {
    try {
      const { data } = await convertToOrder(id);
      toast.success(`Order ${data.order_number} created!`);
      navigate(`/orders/${data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to convert to order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quotation) return null;

  return (
    <div className="min-h-screen" data-testid="quotation-detail-page">
      <Header title={quotation.quotation_number} subtitle="Quotation Details" />
      
      <div className="p-6">
        <Button
          variant="ghost"
          className="mb-6 text-zinc-400 hover:text-white"
          onClick={() => navigate('/quotations')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quotations
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                    {quotation.items?.map((item, index) => (
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

            {/* Notes */}
            {quotation.notes && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
                <h3 className="text-lg font-semibold text-white mb-2">Notes</h3>
                <p className="text-zinc-400">{quotation.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status & Actions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Status</h3>
                <StatusBadge status={quotation.status} />
              </div>
              
              <div className="space-y-2">
                {quotation.status === 'draft' && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleStatusChange('sent')}
                    data-testid="send-quotation-btn"
                  >
                    Mark as Sent
                  </Button>
                )}
                {quotation.status === 'sent' && (
                  <>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange('accepted')}
                      data-testid="accept-quotation-btn"
                    >
                      Accept Quotation
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                      onClick={() => handleStatusChange('rejected')}
                      data-testid="reject-quotation-btn"
                    >
                      Reject Quotation
                    </Button>
                  </>
                )}
                {(quotation.status === 'accepted' || quotation.status === 'sent') && quotation.status !== 'converted' && (
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleConvertToOrder}
                    data-testid="convert-to-order-btn"
                  >
                    Convert to Order
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                {quotation.status === 'converted' && quotation.converted_to_order && (
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300"
                    onClick={() => navigate(`/orders/${quotation.converted_to_order}`)}
                  >
                    View Order
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {/* Customer */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Customer</h3>
              <div className="space-y-2 text-sm">
                <p className="text-white font-medium">{quotation.customer_name}</p>
                <p className="text-zinc-400">{quotation.customer_phone}</p>
                {quotation.customer_company && (
                  <p className="text-zinc-500">{quotation.customer_company}</p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">₹{quotation.subtotal?.toFixed(2)}</span>
                </div>
                {quotation.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Discount ({quotation.discount_percent}%)</span>
                    <span className="text-green-500">-₹{quotation.discount_amount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-zinc-800 text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">₹{quotation.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Created By</span>
                  <span className="text-zinc-300">{quotation.created_by_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Created At</span>
                  <span className="text-zinc-300">
                    {new Date(quotation.created_at).toLocaleString()}
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

export default QuotationDetailPage;
