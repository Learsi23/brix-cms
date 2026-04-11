import { registerBlock } from '../registry';

registerBlock({
  type: 'TabsBlock',
  name: 'Tabs',
  category: 'Interactive',
  icon: '📂',
  description: 'Content organized in tabs. Ideal for Description / Specifications / Reviews. Add TabItem blocks inside.',
  isGroup: true,
  fields: {
    BackgroundColor: { type: 'color', title: 'Background Color' },
    TabActiveColor: { type: 'color', title: 'Active Tab Color', defaultValue: '#3b82f6' },
    TabActiveTextColor: { type: 'color', title: 'Active Tab Text Color', defaultValue: '#ffffff' },
    TabInactiveTextColor: { type: 'color', title: 'Inactive Tab Text Color', defaultValue: '#6b7280' },
  },
});
