import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MagnifyingGlass, 
  Users,
  PencilSimple,
  Trash,
  MapPin,
  Phone,
  Envelope,
  Building
} from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, addAddress, removeAddress } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export const CustomersPage = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [customerModal, setCustomerModal] = useState({ open: false, customer: null, mode: 'create' });
  const [addressModal, setAddressModal] = useState({ open: false, customer: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, customer: null });

  const canDeleteCustomers = hasRole(['super_admin', 'admin']);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await getCustomers(search || undefined);
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleSaveCustomer = async (formData) => {
    try {
      if (customerModal.mode === 'create') {
        await createCustomer(formData);
        toast.success('Customer created');
      } else {
        await updateCustomer(customerModal.customer.id, formData);
        toast.success('Customer updated');
      }
      setCustomerModal({ open: false, customer: null, mode: 'create' });
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save customer');
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      await deleteCustomer(deleteConfirm.customer.id);
      toast.success('Customer deleted');
      setDeleteConfirm({ open: false, customer: null });
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete customer');
    }
  };

  const handleAddAddress = async (addressData) => {
    try {
      await addAddress(addressModal.customer.id, addressData);
      toast.success('Address added');
      setAddressModal({ open: false, customer: null });
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add address');
    }
  };

  const handleRemoveAddress = async (customerId, addressId) => {
    try {
      await removeAddress(customerId, addressId);
      toast.success('Address removed');
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to remove address');
    }
  };

  return (
    <div className="min-h-screen" data-testid="customers-page">
      <Header title="Customers" subtitle={`${customers.length} customers`} />
      
      <div className="p-4 sm:p-6 space-y-6">
        {/* Search & Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500"
              data-testid="customer-search"
            />
          </div>
          <Button 
            className="bg-white text-black hover:bg-zinc-200"
            onClick={() => setCustomerModal({ open: true, customer: null, mode: 'create' })}
            data-testid="add-customer-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Customers Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-zinc-900 border border-zinc-800 rounded-md">
            <Users weight="duotone" className="w-12 h-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400">No customers found</p>
            <Button 
              variant="outline"
              className="mt-4 border-zinc-700 text-zinc-300"
              onClick={() => setCustomerModal({ open: true, customer: null, mode: 'create' })}
            >
              Add your first customer
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <div 
                key={customer.id} 
                className="bg-zinc-900 border border-zinc-800 rounded-md p-5 card-hover"
                data-testid={`customer-card-${customer.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{customer.name}</h3>
                    {customer.company && (
                      <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                        <Building className="w-4 h-4" />
                        {customer.company}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 hover:text-white"
                      onClick={() => setCustomerModal({ open: true, customer, mode: 'edit' })}
                      data-testid={`edit-customer-${customer.id}`}
                    >
                      <PencilSimple className="w-4 h-4" />
                    </Button>
                    {canDeleteCustomers && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-400"
                        onClick={() => setDeleteConfirm({ open: true, customer })}
                        data-testid={`delete-customer-${customer.id}`}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-zinc-400">
                    <Phone className="w-4 h-4" />
                    {customer.phone}
                  </p>
                  {customer.email && (
                    <p className="flex items-center gap-2 text-zinc-400">
                      <Envelope className="w-4 h-4" />
                      {customer.email}
                    </p>
                  )}
                  {customer.gst_number && (
                    <p className="text-xs text-zinc-500 mt-2">GST: {customer.gst_number}</p>
                  )}
                </div>

                {/* Addresses */}
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Addresses</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-zinc-400 hover:text-white h-6 px-2"
                      onClick={() => setAddressModal({ open: true, customer })}
                      data-testid={`add-address-${customer.id}`}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  {customer.addresses?.length > 0 ? (
                    <div className="space-y-2">
                      {customer.addresses.slice(0, 2).map((addr) => (
                        <div key={addr.id} className="flex items-start gap-2 text-xs text-zinc-400 bg-zinc-950 p-2 rounded">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="flex-1">
                            {addr.street}, {addr.city}, {addr.state} - {addr.postal_code}
                            {addr.is_default && <span className="ml-2 text-green-500">(Default)</span>}
                          </span>
                          <button
                            onClick={() => handleRemoveAddress(customer.id, addr.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {customer.addresses.length > 2 && (
                        <p className="text-xs text-zinc-500">+{customer.addresses.length - 2} more</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">No addresses added</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Modal */}
      <CustomerFormModal
        open={customerModal.open}
        mode={customerModal.mode}
        customer={customerModal.customer}
        onClose={() => setCustomerModal({ open: false, customer: null, mode: 'create' })}
        onSave={handleSaveCustomer}
      />

      {/* Address Modal */}
      <AddressFormModal
        open={addressModal.open}
        customer={addressModal.customer}
        onClose={() => setAddressModal({ open: false, customer: null })}
        onSave={handleAddAddress}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, customer: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Customer</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400">
            Are you sure you want to delete <span className="text-white">{deleteConfirm.customer?.name}</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, customer: null })}
              className="border-zinc-700 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCustomer}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-customer-btn"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Customer Form Modal
const CustomerFormModal = ({ open, mode, customer, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    gst_number: ''
  });

  useEffect(() => {
    if (customer && mode === 'edit') {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
        gst_number: customer.gst_number || ''
      });
    } else {
      setFormData({ name: '', email: '', phone: '', company: '', gst_number: '' });
    }
  }, [customer, mode, open]);

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === 'create' ? 'Add New Customer' : 'Edit Customer'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-zinc-950 border-zinc-800 text-white"
              data-testid="customer-name-input"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Phone *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="customer-phone-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="customer-email-input"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Company</Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="customer-company-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">GST Number</Label>
              <Input
                value={formData.gst_number}
                onChange={(e) => setFormData(prev => ({ ...prev, gst_number: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="customer-gst-input"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-white text-black hover:bg-zinc-200" data-testid="save-customer-btn">
            {mode === 'create' ? 'Create Customer' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Address Form Modal
const AddressFormModal = ({ open, customer, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    is_default: false
  });

  useEffect(() => {
    if (open) {
      setFormData({
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        is_default: false
      });
    }
  }, [open]);

  const handleSubmit = () => {
    if (!formData.street || !formData.city || !formData.state || !formData.postal_code) {
      toast.error('All address fields are required');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Add Address for {customer?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Street Address *</Label>
            <Input
              value={formData.street}
              onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
              className="bg-zinc-950 border-zinc-800 text-white"
              data-testid="address-street-input"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">City *</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="address-city-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">State *</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="address-state-input"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Postal Code *</Label>
              <Input
                value={formData.postal_code}
                onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="address-postal-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Country</Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="address-country-input"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
              className="rounded border-zinc-700"
            />
            <Label htmlFor="is_default" className="text-zinc-300 cursor-pointer">Set as default address</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-white text-black hover:bg-zinc-200" data-testid="save-address-btn">
            Add Address
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomersPage;
