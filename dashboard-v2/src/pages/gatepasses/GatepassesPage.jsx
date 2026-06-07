import React, { useState, useEffect } from 'react';
import { Truck, Download, Eye } from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { getGatepasses, getGatepass, downloadGatepassPdf } from '../../lib/api';
import { toast } from 'sonner';

export const GatepassesPage = () => {
  const [gatepasses, setGatepasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGatepass, setSelectedGatepass] = useState(null);

  useEffect(() => {
    fetchGatepasses();
  }, []);

  const fetchGatepasses = async () => {
    try {
      setLoading(true);
      const { data } = await getGatepasses();
      setGatepasses(data);
    } catch (error) {
      console.error('Error fetching gatepasses:', error);
      toast.error('Failed to load gatepasses');
    } finally {
      setLoading(false);
    }
  };

  const handleViewGatepass = async (gatepassId) => {
    try {
      const { data } = await getGatepass(gatepassId);
      setSelectedGatepass(data);
    } catch (error) {
      toast.error('Failed to load gatepass details');
    }
  };

  const handleDownload = (gatepassId) => {
    window.open(downloadGatepassPdf(gatepassId), '_blank');
  };

  return (
    <div className="min-h-screen" data-testid="gatepasses-page">
      <Header title="Gatepasses" subtitle={`${gatepasses.length} gatepasses`} />
      
      <div className="p-4 sm:p-6 space-y-6">
        {/* Gatepasses Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : gatepasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Truck weight="duotone" className="w-12 h-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400">No gatepasses found</p>
              <p className="text-xs text-zinc-500 mt-2">Gatepasses are generated when orders are marked as dispatched</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Gatepass #</th>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gatepasses.map((gatepass) => (
                    <tr key={gatepass.id} data-testid={`gatepass-row-${gatepass.id}`}>
                      <td className="font-mono text-white">{gatepass.gatepass_number}</td>
                      <td className="font-mono text-zinc-400">{gatepass.order_number}</td>
                      <td className="text-white">{gatepass.customer_name}</td>
                      <td>{gatepass.items?.length || 0} items</td>
                      <td className="text-zinc-500 text-sm">
                        {new Date(gatepass.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                            onClick={() => handleViewGatepass(gatepass.id)}
                            title="View Details"
                            data-testid={`view-gatepass-${gatepass.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                            onClick={() => handleDownload(gatepass.id)}
                            title="Download PDF"
                            data-testid={`download-gatepass-${gatepass.id}`}
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

      {/* Gatepass Detail Modal */}
      <Dialog open={!!selectedGatepass} onOpenChange={(open) => !open && setSelectedGatepass(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Gatepass {selectedGatepass?.gatepass_number}</DialogTitle>
          </DialogHeader>
          
          {selectedGatepass && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500">Order</p>
                  <p className="text-white">{selectedGatepass.order_number}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Date</p>
                  <p className="text-white">{new Date(selectedGatepass.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Customer</p>
                  <p className="text-white">{selectedGatepass.customer_name}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Created By</p>
                  <p className="text-white">{selectedGatepass.created_by_name}</p>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="text-sm font-medium text-white mb-2">Items for Dispatch</h4>
                <table className="data-table text-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Qty</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGatepass.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="text-white">{item.product_name}</td>
                        <td className="font-mono text-xs">{item.sku}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                className="w-full bg-white text-black hover:bg-zinc-200"
                onClick={() => handleDownload(selectedGatepass.id)}
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

export default GatepassesPage;
