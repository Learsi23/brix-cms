import { registerBlock } from '../registry';

registerBlock({
  type: 'LogoStripBlock',
  name: 'Logos / Partners',
  category: 'Content',
  icon: '🤝',
  description: 'Horizontal strip of client or partner logos. Displays multiple images in a row, ideal for social proof.',
  fields: {
    Heading: { type: 'string', title: 'Heading Text', placeholder: 'e.g. Companies that trust us' },
    HeadingColor: { type: 'color', title: 'Heading Color', defaultValue: '#9ca3af' },
    Logo1: { type: 'image', title: 'Logo 1' },
    Logo1Url: { type: 'url', title: 'Logo 1 Link (optional)' },
    Logo2: { type: 'image', title: 'Logo 2' },
    Logo2Url: { type: 'url', title: 'Logo 2 Link (optional)' },
    Logo3: { type: 'image', title: 'Logo 3' },
    Logo3Url: { type: 'url', title: 'Logo 3 Link (optional)' },
    Logo4: { type: 'image', title: 'Logo 4' },
    Logo4Url: { type: 'url', title: 'Logo 4 Link (optional)' },
    Logo5: { type: 'image', title: 'Logo 5' },
    Logo5Url: { type: 'url', title: 'Logo 5 Link (optional)' },
    Logo6: { type: 'image', title: 'Logo 6' },
    Logo6Url: { type: 'url', title: 'Logo 6 Link (optional)' },
    LogoHeight: { type: 'string', title: 'Logo Height', placeholder: 'e.g. 40px, 50px', defaultValue: '40px' },
    Grayscale: { type: 'select', title: 'Grayscale Filter', defaultValue: 'true', options: [
      { value: 'true', label: 'Yes (B&W)' },
      { value: 'false', label: 'No (Color)' },
    ]},
    BackgroundColor: { type: 'color', title: 'Background Color', defaultValue: '#f9fafb' },
    PaddingY: { type: 'string', title: 'Vertical Padding', defaultValue: '2.5rem' },
  },
});
