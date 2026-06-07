import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  ShoppingCart,
  Package,
  MagnifyingGlass,
  Funnel,
  Tag
} from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getBrands, getCategories, getProducts } from '../../lib/api';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner';

// Brand colors for visual distinction
const brandColors = [
  'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  'from-pink-500/20 to-pink-600/10 border-pink-500/30',
  'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
];

export const ShopPage = () => {
  const navigate = useNavigate();
  const { brandId } = useParams();
  const { addToCart } = useCart();
  
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Fetch brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await getBrands();
        setBrands(data);
        
        // If brandId is in URL, select that brand
        if (brandId) {
          const brand = data.find(b => b.id === brandId);
          if (brand) {
            setSelectedBrand(brand);
          }
        }
      } catch (error) {
        toast.error('Failed to load brands');
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [brandId]);

  // Fetch categories and products when brand is selected
  useEffect(() => {
    if (selectedBrand) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [categoriesRes, productsRes] = await Promise.all([
            getCategories(selectedBrand.id),
            getProducts({ 
              brand_id: selectedBrand.id,
              category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
              search: search || undefined,
              limit: 100
            })
          ]);
          setCategories(categoriesRes.data);
          setProducts(productsRes.data.products);
          setTotal(productsRes.data.total);
        } catch (error) {
          toast.error('Failed to load products');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedBrand, selectedCategory, search]);

  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
    setSelectedCategory('all');
    setSearch('');
    navigate(`/shop/${brand.id}`);
  };

  const handleBackToBrands = () => {
    setSelectedBrand(null);
    setCategories([]);
    setProducts([]);
    setSelectedCategory('all');
    setSearch('');
    navigate('/shop');
  };

  const handleAddToCart = async (product) => {
    const result = await addToCart(product.id, 1);
    if (result.success) {
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  // Show brand selection view
  if (!selectedBrand) {
    return (
      <div className="min-h-screen" data-testid="shop-page">
        <Header title="Shop by Brand" subtitle="Select a brand to browse products" />
        
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : brands.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Package weight="duotone" className="w-16 h-16 text-zinc-600 mb-4" />
              <p className="text-zinc-400">No brands available</p>
              <p className="text-sm text-zinc-500 mt-2">Seed some data to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {brands.map((brand, index) => (
                <div
                  key={brand.id}
                  onClick={() => handleSelectBrand(brand)}
                  className={`relative bg-gradient-to-br ${brandColors[index % brandColors.length]} border rounded-xl p-6 cursor-pointer hover:scale-[1.02] transition-all duration-200 group`}
                  data-testid={`brand-card-${brand.id}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{brand.name.charAt(0)}</span>
                    </div>
                    <Tag weight="duotone" className="w-6 h-6 text-white/50 group-hover:text-white/80 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{brand.name}</h3>
                  <p className="text-sm text-white/60">{brand.description || 'Quality sanitary products'}</p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <span className="text-xs text-white/50">Click to browse products</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show products view for selected brand
  return (
    <div className="min-h-screen" data-testid="shop-products-page">
      <Header title={selectedBrand.name} subtitle={`${total} products available`} />
      
      <div className="p-6 space-y-6">
        {/* Back button and filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <Button
            variant="ghost"
            onClick={handleBackToBrands}
            className="text-zinc-400 hover:text-white"
            data-testid="back-to-brands"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Brands
          </Button>
          
          <div className="flex flex-col sm:flex-row flex-1 gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500"
                data-testid="shop-search"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-zinc-900 border-zinc-800 text-white" data-testid="shop-category-filter">
                <Funnel className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all" className="text-zinc-300">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-zinc-300">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-white text-black' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id 
                  ? 'bg-white text-black' 
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
              data-testid={`category-chip-${cat.id}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-zinc-900 border border-zinc-800 rounded-md">
            <Package weight="duotone" className="w-12 h-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400">No products found</p>
            <p className="text-sm text-zinc-500 mt-2">Try changing your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors"
                data-testid={`shop-product-${product.id}`}
              >
                {/* Product image placeholder */}
                <div className="aspect-square bg-zinc-800 flex items-center justify-center">
                  <Package weight="duotone" className="w-16 h-16 text-zinc-600" />
                </div>
                
                {/* Product info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-medium text-white line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono mt-1">{product.sku}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white">₹{product.price?.toFixed(2)}</span>
                    <span className={`text-xs px-2 py-1 rounded ${product.stock > 10 ? 'bg-green-500/20 text-green-400' : product.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  
                  <Button
                    className="w-full bg-white text-black hover:bg-zinc-200"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    data-testid={`add-to-cart-${product.id}`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
