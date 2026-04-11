import { registerBlock } from '../registry';

registerBlock({
  type: 'ExistingProductsBlock',
  name: 'Existing Products',
  category: 'Ecommerce',
  icon: '🗃️',
  description: 'Display products from your catalog automatically (grid, list or carousel). Configure sorting, display and filters.',
  fields: {
    Title: { type: 'string', title: 'Title' },
    TitleColor: { type: 'color', title: 'Title Color', defaultValue: '#111827' },
    Subtitle: { type: 'string', title: 'Subtitle' },
    BackgroundColor: { type: 'color', title: 'Background Color', defaultValue: '#ffffff' },
    PaddingY: { type: 'string', title: 'Vertical Padding', defaultValue: '3rem' },
    MaxItemsToShow: { type: 'string', title: 'Max Products to Show', defaultValue: '8' },
    SortBy: { type: 'select', title: 'Sort By', defaultValue: 'newest', options: [
      { value: 'newest', label: 'Newest first' },
      { value: 'price-asc', label: 'Price: Low to High' },
      { value: 'price-desc', label: 'Price: High to Low' },
      { value: 'name-asc', label: 'Name A–Z' },
    ]},
    DisplayStyle: { type: 'select', title: 'Display Style', defaultValue: 'grid', options: [
      { value: 'grid', label: 'Grid' },
      { value: 'list', label: 'List' },
      { value: 'carousel', label: 'Carousel' },
    ]},
    Columns: { type: 'string', title: 'Columns (grid)', defaultValue: '4' },
    ShowPrice: { type: 'bool', title: 'Show Price', defaultValue: 'true' },
    ShowDiscount: { type: 'bool', title: 'Show Discount Badge', defaultValue: 'true' },
    ShowStock: { type: 'bool', title: 'Show Stock', defaultValue: 'false' },
    ShowRating: { type: 'bool', title: 'Show Rating', defaultValue: 'false' },
    ShowBuyButton: { type: 'bool', title: 'Show Buy Button', defaultValue: 'true' },
    ButtonText: { type: 'string', title: 'Button Text', defaultValue: 'Add to cart' },
    CardBgColor: { type: 'color', title: 'Card Background', defaultValue: '#ffffff' },
    FilterCategory: { type: 'string', title: 'Filter by Category (exact name)', placeholder: 'e.g. Manga' },
  },
});
