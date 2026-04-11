'use client';

// ====================================================================
// BLOCK FORM — EDEN CMS
// ====================================================================
// Dynamically renders the edit form for a block
// based on field definitions from the block registry.
// Equivalent to the Razor views of the block editor in .NET
// ====================================================================

import { useEffect, useState } from 'react';
import type { BlockDefinition, FieldDefinition, BlockData } from '@/lib/blocks/types';
import MediaPickerModal from './MediaPickerModal';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
  categoryId?: string | null;
}

function ProductSelectInput({ value, onChange, initialCategoryId = '' }: { value: string; onChange: (val: string) => void; initialCategoryId?: string }) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [filterCat, setFilterCat] = useState(initialCategoryId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/product').then(r => r.ok ? r.json() : []),
      fetch('/api/category').then(r => r.ok ? r.json() : []),
    ])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-xs text-slate-400">Loading products...</p>;

  if (products.length === 0) return (
    <p className="text-xs text-amber-600">
      No products found. <a href="/admin/products" target="_blank" className="underline">Create products →</a>
    </p>
  );

  const filtered = filterCat ? products.filter(p => p.categoryId === filterCat) : products;

  return (
    <div className="space-y-2">
      {categories.length > 0 && (
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs focus:outline-none focus:border-emerald-500"
        >
          <option value="">🏷️ All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-emerald-500"
      >
        <option value="">— Select a product —</option>
        {filtered.map(p => (
          <option key={p.id} value={p.id}>
            {p.name} — ${p.price.toFixed(2)}
          </option>
        ))}
      </select>
    </div>
  );
}

function CategorySelectInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/category')
      .then(r => r.ok ? r.json() : [])
      .then((data: CategoryOption[]) => { setCategories(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-xs text-slate-400">Loading categories...</p>;

  if (categories.length === 0) return (
    <p className="text-xs text-amber-600">
      No categories found. <a href="/admin/products" target="_blank" className="underline">Create categories →</a>
    </p>
  );

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-emerald-500"
    >
      <option value="">— All categories —</option>
      {categories.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}

interface BlockFormProps {
  definition: BlockDefinition;
  data: BlockData;
  onChange: (data: BlockData) => void;
}

function FieldInput({
  field,
  value,
  onChange,
  blockData,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (val: string) => void;
  blockData?: BlockData;
}) {
  const base = 'w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors';

  switch (field.type) {
    case 'string':
    case 'url':
      return (
        <input
          type={field.type === 'url' ? 'url' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={base}
        />
      );

    case 'textarea':
      return (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={`${base} resize-y font-mono text-xs`}
        />
      );

    case 'markdown':
      return (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || '# Title\n\nWrite here in **Markdown**...'}
          rows={8}
          className={`${base} resize-y font-mono text-xs`}
        />
      );

    case 'color':
      return (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value || '#000000'}
            onChange={e => onChange(e.target.value)}
            className="h-9 w-14 rounded border border-slate-200 cursor-pointer p-0.5 bg-white"
          />
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="#000000 o transparent"
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
      );

    case 'image': {
      const [showPicker, setShowPicker] = useState(false);
      return (
        <div className="space-y-2">
          {value && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="preview" className="h-24 rounded-lg border border-slate-200 object-cover" />
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="/uploads/image.jpg"
              className={`${base} font-mono text-xs`}
            />
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="shrink-0 px-3 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"
            >
              📁 Select
            </button>
          </div>
          {showPicker && (
            <MediaPickerModal
              onSelect={onChange}
              onClose={() => setShowPicker(false)}
            />
          )}
        </div>
      );
    }

    case 'select':
      return (
        <select value={value} onChange={e => onChange(e.target.value)} className={base}>
          {field.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case 'bool':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={e => onChange(e.target.checked ? 'true' : 'false')}
            className="w-4 h-4 rounded accent-emerald-600"
          />
          <span className="text-sm text-slate-600">{field.description || 'Enabled'}</span>
        </label>
      );

    case 'number':
      return (
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={base}
        />
      );

    case 'product-select':
      return <ProductSelectInput value={value} onChange={onChange} initialCategoryId={blockData?.['CategoryId']?.Value ?? ''} />;

    case 'category-select':
      return <CategorySelectInput value={value} onChange={onChange} />;

    default:
      return null;
  }
}

export default function BlockForm({ definition, data, onChange }: BlockFormProps) {
  function handleFieldChange(fieldName: string, val: string) {
    onChange({
      ...data,
      [fieldName]: { ...(data[fieldName] ?? {}), Value: val },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <span className="text-lg">{definition.icon}</span>
        <h3 className="font-bold text-slate-800 text-sm">{definition.name}</h3>
        <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{definition.category}</span>
      </div>

      {Object.entries(definition.fields).map(([fieldName, field]) => (
        <div key={fieldName} className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {field.title}
          </label>
          {field.description && (
            <p className="text-xs text-slate-400">{field.description}</p>
          )}
          <FieldInput
            field={field}
            value={data[fieldName]?.Value ?? field.defaultValue ?? ''}
            onChange={val => handleFieldChange(fieldName, val)}
            blockData={data}
          />
        </div>
      ))}
    </div>
  );
}
