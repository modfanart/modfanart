import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package } from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { useGetProductQuery } from '../../services/api/merchApi';

function formatPrice(cents) {
  if (cents == null || Number.isNaN(Number(cents))) return '—';
  return `$${(Number(cents) / 100).toFixed(2)}`;
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetProductQuery(productId, {
    skip: !productId,
  });

  const product = data?.product;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen p-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/storefront')}
          className="text-zinc-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to storefront
        </Button>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center text-red-300">
          Product not found or could not be loaded from the backend.
        </div>
      </div>
    );
  }

  const variants = product.variants || [];
  const imageUrl = product.image_url;
  const minPrice = product.min_price_usd_cents;
  const maxPrice = product.max_price_usd_cents;
  const priceLabel =
    minPrice != null && maxPrice != null && minPrice !== maxPrice
      ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
      : formatPrice(minPrice ?? maxPrice);

  return (
    <div className="min-h-screen" data-testid="product-detail-page">
      <Header
        title={product.title}
        subtitle={
          product.brand_name
            ? `${product.brand_name}${product.base_product_type ? ` · ${product.base_product_type}` : ''}`
            : product.base_product_type || 'Merch product'
        }
      />

      <div className="p-4 sm:p-6 max-w-5xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-zinc-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package weight="duotone" className="w-24 h-24 text-zinc-600" />
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">{product.title}</h1>
              {product.seller_name && (
                <p className="text-sm text-zinc-400 mt-1">Sold by {product.seller_name}</p>
              )}
              {product.artwork_title && (
                <p className="text-sm text-zinc-500 mt-1">
                  Artwork: {product.artwork_title}
                </p>
              )}
            </div>

            <div className="text-3xl font-bold text-white">{priceLabel}</div>

            {product.description && (
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 capitalize">
                {product.base_product_type?.replace(/_/g, ' ') || 'merch'}
              </span>
              {product.fulfillment_type && (
                <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 capitalize">
                  {product.fulfillment_type.replace(/_/g, ' ')}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                {product.status}
              </span>
            </div>

            {variants.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-zinc-400 mb-3">
                  Variants ({variants.length})
                </h2>
                <div className="space-y-2">
                  {variants.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">
                          {[v.size, v.color, v.sku].filter(Boolean).join(' · ') ||
                            'Default variant'}
                        </p>
                        {v.stock != null && (
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                          </p>
                        )}
                      </div>
                      <span className="font-medium text-white shrink-0">
                        {formatPrice(v.price_usd_cents)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-zinc-500">
              Add to cart requires a signed-in buyer and a selected variant. Use the cart API
              (`POST /api/cart/merch`) once authentication is available in this view.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
