'use client';

import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';
import { useState, useEffect } from 'react';
import ProductCardBlock from './ProductCardBlock';

interface ProductFromApi {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl: string;
  imagesJson?: string;
  category?: string;
  tags?: string;
  sizes?: string;
  colors?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  sku?: string;
}

interface ProductColumnBlockProps {
  data: BlockData;
  blocks?: { id: string; type: string; jsonData: string | null }[];
}

export default function ProductColumnBlock({ data, blocks = [] }: ProductColumnBlockProps) {
  const title = getFieldValue(data, 'Title');
  const titleColor = getFieldValue(data, 'TitleColor', '#1e293b');
  const titleSize = getFieldValue(data, 'TitleSize', '32px');
  const subTitle = getFieldValue(data, 'SubTitle');
  const subTitleColor = getFieldValue(data, 'SubTitleColor');
  const subTitleSize = getFieldValue(data, 'SubTitleSize');
  const description = getFieldValue(data, 'Description');
  const descriptionColor = getFieldValue(data, 'DescriptionColor');
  const headerTextAlign = getFieldValue(data, 'HeaderTextAlign', 'left');
  const headerWidth = getFieldValue(data, 'HeaderWidth', 'normal');
  const autoMode = getFieldValue(data, 'AutoMode', 'true') === 'true';
  const showCategoryFilter = getFieldValue(data, 'ShowCategoryFilter', 'false') === 'true';
  const showSidebar = getFieldValue(data, 'ShowSidebar', 'true') === 'true';
  const columns = getFieldValue(data, 'Columns', '4');
  const productsPerPage = getFieldValue(data, 'ProductsPerPage', '12');
  const backgroundColor = getFieldValue(data, 'BackgroundColor', '#f8fafc');
  const cardBgColor = getFieldValue(data, 'CardBgColor', '#ffffff');
  const accentColor = getFieldValue(data, 'AccentColor', '#2563eb');
  const paddingY = getFieldValue(data, 'PaddingY', '3rem');
  const showStock = getFieldValue(data, 'ShowStock', 'true') === 'true';
  const showRating = getFieldValue(data, 'ShowRating', 'false') === 'true';
  const buttonText = getFieldValue(data, 'ButtonText', 'Add to cart');
  const filterCategories = getFieldValue(data, 'FilterCategories');
  const forceManual = getFieldValue(data, 'ForceManual', 'false') === 'true';
  const currencySymbol = getFieldValue(data, 'CurrencySymbol', 'kr');
  const isRestaurant = getFieldValue(data, 'IsRestaurant', 'false') === 'true';
  const restaurantName = getFieldValue(data, 'RestaurantName');
  const orderButtonText = getFieldValue(data, 'OrderButtonText', 'Place order');
  const ntfyTopic = getFieldValue(data, 'NtfyTopic');

  const [products, setProducts] = useState<ProductFromApi[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (autoMode) {
      fetch('/api/product')
        .then(r => r.ok ? r.json() : [])
        .then((list: ProductFromApi[]) => {
          setProducts(list);
          const cats = [...new Set(list.map(p => p.category).filter(Boolean) as string[])];
          setCategories(cats);
        })
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [autoMode]);

  const filteredProducts = filterCategories
    ? products.filter(p => {
        const cats = filterCategories.split(',').map(c => c.trim().toLowerCase());
        return p.category && cats.includes(p.category.toLowerCase());
      })
    : selectedCategory
      ? products.filter(p => p.category === selectedCategory)
      : products;

  const widthClass = headerWidth === 'narrow' ? 'max-w-2xl' :
                     headerWidth === 'wide' ? 'max-w-5xl' :
                     headerWidth === 'full' ? 'max-w-full' : 'max-w-4xl';

  const gridColsClass = columns === '1' ? 'grid-cols-1' :
                        columns === '2' ? 'grid-cols-1 md:grid-cols-2' :
                        columns === '3' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  const handleOrder = async () => {
    const sessionKey = typeof window !== 'undefined' ? (localStorage.getItem('EdenCartSessionKey') || 'eden_' + Date.now()) : '';
    
    if (typeof window !== 'undefined' && !localStorage.getItem('EdenCartSessionKey')) {
      localStorage.setItem('EdenCartSessionKey', sessionKey);
    }

    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionKey,
          isRestaurant: true,
          restaurantName,
          ntfyTopic,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      alert('Error processing order');
    }
  };

  return (
    <div style={{ backgroundColor, paddingTop: paddingY, paddingBottom: paddingY }}>
      <div className="container mx-auto px-4">
        <div className={`mx-auto mb-12 text-${headerTextAlign}`}>
          {title && (
            <h2 style={{ color: titleColor, fontSize: titleSize }} className="font-bold mb-4">
              {title}
            </h2>
          )}
          {subTitle && (
            <p style={{ color: subTitleColor, fontSize: subTitleSize }} className="mb-4 font-medium">
              {subTitle}
            </p>
          )}
          {description && (
            <p style={{ color: descriptionColor }} className="text-gray-600">
              {description}
            </p>
          )}
        </div>

        {showCategoryFilter && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full transition ${
                selectedCategory === '' 
                  ? 'text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              style={{ backgroundColor: selectedCategory === '' ? accentColor : undefined }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full transition ${
                  selectedCategory === cat 
                    ? 'text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                style={{ backgroundColor: selectedCategory === cat ? accentColor : undefined }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {showSidebar && categories.length > 0 && !showCategoryFilter && (
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold mb-3 text-gray-800">Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`text-left w-full px-3 py-2 rounded transition ${
                        selectedCategory === '' ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      style={{ backgroundColor: selectedCategory === '' ? accentColor : undefined }}
                    >
                      All
                    </button>
                  </li>
                  {categories.map(cat => (
                    <li key={cat}>
                      <button
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-left w-full px-3 py-2 rounded transition ${
                          selectedCategory === cat ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        style={{ backgroundColor: selectedCategory === cat ? accentColor : undefined }}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex-1">
            {!autoMode && blocks.length > 0 ? (
              <div className={`grid ${gridColsClass} gap-6`}>
                {blocks.map(block => {
                  const blockData = block.jsonData ? JSON.parse(block.jsonData) : {};
                  return (
                    <div key={block.id}>
                      {block.type === 'ProductCardBlock' && (
                        <ProductCardBlock data={blockData as BlockData} />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : loading ? (
              <div className="text-center py-12 text-gray-500">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No products available</div>
            ) : (
              <div className={`grid ${gridColsClass} gap-6`}>
                {filteredProducts.slice(0, parseInt(productsPerPage)).map(product => (
                  <ProductCardBlock
                    key={product.id}
                    data={{
                      ProductId: { Value: product.id },
                      Name: { Value: product.name },
                      Description: { Value: product.description },
                      LongDescription: { Value: product.longDescription || '' },
                      Price: { Value: product.price.toString() },
                      OriginalPrice: { Value: product.originalPrice?.toString() || '' },
                      Stock: { Value: product.stock.toString() },
                      Image: { Value: product.imageUrl },
                      ImagesJson: { Value: product.imagesJson || '' },
                      BackgroundColor: { Value: cardBgColor },
                      ButtonText: { Value: isRestaurant ? orderButtonText : buttonText },
                      Category: { Value: product.category || '' },
                      Tags: { Value: product.tags || '' },
                      Sizes: { Value: product.sizes || '' },
                      Colors: { Value: product.colors || '' },
                      Badge: { Value: product.badge || '' },
                      Rating: { Value: product.rating?.toString() || '' },
                      ReviewCount: { Value: product.reviewCount?.toString() || '' },
                      CurrencySymbol: { Value: currencySymbol },
                      ShowStock: { Value: showStock.toString() },
                      ShowRating: { Value: showRating.toString() },
                      IsRestaurant: { Value: isRestaurant.toString() },
                    } as BlockData}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
