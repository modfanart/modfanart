// backend/src/controllers/product.controller.js
const {
  createProduct,
  getProductById,
  getProductsByCategory,
  getProductsByArtist,
  getProductsByBrand,
  getAllActiveProducts,
  updateProduct,
  deleteProduct,
} = require('../models/product');

const { logger } = require('../utils/logger');
const fallbackStorefronts = [
  {
    id: 'fallback-store',
    name: 'Sample Store',
    slug: 'sample-store',
    imageUrl: '/placeholder.svg?height=400&width=600',
    type: 'brand',
    productCount: 5,
    featured: true,
  },
];

// Mock storefront data (same as your Next.js code)
const allStorefronts = [
  {
    id: 'store-1',
    name: 'Official Brand Store',
    slug: 'official-brand',
    imageUrl: '/placeholder.svg?height=400&width=600',
    type: 'brand',
    productCount: 24,
    featured: true,
  },
  {
    id: 'store-2',
    name: 'Artist Collection',
    slug: 'artist-collection',
    imageUrl: '/placeholder.svg?height=400&width=600',
    type: 'artist',
    productCount: 12,
    featured: true,
  },
  {
    id: 'store-3',
    name: 'Indie Creator Shop',
    slug: 'indie-creator',
    imageUrl: '/placeholder.svg?height=400&width=600',
    type: 'artist',
    productCount: 8,
    featured: false,
  },
];
const fallbackProducts = [
  {
    id: 'product-1',
    title: 'Licensed T-Shirt',
    description: 'Official fan art t-shirt',
    price: 29.99,
    imageUrl: '/placeholder.svg?height=300&width=300',
    category: 'apparel',
    artist: 'Jane Doe',
    brand: 'Popular IP',
    status: 'active',
    isNew: true,
    isBestseller: false,
  },
  {
    id: 'product-2',
    title: "Collector's Poster",
    description: 'Limited edition poster',
    price: 24.99,
    imageUrl: '/placeholder.svg?height=300&width=300',
    category: 'posters',
    artist: 'John Smith',
    brand: 'Famous Brand',
    status: 'active',
    isNew: false,
    isBestseller: true,
  },
];
// Sample approved gallery items (same as your Next.js code)
const approvedArtwork = [
  {
    id: 'art-001',
    title: 'Superhero in Action',
    description: 'Dynamic illustration of a popular superhero in action',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Superhero+Art',
    artistName: 'Jane Artist',
    artistId: 'jane-123',
    originalIp: 'Marvel',
    approvedDate: '2023-02-15T10:30:00Z',
    featured: true,
    category: 'apparel',
    tags: ['superhero', 'action', 'illustration'],
    price: 29.99,
  },
  {
    id: 'art-002',
    title: 'Game Character Portrait',
    description: 'Detailed portrait of a beloved video game character',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Game+Character',
    artistName: 'John Creator',
    artistId: 'john-456',
    originalIp: 'Nintendo',
    approvedDate: new Date().toISOString(), // Today (new)
    featured: false,
    category: 'posters',
    tags: ['gaming', 'portrait', 'digital-art'],
    price: 24.99,
  },
  {
    id: 'art-003',
    title: 'Fantasy World Map',
    description: 'Intricate map of a popular fantasy world',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Fantasy+Map',
    artistName: 'Map Maker',
    artistId: 'map-789',
    originalIp: 'Fantasy Realms',
    approvedDate: '2023-01-20T14:45:00Z',
    featured: true,
    category: 'posters',
    tags: ['fantasy', 'map', 'illustration'],
    price: 34.99,
  },
  {
    id: 'art-004',
    title: 'Anime Character Collection',
    description: 'Stylized collection of popular anime characters',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Anime+Collection',
    artistName: 'Anime Artist',
    artistId: 'anime-101',
    originalIp: 'Anime Studio',
    approvedDate: '2023-03-05T09:15:00Z',
    featured: false,
    category: 'stickers',
    tags: ['anime', 'characters', 'collection'],
    price: 14.99,
  },
  {
    id: 'art-005',
    title: 'Sci-Fi Spaceship Design',
    description: 'Detailed technical drawing of an iconic sci-fi spaceship',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Spaceship+Design',
    artistName: 'Space Designer',
    artistId: 'space-202',
    originalIp: 'Sci-Fi Universe',
    approvedDate: new Date().toISOString(), // Today (new)
    featured: true,
    category: 'posters',
    tags: ['sci-fi', 'spaceship', 'technical'],
    price: 29.99,
  },
  {
    id: 'art-006',
    title: 'Magical Creatures Set',
    description: 'Collection of magical creatures from a fantasy series',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Magical+Creatures',
    artistName: 'Fantasy Artist',
    artistId: 'fantasy-303',
    originalIp: 'Magic World',
    approvedDate: '2023-02-28T16:20:00Z',
    featured: false,
    category: 'collectibles',
    tags: ['fantasy', 'creatures', 'collection'],
    price: 49.99,
  },
  {
    id: 'art-007',
    title: 'Retro Game Tribute',
    description: 'Nostalgic artwork celebrating classic video games',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Retro+Games',
    artistName: 'Retro Designer',
    artistId: 'retro-404',
    originalIp: 'Classic Gaming',
    approvedDate: '2023-03-10T11:30:00Z',
    featured: true,
    category: 'apparel',
    tags: ['retro', 'gaming', 'nostalgia'],
    price: 27.99,
  },
  {
    id: 'art-008',
    title: 'Comic Book Heroes',
    description: 'Group portrait of iconic comic book heroes',
    imageUrl: '/placeholder.svg?height=400&width=400&text=Comic+Heroes',
    artistName: 'Comic Artist',
    artistId: 'comic-505',
    originalIp: 'Comic Universe',
    approvedDate: new Date().toISOString(), // Today (new)
    featured: false,
    category: 'posters',
    tags: ['comics', 'heroes', 'group'],
    price: 32.99,
  },
];
async function createProductHandler(req, res, next) {
  try {
    const product = await createProduct(req.body);
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

async function getProductByIdHandler(req, res, next) {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

async function getProductsByCategoryHandler(req, res, next) {
  try {
    const products = await getProductsByCategory(req.params.category);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

async function getProductsByArtistHandler(req, res, next) {
  try {
    const products = await getProductsByArtist(req.params.artistId);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

async function getProductsByBrandHandler(req, res, next) {
  try {
    const products = await getProductsByBrand(req.params.brand);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

async function getAllActiveProductsHandler(req, res, next) {
  try {
    const products = await getAllActiveProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

async function updateProductHandler(req, res, next) {
  try {
    const product = await updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

async function deleteProductHandler(req, res, next) {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
}
// ─────────────────────────────────────────────
//              NEW: Gallery Endpoint
// ─────────────────────────────────────────────

async function getApprovedGalleryItems(req, res, next) {
  try {
    // In a real implementation, fetch from DB (e.g. approved products/submissions)
    // For now, return the static sample data just like your Next.js version
    logger.info('Returning approved gallery items (sample data)');

    res.json({
      success: true,
      items: approvedArtwork,
    });
  } catch (error) {
    logger.error('Error fetching approved gallery items', {
      error: error.message || error,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch approved gallery items',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
async function getMarketplaceProducts(req, res, next) {
  try {
    const { category, artistId, brand } = req.query;
    let products = [];

    // Try to fetch from DB
    try {
      if (category) {
        products = await getProductsByCategory(category);
      } else if (artistId) {
        products = await getProductsByArtist(artistId);
      } else if (brand) {
        products = await getProductsByBrand(brand);
      } else {
        // Fetch all active products (you can paginate later)
        const categories = ['apparel', 'posters', 'accessories', 'stickers', 'collectibles', 'digital'];
        const allProducts = await Promise.all(
          categories.map(cat => getProductsByCategory(cat).catch(() => []))
        );
        products = allProducts.flat();
      }
    } catch (dbError) {
      logger.error('Database error when fetching marketplace products', {
        error: dbError.message || dbError,
      });

      // Fallback data (same as your Next.js fallback)
      products = fallbackProducts;
    }

    // Filter only active products
    products = products.filter(product => product.status === 'active');

    res.json({ products });
  } catch (error) {
    logger.error('Error in marketplace products endpoint', {
      error: error.message || error,
    });

    // Ultimate fallback even on critical errors
    res.json({
      products: [
        {
          id: 'error-product',
          title: 'Sample Product',
          description: "This product appears when there's an API error",
          price: 9.99,
          imageUrl: '/placeholder.svg?height=300&width=300',
          category: 'digital',
          artist: 'System',
          brand: 'MOD Platform',
          status: 'active',
          isNew: true,
          isBestseller: false,
        },
      ],
    });
  }
}
async function getStorefronts(req, res, next) {
  try {
    const featured = req.query.featured === 'true';

    let storefronts = allStorefronts;

    // Filter by featured if requested
    if (featured) {
      storefronts = storefronts.filter(store => store.featured);
    }

    logger.info('Returning storefronts', {
      context: 'storefronts',
      featuredOnly: featured,
      count: storefronts.length,
    });

    res.json({ storefronts });
  } catch (error) {
    logger.error('Error fetching storefronts', {
      error: error.message || error,
      context: 'storefronts',
    });

    // Fallback data on error (same as your Next.js fallback)
    res.json({
      storefronts: fallbackStorefronts,
    });
  }
}
module.exports = {
  createProductHandler,
  getProductByIdHandler,
  getProductsByCategoryHandler,
  getProductsByArtistHandler,
  getProductsByBrandHandler,
  getAllActiveProductsHandler,
  updateProductHandler,
  deleteProductHandler,
    getApprovedGalleryItems,
    getMarketplaceProducts, // new export
    getStorefronts, // new export
};