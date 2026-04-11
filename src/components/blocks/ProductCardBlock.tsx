"use client";

import { getFieldValue } from "@/lib/blocks/types";
import type { BlockData } from "@/lib/blocks/types";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  longDescription?: string | null;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl: string | null;
  imagesJson?: string | null;
  category?: string | null;
  tags?: string | null;
  sizes?: string | null;
  colors?: string | null;
  badge?: string | null;
  rating?: number;
  reviewCount?: number;
  sku?: string | null;
}

export default function ProductCardBlock({ data }: { data: BlockData }) {
  const productId = getFieldValue(data, "ProductId");
  const bgColor = getFieldValue(data, "BackgroundColor", "#ffffff");
  const buttonText = getFieldValue(data, "ButtonText", "Add to cart");
  const manualName = getFieldValue(data, "Name");
  const manualDesc = getFieldValue(data, "Description");
  const longDesc = getFieldValue(data, "LongDescription");
  const manualPrice = getFieldValue(data, "Price");
  const originalPrice = getFieldValue(data, "OriginalPrice");
  const currencySymbol = getFieldValue(data, "CurrencySymbol", "kr");
  const manualImage = getFieldValue(data, "Image");
  const imagesJson = getFieldValue(data, "ImagesJson");
  const category = getFieldValue(data, "Category");
  const tags = getFieldValue(data, "Tags");
  const sizes = getFieldValue(data, "Sizes");
  const colors = getFieldValue(data, "Colors");
  const badge = getFieldValue(data, "Badge");
  const rating = getFieldValue(data, "Rating");
  const reviewCount = getFieldValue(data, "ReviewCount");
  const showStock = getFieldValue(data, "ShowStock", "true") === "true";
  const showRating = getFieldValue(data, "ShowRating", "false") === "true";
  const isRestaurant = getFieldValue(data, "IsRestaurant", "false") === "true";

  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const autoProductId = useRef<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/product?id=${productId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && !d.error) {
          setProduct(d);
          if (d.imageUrl) setSelectedImage(d.imageUrl);
        }
      })
      .catch(() => {});
  }, [productId]);

  useEffect(() => {
    if (manualImage) setSelectedImage(manualImage);
  }, [manualImage]);

  const displayName = manualName || product?.name || "Product";
  const displayDesc = longDesc || manualDesc || product?.description || "";
  const displayPrice = manualPrice || (product ? product.price.toString() : "");
  const displayOriginalPrice = originalPrice || (product?.originalPrice?.toString() || "");
  const displayImage = selectedImage || product?.imageUrl || "";
  const displayCategory = category || (product?.category?.name ? String(product.category.name) : "") || (product?.category && typeof product.category === 'object' ? '' : String(product?.category || ''));
  const displayBadge = badge || product?.badge || "";
  const displayRating = rating || (product?.rating?.toString() || "");
  const displayReviewCount = reviewCount || (product?.reviewCount?.toString() || "");
  const displayStock = product?.stock || parseInt(getFieldValue(data, "Stock") || "0");
  const displaySizes = sizes || product?.sizes || "";
  const displayColors = colors || product?.colors || "";

  const images: string[] = [];
  if (displayImage) images.push(displayImage);
  try {
    const parsed = imagesJson || product?.imagesJson;
    if (parsed) {
      const arr = JSON.parse(parsed);
      if (Array.isArray(arr)) {
        arr.forEach((url: string) => {
          if (url && !images.includes(url)) images.push(url);
        });
      }
    }
  } catch {}

  const sizeOptions = displaySizes ? displaySizes.split(',').map(s => s.trim()) : [];
  const colorOptions = displayColors ? displayColors.split(',').map(c => c.trim()) : [];

  const renderStars = (ratingStr: string) => {
    const r = parseFloat(ratingStr) || 0;
    const full = Math.floor(r);
    const half = r % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(full)].map((_, i) => <span key={`f${i}`} className="text-yellow-400">★</span>)}
        {[...Array(half)].map((_, i) => <span key={`h${i}`} className="text-yellow-400">★</span>)}
        {[...Array(empty)].map((_, i) => <span key={`e${i}`} className="text-gray-300">★</span>)}
        {displayReviewCount && <span className="text-gray-500 text-xs ml-1">({displayReviewCount})</span>}
      </div>
    );
  };

  async function resolveProductId(): Promise<string | null> {
    if (productId) return productId;
    if (autoProductId.current) return autoProductId.current;

    if (!manualName || !manualPrice) return null;

    const res = await fetch("/api/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: manualName,
        description: manualDesc || "",
        longDescription: longDesc || "",
        price: parseFloat(manualPrice) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        currencySymbol,
        stock: parseInt(getFieldValue(data, "Stock") || "999") || 999,
        imageUrl: manualImage || null,
        imagesJson: imagesJson || null,
        category: displayCategory || null,
        tags: tags || null,
        sizes: displaySizes || null,
        colors: displayColors || null,
        badge: displayBadge || null,
        rating: displayRating ? parseFloat(displayRating) : null,
        reviewCount: displayReviewCount ? parseInt(displayReviewCount) : null,
      }),
    });
    if (!res.ok) return null;
    const created: ProductData = await res.json();
    autoProductId.current = created.id;
    return created.id;
  }

  async function addToCart() {
    setAdding(true);
    try {
      const finalId = await resolveProductId();
      if (!finalId) {
        alert("Select a product or fill in at least Name and Price in the block.");
        return;
      }

      let sessionKey = localStorage.getItem("EdenCartSessionKey");
      if (!sessionKey) {
        sessionKey = "eden_" + new Date().getTime();
        localStorage.setItem("EdenCartSessionKey", sessionKey);
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId: finalId, 
          quantity: 1, 
          sessionKey,
          size: selectedSize || null,
          color: selectedColor || null,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        const el = document.getElementById("cart-count");
        if (el && result.totalProducts !== undefined)
          el.innerText = result.totalProducts.toString();
        if (isRestaurant) {
          router.push("/checkout");
        } else {
          router.push("/cart");
        }
      } else {
        alert("Error: " + (result.error || "Error adding to cart"));
      }
    } catch {
      alert("Network error");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div
      className="shadow-lg transition-transform hover:scale-105 relative"
      style={{
        backgroundColor: bgColor,
        borderRadius: "12px",
        padding: "1.5rem",
        textAlign: "center",
        maxWidth: "350px",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: "1px solid #eee",
      }}
    >
      {displayBadge && (
        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          {displayBadge}
        </span>
      )}

      {images.length > 1 && (
        <div className="flex gap-1 mb-2 justify-center">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(img)}
              className={`w-12 h-12 rounded overflow-hidden border-2 ${selectedImage === img ? 'border-blue-500' : 'border-gray-200'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div
        className="block cursor-pointer"
        style={{ textDecoration: "none", color: "inherit" }}
        onClick={async () => {
          if (productId) { router.push(`/product/${productId}`); return; }
          if (autoProductId.current) { router.push(`/product/${autoProductId.current}`); return; }
          if (manualName && manualPrice) {
            const id = await resolveProductId();
            if (id) router.push(`/product/${id}`);
          }
        }}
      >
        {displayImage && (
          <img
            src={displayImage}
            alt={displayName}
            style={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        )}
        <h3 className="font-bold text-slate-800 mt-2">{displayName}</h3>
        
        {showRating && displayRating && renderStars(displayRating)}

        {displayCategory && (
          <span className="text-xs text-gray-500">{displayCategory}</span>
        )}

        {displayDesc && (
          <p
            className="text-sm text-slate-500 mt-1"
            dangerouslySetInnerHTML={{
              __html: displayDesc.replace(/\n/g, "<br/>"),
            }}
          />
        )}

        <div className="mt-2 flex items-center justify-center gap-2">
          {displayOriginalPrice && parseFloat(displayOriginalPrice) > parseFloat(displayPrice || "0") && (
            <span className="text-gray-400 line-through text-sm">{displayOriginalPrice} {currencySymbol}</span>
          )}
          {displayPrice && (
            <span className="text-lg font-black text-emerald-600">
              {displayPrice} {currencySymbol}
            </span>
          )}
        </div>

        {showStock && (
          <div className={`text-xs mt-1 ${displayStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {displayStock > 0 ? `In stock (${displayStock})` : 'Out of stock'}
          </div>
        )}
      </div>

      {sizeOptions.length > 0 && (
        <div className="mt-2">
          <span className="text-xs text-gray-500">Size:</span>
          <div className="flex gap-1 justify-center mt-1">
            {sizeOptions.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-2 py-1 text-xs border rounded ${selectedSize === size ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {colorOptions.length > 0 && (
        <div className="mt-2">
          <span className="text-xs text-gray-500">Color:</span>
          <div className="flex gap-1 justify-center mt-1">
            {colorOptions.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-2 py-1 text-xs border rounded ${selectedColor === color ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={addToCart}
        disabled={adding || (showStock && displayStock <= 0)}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition mt-auto disabled:opacity-60"
      >
        {adding ? "Adding..." : buttonText}
      </button>
    </div>
  );
}
