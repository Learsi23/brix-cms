"use client";

import { getFieldValue } from "@/lib/blocks/types";
import type { BlockData } from "@/lib/blocks/types";

export default function ProductCardBlock({ data }: { data: BlockData }) {
  const productId = getFieldValue(data, "ProductId");
  const bgColor = getFieldValue(data, "BackgroundColor", "#ffffff");
  const buttonText = getFieldValue(data, "ButtonText", "View Details");
  const buttonUrl = getFieldValue(data, "ButtonUrl", "#");
  const manualName = getFieldValue(data, "Name");
  const manualDesc = getFieldValue(data, "Description");
  const manualPrice = getFieldValue(data, "Price");
  const originalPrice = getFieldValue(data, "OriginalPrice");
  const currencySymbol = getFieldValue(data, "CurrencySymbol", "$");
  const manualImage = getFieldValue(data, "Image");
  const badge = getFieldValue(data, "Badge");

  const displayName = manualName || "Product";
  const displayDesc = manualDesc || "";
  const displayPrice = manualPrice ? `${currencySymbol}${manualPrice}` : "";
  const displayOriginalPrice = originalPrice ? `${currencySymbol}${originalPrice}` : "";
  const displayImage = manualImage || "";
  const displayBadge = badge || "";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow" style={{ backgroundColor: bgColor }}>
      {displayImage && (
        <div className="aspect-square overflow-hidden">
          <img src={displayImage} alt={displayName} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        {displayBadge && (
          <span className="inline-block px-2 py-1 text-xs font-bold bg-blue-600 text-white rounded mb-2">
            {displayBadge}
          </span>
        )}
        <h3 className="text-lg font-bold text-gray-900">{displayName}</h3>
        {displayDesc && <p className="text-sm text-gray-600 mt-1">{displayDesc}</p>}
        {displayPrice && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">{displayPrice}</span>
            {displayOriginalPrice && (
              <span className="text-sm text-gray-400 line-through">{displayOriginalPrice}</span>
            )}
          </div>
        )}
        {buttonText && buttonUrl && (
          <a
            href={buttonUrl}
            className="mt-4 block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {buttonText}
          </a>
        )}
      </div>
    </div>
  );
}
