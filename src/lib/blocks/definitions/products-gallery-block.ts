import { registerBlock } from '../registry';

registerBlock({
  type: 'ProductsGalleryBlock',
  name: 'Products Carousel',
  category: 'Commerce',
  icon: 'fa-carousel',
  description: 'Sliding carousel container for ProductCard blocks. Drag ProductCard children inside to populate.',
  isGroup: true,
  fieldsArray: [
    { name: 'title', type: 'text', title: 'Section Title', placeholder: 'Featured Products' },
    { name: 'titleColor', type: 'color', title: 'Title Color', defaultValue: '#111827' },
    { name: 'backgroundColor', type: 'color', title: 'Background Color', defaultValue: 'transparent' },
    { name: 'paddingY', type: 'text', title: 'Vertical Padding', defaultValue: '3rem' },
    { name: 'cardsPerView', type: 'text', title: 'Visible Cards', defaultValue: '3' },
    { name: 'gap', type: 'text', title: 'Gap Between Cards (px)', defaultValue: '24' },
    { name: 'showArrows', type: 'select', title: 'Show Navigation Arrows', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }], defaultValue: 'true' },
    { name: 'showDots', type: 'select', title: 'Show Dot Indicators', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }], defaultValue: 'true' },
    { name: 'autoPlay', type: 'select', title: 'Auto-play', options: [{ label: 'No', value: 'false' }, { label: 'Yes', value: 'true' }], defaultValue: 'false' },
    { name: 'autoPlayInterval', type: 'text', title: 'Auto-play Interval (ms)', defaultValue: '3000' },
  ],
});