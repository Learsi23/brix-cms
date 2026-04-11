import { registerBlock } from '../registry';

registerBlock({
  type: 'TabItemBlock',
  name: 'Tab Item',
  category: 'Interactive',
  icon: '📑',
  description: 'A single tab with label and HTML content. Add inside TabsBlock.',
  fields: {
    TabLabel: { type: 'string', title: 'Tab Label' },
    TabIcon: { type: 'string', title: 'Tab Icon (FontAwesome class)', placeholder: 'fas fa-star' },
    Content: { type: 'textarea', title: 'Content (HTML)' },
  },
});
