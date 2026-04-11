import { registerBlock } from '../registry';

registerBlock({
  type: 'DividerBlock',
  name: 'Divider',
  category: 'Layout',
  icon: '➖',
  description: 'Horizontal dividing line with configurable styles. Visually separates content sections.',
  fields: {
    Style: { type: 'select', title: 'Style', defaultValue: 'solid', options: [
      { value: 'solid', label: 'Solid' },
      { value: 'dashed', label: 'Dashed' },
      { value: 'dotted', label: 'Dotted' },
      { value: 'double', label: 'Double' },
      { value: 'none', label: 'None' },
    ]},
    Color: { type: 'color', title: 'Color', defaultValue: '#e5e7eb' },
    Thickness: { type: 'string', title: 'Thickness', placeholder: 'e.g. 1px, 2px', defaultValue: '1px' },
    Width: { type: 'string', title: 'Width', placeholder: 'e.g. 100%, 80%, 600px', defaultValue: '100%' },
    PaddingY: { type: 'string', title: 'Vertical Padding', placeholder: 'e.g. 2rem, 32px', defaultValue: '2rem' },
  },
});
