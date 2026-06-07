import React, { useState, useEffect } from 'react';
import { Receipt, Download, Eye } from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { getInvoices, getInvoice, downloadInvoicePdf } from '../../lib/api';
import { toast } from 'sonner';

export const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      const { data } = await getInvoice(invoiceId);
      setSelectedInvoice(data);
    } catch (error) {
      toast.error('Failed to load invoice details');
    }
  };

  const handleDownload = (invoiceId) => {
    window.open(downloadInvoicePdf(invoiceId), '_blank');
  };

  return (
    <div className="min-h-screen" data-testid="invoices-page">
      <Header title="Invoices" subtitle={`${invoices.length} invoices`} />
      
      <div className="p-4 sm:p-6 space-y-6">
        {/* Invoices Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Receipt weight="duotone" className="w-12 h-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400">No invoices found</p>
              <p className="text-xs text-zinc-500 mt-2">Invoices are generated when orders are marked as invoiced</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} data-testid={`invoice-row-${invoice.id}`}>
                      <td className="font-mono text-white">{invoice.invoice_number}</td>
                      <td className="font-mono text-zinc-400">{invoice.order_number}</td>
                      <td>
                        <div>
                          <p className="text-white">{invoice.customer_name}</p>
                          <p className="text-xs text-zinc-500">{invoice.customer_phone}</p>
                        </div>
                      </td>
                      <td>{invoice.items?.length || 0} items</td>
                      <td className="text-white font-medium">₹{invoice.total?.toLocaleString()}</td>
                      <td className="text-zinc-500 text-sm">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                            onClick={() => handleViewInvoice(invoice.id)}
                            title="View Details"
                            data-testid={`view-invoice-${invoice.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                            onClick={() => handleDownload(invoice.id)}
                            title="Download PDF"
                            data-testid={`download-invoice-${invoice.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
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

      {/* Invoice Detail Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Invoice {selectedInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500">Order</p>
                  <p className="text-white">{selectedInvoice.order_number}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Date</p>
                  <p className="text-white">{new Date(selectedInvoice.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Customer</p>
                  <p className="text-white">{selectedInvoice.customer_name}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Phone</p>
                  <p className="text-white">{selectedInvoice.customer_phone}</p>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="text-sm font-medium text-white mb-2">Items</h4>
                <table className="data-table text-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="text-white">{item.product_name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.unit_price?.toFixed(2)}</td>
                        <td className="text-white">₹{item.total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">₹{selectedInvoice.subtotal?.toFixed(2)}</span>
                </div>
                {selectedInvoice.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Discount</span>
                    <span className="text-green-500">-₹{selectedInvoice.discount_amount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-zinc-800">
                  <span className="text-white">Total</span>
                  <span className="text-white">₹{selectedInvoice.total?.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full bg-white text-black hover:bg-zinc-200"
                onClick={() => handleDownload(selectedInvoice.id)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicesPage;
