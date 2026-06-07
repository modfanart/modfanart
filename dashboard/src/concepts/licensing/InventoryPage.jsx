import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  MagnifyingGlass, 
  Funnel, 
  Package,
  PencilSimple,
  Trash,
  Plus as PlusIcon,
  Minus,
  ClockCounterClockwise,
  Tree
} from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  getProducts, 
  getBrands, 
  getCategories, 
  addStock, 
  reduceStock, 
  getStockHistory,
  deleteProduct,
  pruneProduct,
  createProduct,
  updateProduct
} from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export const InventoryPage = () => {
  const { hasRole } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(0);
  const limit = 20;
  
  // Modals
  const [stockModal, setStockModal] = useState({ open: false, product: null, type: 'add' });
  const [historyModal, setHistoryModal] = useState({ open: false, product: null, history: [] });
  const [productModal, setProductModal] = useState({ open: false, product: null, mode: 'create' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, product: null });

  const canManageProducts = hasRole(['super_admin', 'admin']);
  const canManageStock = hasRole(['super_admin', 'admin', 'ops']);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, brandsRes] = await Promise.all([
        getProducts({
          search: search || undefined,
          brand_id: brandFilter !== 'all' ? brandFilter : undefined,
          category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
          skip: page * limit,
          limit
        }),
        getBrands()
      ]);
      
      setProducts(productsRes.data.products);
      setTotal(productsRes.data.total);
      setBrands(brandsRes.data);
      
      if (brandFilter !== 'all') {
        const categoriesRes = await getCategories(brandFilter);
        setCategories(categoriesRes.data);
      } else {
        const allCategoriesRes = await getCategories();
        setCategories(allCategoriesRes.data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [search, brandFilter, categoryFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (brandFilter !== 'all') {
      getCategories(brandFilter).then(res => setCategories(res.data));
      setCategoryFilter('all');
    }
  }, [brandFilter]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleStockOperation = async () => {
    const { product, type, quantity, reason } = stockModal;
    if (!quantity || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    if (!reason) {
      toast.error('Please enter a reason');
      return;
    }

    try {
      if (type === 'add') {
        await addStock(product.id, { quantity: parseInt(quantity), reason });
        toast.success(`Added ${quantity} units to ${product.name}`);
      } else {
        await reduceStock(product.id, { quantity: parseInt(quantity), reason });
        toast.success(`Reduced ${quantity} units from ${product.name}`);
      }
      setStockModal({ open: false, product: null, type: 'add' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update stock');
    }
  };

  const handleViewHistory = async (product) => {
    try {
      const { data } = await getStockHistory(product.id);
      setHistoryModal({ open: true, product, history: data });
    } catch (error) {
      toast.error('Failed to load stock history');
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(deleteConfirm.product.id);
      toast.success('Product deleted');
      setDeleteConfirm({ open: false, product: null });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete product');
    }
  };

  const handlePruneProduct = async (product) => {
    try {
      await pruneProduct(product.id);
      toast.success('Product pruned (stock set to 0)');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to prune product');
    }
  };

  const handleSaveProduct = async (formData) => {
    try {
      if (productModal.mode === 'create') {
        await createProduct(formData);
        toast.success('Product created');
      } else {
        await updateProduct(productModal.product.id, formData);
        toast.success('Product updated');
      }
      setProductModal({ open: false, product: null, mode: 'create' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    }
  };

  const getBrandName = (brandId) => brands.find(b => b.id === brandId)?.name || 'Unknown';
  const getCategoryName = (categoryId) => categories.find(c => c.id === categoryId)?.name || 'Unknown';

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen" data-testid="inventory-page">
      <Header title="Inventory Management" subtitle={`${total} products in stock`} />
      
      <div className="p-4 sm:p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={handleSearch}
              className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500"
              data-testid="inventory-search"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-800 text-white" data-testid="brand-filter">
                <Funnel className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all" className="text-zinc-300">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id} className="text-zinc-300">
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-zinc-900 border-zinc-800 text-white" data-testid="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all" className="text-zinc-300">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="text-zinc-300">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {canManageProducts && (
              <Button 
                className="bg-white text-black hover:bg-zinc-200"
                onClick={() => setProductModal({ open: true, product: null, mode: 'create' })}
                data-testid="add-product-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Package weight="duotone" className="w-12 h-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400">No products found</p>
              {canManageProducts && (
                <Button 
                  variant="outline"
                  className="mt-4 border-zinc-700 text-zinc-300"
                  onClick={() => setProductModal({ open: true, product: null, mode: 'create' })}
                >
                  Add your first product
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} data-testid={`product-row-${product.id}`}>
                      <td>
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          {product.is_pruned && (
                            <span className="text-xs text-red-500">Pruned</span>
                          )}
                        </div>
                      </td>
                      <td className="font-mono text-xs">{product.sku}</td>
                      <td>{getBrandName(product.brand_id)}</td>
                      <td>{getCategoryName(product.category_id)}</td>
                      <td className="text-white font-medium">₹{product.price?.toFixed(2)}</td>
                      <td>
                        <span className={`font-medium ${product.stock < 10 ? 'text-red-500' : 'text-white'}`}>
                          {product.stock} {product.unit}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {canManageStock && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-500 hover:text-green-400"
                                onClick={() => setStockModal({ open: true, product, type: 'add', quantity: '', reason: '' })}
                                title="Add Stock"
                                data-testid={`add-stock-${product.id}`}
                              >
                                <PlusIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-400"
                                onClick={() => setStockModal({ open: true, product, type: 'reduce', quantity: '', reason: '' })}
                                title="Reduce Stock"
                                data-testid={`reduce-stock-${product.id}`}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                            onClick={() => handleViewHistory(product)}
                            title="Stock History"
                            data-testid={`view-history-${product.id}`}
                          >
                            <ClockCounterClockwise className="w-4 h-4" />
                          </Button>
                          {canManageProducts && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-400 hover:text-white"
                                onClick={() => setProductModal({ open: true, product, mode: 'edit' })}
                                title="Edit"
                                data-testid={`edit-product-${product.id}`}
                              >
                                <PencilSimple className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-orange-500 hover:text-orange-400"
                                onClick={() => handlePruneProduct(product)}
                                title="Prune (Set stock to 0)"
                                data-testid={`prune-product-${product.id}`}
                              >
                                <Tree className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-400"
                                onClick={() => setDeleteConfirm({ open: true, product })}
                                title="Delete"
                                data-testid={`delete-product-${product.id}`}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stock Modal */}
      <Dialog open={stockModal.open} onOpenChange={(open) => !open && setStockModal({ open: false, product: null, type: 'add' })}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {stockModal.type === 'add' ? 'Add Stock' : 'Reduce Stock'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-zinc-400">
              Product: <span className="text-white">{stockModal.product?.name}</span>
            </p>
            <p className="text-sm text-zinc-400">
              Current Stock: <span className="text-white">{stockModal.product?.stock} {stockModal.product?.unit}</span>
            </p>
            <div className="space-y-2">
              <Label className="text-zinc-300">Quantity</Label>
              <Input
                type="number"
                min="1"
                value={stockModal.quantity || ''}
                onChange={(e) => setStockModal(prev => ({ ...prev, quantity: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 text-white"
                placeholder="Enter quantity"
                data-testid="stock-quantity-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Reason</Label>
              <Input
                value={stockModal.reason || ''}
                onChange={(e) => setStockModal(prev => ({ ...prev, reason: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 text-white"
                placeholder="Enter reason for stock change"
                data-testid="stock-reason-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStockModal({ open: false, product: null, type: 'add' })}
              className="border-zinc-700 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStockOperation}
              className={stockModal.type === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              data-testid="stock-submit-btn"
            >
              {stockModal.type === 'add' ? 'Add Stock' : 'Reduce Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={historyModal.open} onOpenChange={(open) => !open && setHistoryModal({ open: false, product: null, history: [] })}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Stock History - {historyModal.product?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96">
            {historyModal.history.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">No stock history found</p>
            ) : (
              <div className="space-y-3">
                {historyModal.history.map((entry) => (
                  <div key={entry.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${entry.operation === 'add' ? 'text-green-500' : entry.operation === 'prune' ? 'text-orange-500' : 'text-red-500'}`}>
                        {entry.operation === 'add' ? '+' : '-'}{entry.quantity} {historyModal.product?.unit}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">{entry.reason}</p>
                    <p className="text-xs text-zinc-500 mt-1">By: {entry.user_name}</p>
                    <p className="text-xs text-zinc-500">
                      Stock: {entry.previous_stock} → {entry.new_stock}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <ProductFormModal
        open={productModal.open}
        mode={productModal.mode}
        product={productModal.product}
        brands={brands}
        categories={categories}
        onClose={() => setProductModal({ open: false, product: null, mode: 'create' })}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, product: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400">
            Are you sure you want to delete <span className="text-white">{deleteConfirm.product?.name}</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, product: null })}
              className="border-zinc-700 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-btn"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Product Form Modal Component
const ProductFormModal = ({ open, mode, product, brands, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand_id: '',
    category_id: '',
    price: '',
    stock: '0',
    description: '',
    unit: 'piece'
  });
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        brand_id: product.brand_id || '',
        category_id: product.category_id || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '0',
        description: product.description || '',
        unit: product.unit || 'piece'
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        brand_id: '',
        category_id: '',
        price: '',
        stock: '0',
        description: '',
        unit: 'piece'
      });
    }
  }, [product, mode, open]);

  useEffect(() => {
    if (formData.brand_id) {
      setFilteredCategories(categories.filter(c => c.brand_id === formData.brand_id));
    } else {
      setFilteredCategories(categories);
    }
  }, [formData.brand_id, categories]);

  const handleSubmit = () => {
    if (!formData.name || !formData.sku || !formData.brand_id || !formData.category_id || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    };
    
    if (mode === 'edit') {
      onSave({ name: data.name, price: data.price, description: data.description, unit: data.unit });
    } else {
      onSave(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="product-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">SKU *</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 text-white"
                disabled={mode === 'edit'}
                data-testid="product-sku-input"
              />
            </div>
          </div>
          
          {mode === 'create' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Brand *</Label>
                <Select value={formData.brand_id} onValueChange={(v) => setFormData(prev => ({ ...prev, brand_id: v, category_id: '' }))}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white" data-testid="product-brand-select">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id} className="text-zinc-300">
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Category *</Label>
                <Select value={formData.category_id} onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v }))}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white" data-testid="product-category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-zinc-300">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Price *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="bg-zinc-950 border-zinc-800 text-white"
                data-testid="product-price-input"
              />
            </div>
            {mode === 'create' && (
              <div className="space-y-2">
                <Label className="text-zinc-300">Initial Stock</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-white"
                  data-testid="product-stock-input"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-zinc-300">Unit</Label>
              <Select value={formData.unit} onValueChange={(v) => setFormData(prev => ({ ...prev, unit: v }))}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white" data-testid="product-unit-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="piece" className="text-zinc-300">Piece</SelectItem>
                  <SelectItem value="set" className="text-zinc-300">Set</SelectItem>
                  <SelectItem value="box" className="text-zinc-300">Box</SelectItem>
                  <SelectItem value="kg" className="text-zinc-300">Kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-zinc-300">Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-zinc-950 border-zinc-800 text-white"
              data-testid="product-description-input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-white text-black hover:bg-zinc-200" data-testid="save-product-btn">
            {mode === 'create' ? 'Create Product' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryPage;
