import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MagnifyingGlass,
  Tag,
  Storefront,
} from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useGetAllBrandsQuery } from '../../services/api/brandApi';
import { useGetPublishedProductsQuery } from '../../services/api/merchApi';

const brandColors = [
  'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  'from-pink-500/20 to-pink-600/10 border-pink-500/30',
  'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
];

const PRODUCT_TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'tshirt', label: 'T-Shirt' },
  { value: 'hoodie', label: 'Hoodie' },
  { value: 'poster', label: 'Poster' },
  { value: 'sticker', label: 'Sticker' },
  { value: 'mug', label: 'Mug' },
  { value: 'tote', label: 'Tote bag' },
  { value: 'other', label: 'Other' },
];

function formatPrice(cents) {
  if (cents == null || Number.isNaN(Number(cents))) return '—';
  return `$${(Number(cents) / 100).toFixed(2)}`;
}

function ProductCard({ product, onClick }) {
  const imageUrl = product.image_url;
  const priceLabel =
    product.min_price_usd_cents != null &&
    product.max_price_usd_cents != null &&
    product.min_price_usd_cents !== product.max_price_usd_cents
      ? `${formatPrice(product.min_price_usd_cents)} – ${formatPrice(product.max_price_usd_cents)}`
      : formatPrice(product.min_price_usd_cents ?? product.max_price_usd_cents);

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50"
      data-testid={`shop-product-${product.id}`}
    >
      <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Package weight="duotone" className="w-16 h-16 text-zinc-600" />
        )}
      </div>

      <div className="p-4 space-y-2">
        <div>
          <h3 className="font-medium text-white line-clamp-2">{product.title}</h3>
          <p className="text-xs text-zinc-500 mt-1 capitalize">
            {product.base_product_type?.replace(/_/g, ' ') || 'Merch'}
            {product.brand_name ? ` · ${product.brand_name}` : ''}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-semibold text-white">{priceLabel}</span>
          {product.rating_count > 0 && (
            <span className="text-xs text-amber-400/90">
              ★ {Number(product.rating_avg || 0).toFixed(1)} ({product.rating_count})
            </span>
          )}
        </div>

        {product.seller_name && (
          <p className="text-xs text-zinc-500 truncate">by {product.seller_name}</p>
        )}
      </div>
    </button>
  );
}

export const ShopPage = () => {
  const navigate = useNavigate();
  const { brandId } = useParams();

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [productType, setProductType] = useState('all');
  const [selectedBrandId, setSelectedBrandId] = useState(brandId || null);

  useEffect(() => {
    setSelectedBrandId(brandId || null);
  }, [brandId]);

  const {
    data: brandsData,
    isLoading: brandsLoading,
    isError: brandsError,
  } = useGetAllBrandsQuery({ limit: 100, sortBy: 'name', sortOrder: 'asc' });

  const brands = brandsData?.brands || [];

  const selectedBrand = useMemo(
    () => brands.find((b) => b.id === selectedBrandId) || null,
    [brands, selectedBrandId]
  );

  const productQueryArgs = useMemo(() => {
    const args = {};
    if (search.trim()) args.search = search.trim();
    if (productType && productType !== 'all') args.type = productType;
    if (selectedBrandId) args.brand_id = selectedBrandId;
    args.sort = 'newest';
    return args;
  }, [search, productType, selectedBrandId]);

  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching: productsFetching,
    isError: productsError,
    refetch: refetchProducts,
  } = useGetPublishedProductsQuery(productQueryArgs);

  const products = productsData?.products || [];

  const handleSelectBrand = (brand) => {
    setSelectedBrandId(brand.id);
    setProductType('all');
    setSearch('');
    setSearchInput('');
    navigate(`/storefront/${brand.id}`);
  };

  const handleBackToAll = () => {
    setSelectedBrandId(null);
    setProductType('all');
    setSearch('');
    setSearchInput('');
    navigate('/storefront');
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setSearch(searchInput);
  };

  const handleViewProduct = (product) => {
    navigate(`/storefront/product/${product.id}`);
  };

  if (!selectedBrandId) {
    return (
      <div className="min-h-screen" data-testid="shop-page">
        <Header
          title="Storefront"
          subtitle="Browse brands and published merch from the marketplace"
        />

        <div className="p-4 sm:p-6 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Storefront weight="duotone" className="w-5 h-5 text-violet-400" />
                Latest published products
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white"
                onClick={() => refetchProducts()}
              >
                Refresh
              </Button>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row gap-3 mb-4"
            >
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products…"
                  className="pl-9 bg-zinc-900 border-zinc-800 text-white"
                  data-testid="shop-search"
                />
              </div>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger
                  className="w-full sm:w-48 bg-zinc-900 border-zinc-800 text-white"
                  data-testid="shop-type-filter"
                >
                  <SelectValue placeholder="Product type" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white">
                Search
              </Button>
            </form>

            {productsLoading || productsFetching ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : productsError ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
                Could not load products from the backend. Check that the API is running.
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-zinc-900 border border-zinc-800 rounded-lg">
                <Package weight="duotone" className="w-12 h-12 text-zinc-600 mb-3" />
                <p className="text-zinc-400">No published products yet</p>
                <p className="text-sm text-zinc-500 mt-1">
                  Products appear here once sellers publish merch listings
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => handleViewProduct(product)}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Tag weight="duotone" className="w-5 h-5 text-violet-400" />
              Shop by brand
            </h2>

            {brandsLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : brandsError ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
                Could not load brands from the backend.
              </div>
            ) : brands.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center bg-zinc-900 border border-zinc-800 rounded-lg">
                <Package weight="duotone" className="w-12 h-12 text-zinc-600 mb-3" />
                <p className="text-zinc-400">No brands available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {brands.map((brand, index) => (
                  <button
                    type="button"
                    key={brand.id}
                    onClick={() => handleSelectBrand(brand)}
                    className={`text-left rounded-lg border bg-gradient-to-br p-5 hover:scale-[1.01] transition-transform ${
                      brandColors[index % brandColors.length]
                    }`}
                    data-testid={`shop-brand-${brand.id}`}
                  >
                    <div className="flex items-start gap-3">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt=""
                          className="w-12 h-12 rounded-md object-cover bg-zinc-800"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-zinc-800/80 flex items-center justify-center text-lg font-semibold text-white">
                          {(brand.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white truncate">{brand.name}</h3>
                        {brand.slug && (
                          <p className="text-xs text-zinc-400 font-mono">/{brand.slug}</p>
                        )}
                        {brand.description && (
                          <p className="text-sm text-zinc-400 line-clamp-2 mt-1">
                            {brand.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="shop-products-page">
      <Header
        title={selectedBrand?.name || 'Brand store'}
        subtitle={
          selectedBrand?.description ||
          'Published merch for this brand from the marketplace API'
        }
      />

      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToAll}
            className="text-zinc-400 hover:text-white w-fit"
            data-testid="shop-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            All products & brands
          </Button>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-1 flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search in this brand…"
                className="pl-9 bg-zinc-900 border-zinc-800 text-white"
                data-testid="shop-search"
              />
            </div>
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger
                className="w-full sm:w-48 bg-zinc-900 border-zinc-800 text-white"
                data-testid="shop-type-filter"
              >
                <SelectValue placeholder="Product type" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white">
              Search
            </Button>
          </form>
        </div>

        {productsLoading || productsFetching ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : productsError ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
            Failed to load products for this brand.
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-zinc-900 border border-zinc-800 rounded-md">
            <Package weight="duotone" className="w-12 h-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400">No products found</p>
            <p className="text-sm text-zinc-500 mt-2">
              Try clearing filters or check that this brand has published merch
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleViewProduct(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
