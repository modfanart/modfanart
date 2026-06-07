import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FileText,
  ArrowRight,
  Eye
} from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getQuotations, updateQuotationStatus, convertToOrder } from '../../lib/api';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted', label: 'Converted' },
];

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

export const QuotationsPage = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const { data } = await getQuotations(statusFilter !== 'all' ? statusFilter : undefined);
      setQuotations(data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter]);

  const handleStatusChange = async (quotationId, newStatus) => {
    try {
      await updateQuotationStatus(quotationId, newStatus);
      toast.success('Status updated');
      fetchQuotations();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleConvertToOrder = async (quotationId) => {
    try {
      const { data } = await convertToOrder(quotationId);
      toast.success(`Order ${data.order_number} created!`);
      navigate(`/orders/${data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to convert to order');
    }
  };

  return (
    <div className="min-h-screen" data-testid="quotations-page">
      <Header title="Quotations" subtitle={`${quotations.length} quotations`} />
      
      <div className="p-4 sm:p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-800 text-white" data-testid="quotation-status-filter">
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

          <Button 
            className="bg-white text-black hover:bg-zinc-200"
            onClick={() => navigate('/quotations/new')}
            data-testid="new-quotation-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Quotation
          </Button>
        </div>

        {/* Quotations Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : quotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText weight="duotone" className="w-12 h-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400">No quotations found</p>
              <Button 
                variant="outline"
                className="mt-4 border-zinc-700 text-zinc-300"
                onClick={() => navigate('/quotations/new')}
              >
                Create your first quotation
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quotation #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((quotation) => (
                    <tr key={quotation.id} data-testid={`quotation-row-${quotation.id}`}>
                      <td className="font-mono text-white">{quotation.quotation_number}</td>
                      <td>
                        <div>
                          <p className="text-white">{quotation.customer_name}</p>
                          <p className="text-xs text-zinc-500">{quotation.customer_phone}</p>
                        </div>
                      </td>
                      <td>{quotation.items?.length || 0} items</td>
                      <td className="text-white font-medium">₹{quotation.total?.toLocaleString()}</td>
                      <td><StatusBadge status={quotation.status} /></td>
                      <td className="text-zinc-500 text-sm">
                        {new Date(quotation.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                            onClick={() => navigate(`/quotations/${quotation.id}`)}
                            title="View Details"
                            data-testid={`view-quotation-${quotation.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {quotation.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-500 hover:text-blue-400"
                              onClick={() => handleStatusChange(quotation.id, 'sent')}
                              data-testid={`send-quotation-${quotation.id}`}
                            >
                              Send
                            </Button>
                          )}
                          {quotation.status === 'sent' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-500 hover:text-green-400"
                              onClick={() => handleStatusChange(quotation.id, 'accepted')}
                              data-testid={`accept-quotation-${quotation.id}`}
                            >
                              Accept
                            </Button>
                          )}
                          {(quotation.status === 'accepted' || quotation.status === 'sent') && quotation.status !== 'converted' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-500 hover:text-purple-400 flex items-center gap-1"
                              onClick={() => handleConvertToOrder(quotation.id)}
                              data-testid={`convert-quotation-${quotation.id}`}
                            >
                              Convert
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
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

export default QuotationsPage;
