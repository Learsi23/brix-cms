import { registerBlock } from '../registry';

// Gallery container block — can contain ImageBlocks as children
registerBlock({
  type: 'GalleryBlock',
  name: 'Gallery',
  category: 'Media',
  icon: '🖼️',
  description: 'Image gallery in a responsive grid. Select multiple images from the media library.',
  isGroup: true,
  fields: {
    Title: { type: 'string', title: 'Gallery Title', placeholder: 'Optional title' },
    TitleColor: { type: 'color', title: 'Title Color', defaultValue: '#000000' },
    TitleSize: { type: 'string', title: 'Title Size', placeholder: 'Ex: 24px, 2rem, text-3xl' },
    LayoutType: {
      type: 'select', title: 'Layout Type',
      options: [
        { value: 'carousel', label: 'Carousel' },
        { value: 'grid', label: 'Grid' },
        { value: 'masonry', label: 'Masonry' },
      ],
      defaultValue: 'carousel',
    },
    AutoPlay: { type: 'bool', title: 'Auto Play', defaultValue: 'true' },
    AutoPlayInterval: { type: 'number', title: 'Auto Play Interval (ms)', placeholder: '3000', defaultValue: '3000' },
    ShowArrows: { type: 'bool', title: 'Show Arrows', defaultValue: 'true' },
    ShowDots: { type: 'bool', title: 'Show Dots', defaultValue: 'true' },
    InfiniteLoop: { type: 'bool', title: 'Infinite Loop', defaultValue: 'true' },
    ItemsPerView: { type: 'number', title: 'Items per View', placeholder: '3', defaultValue: '3' },
    Gap: { type: 'string', title: 'Item spacing', placeholder: '16px', defaultValue: '16px' },
    ItemHeight: { type: 'string', title: 'Item height', placeholder: '300px', defaultValue: '300px' },
    BackgroundColor: { type: 'color', title: 'Background Color', defaultValue: 'transparent' },
    Padding: { type: 'string', title: 'Padding', placeholder: '20px', defaultValue: '20px' },
    BorderRadius: { type: 'string', title: 'Border Radius', placeholder: '8px', defaultValue: '0px' },
  },
});
