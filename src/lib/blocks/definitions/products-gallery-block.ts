import { registerBlock } from '../registry';

registerBlock({
  type: 'ProductsGalleryBlock',
  name: 'Products Gallery',
  category: 'Media',
  icon: '🛍️',
  description: 'Product image gallery in a grid or carousel. Similar to GalleryBlock but optimized for displaying a visual catalog.',
  isGroup: true,
  fields: {
    CategoryId: { type: 'category-select', title: 'Filter by Category', description: 'If you select a category, it automatically loads its products. Otherwise, use child blocks.' },
    Title: { type: 'string', title: 'Gallery Title', placeholder: 'Optional title' },
    TitleColor: { type: 'color', title: 'Title Color', defaultValue: '#000000' },
    TitleSize: { type: 'string', title: 'Title Size', placeholder: 'Ex: 2rem, 24px', defaultValue: '2rem' },
    CardsPerView: { type: 'number', title: 'Cards per View', placeholder: '3', defaultValue: '3' },
    SlideBy: { type: 'number', title: 'Slide by', placeholder: '1', defaultValue: '1' },
    AutoPlay: { type: 'bool', title: 'Auto Play', defaultValue: 'false' },
    AutoPlayInterval: { type: 'number', title: 'Auto Play Interval (ms)', placeholder: '3000', defaultValue: '3000' },
    ShowArrows: { type: 'bool', title: 'Show Arrows', defaultValue: 'true' },
    ShowDots: { type: 'bool', title: 'Show Dots', defaultValue: 'true' },
    InfiniteLoop: { type: 'bool', title: 'Infinite Loop', defaultValue: 'true' },
    Gap: { type: 'string', title: 'Card spacing', placeholder: '16px', defaultValue: '16px' },
    BackgroundColor: { type: 'color', title: 'Background Color', defaultValue: 'transparent' },
    Padding: { type: 'string', title: 'Padding', placeholder: '20px', defaultValue: '20px' },
    BorderRadius: { type: 'string', title: 'Border Radius', placeholder: '8px', defaultValue: '0px' },
  },
});
