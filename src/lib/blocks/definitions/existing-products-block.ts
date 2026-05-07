import { registerBlock } from '../registry';

registerBlock({
  type: 'ExistingProductsBlock',
  name: 'Product Showcase',
  category: 'Commerce',
  icon: 'fa-store',
  description: 'Displays existing products from the catalogue. Filter by IDs or category, choose grid/list/carousel layout, with add-to-cart support.',
  fieldsArray: [
    { name: 'title', type: 'text', title: 'Section Title', placeholder: 'Our Products' },
    { name: 'titleColor', type: 'color', title: 'Title Color', defaultValue: '#111827' },
    { name: 'subtitle', type: 'text', title: 'Subtitle', placeholder: 'Discover our collection' },
    { name: 'subtitleColor', type: 'color', title: 'Subtitle Color', defaultValue: '#6b7280' },
    { name: 'productIds', type: 'richtext', title: 'Product IDs (comma-separated)', placeholder: 'id1, id2, id3 — leave blank to show all' },
    { name: 'category', type: 'text', title: 'Filter by Category', placeholder: 'e.g. Electronics' },
    { name: 'maxProducts', type: 'text', title: 'Max Products to Show', defaultValue: '12' },
    { name: 'sortBy', type: 'select', title: 'Sort By', options: [{ label: 'Name A→Z', value: 'name' }, { label: 'Price Low→High', value: 'price-asc' }, { label: 'Price High→Low', value: 'price-desc' }, { label: 'In Stock First', value: 'stock' }, { label: 'Highest Rated', value: 'rating' }], defaultValue: 'name' },
    { name: 'displayMode', type: 'select', title: 'Display Mode', options: [{ label: 'Grid', value: 'grid' }, { label: 'List', value: 'list' }, { label: 'Carousel', value: 'carousel' }], defaultValue: 'grid' },
    { name: 'columns', type: 'text', title: 'Grid Columns (2–4)', defaultValue: '3' },
    { name: 'carouselCards', type: 'text', title: 'Carousel Visible Cards', defaultValue: '3' },
    { name: 'autoPlay', type: 'select', title: 'Carousel Auto-play', options: [{ label: 'No', value: 'false' }, { label: 'Yes', value: 'true' }], defaultValue: 'false' },
    { name: 'backgroundColor', type: 'color', title: 'Background Color', defaultValue: 'transparent' },
    { name: 'paddingY', type: 'text', title: 'Vertical Padding', defaultValue: '3rem' },
    { name: 'accentColor', type: 'color', title: 'Accent / Badge Color', defaultValue: '#10b981' },
    { name: 'showAddToCart', type: 'select', title: 'Show Add-to-Cart Button', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }], defaultValue: 'true' },
    { name: 'cartButtonText', type: 'text', title: 'Add-to-Cart Text', defaultValue: 'Add to Cart' },
    { name: 'cartButtonColor', type: 'color', title: 'Cart Button Color', defaultValue: '#10b981' },
  ],
});