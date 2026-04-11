import { registerBlock } from '../registry';

registerBlock({
  type: 'BannerBlock',
  name: 'Banner / Announcement',
  category: 'Layout',
  icon: '📢',
  description: 'Announcement or notification bar: free shipping, discount, new feature. Can be dismissed.',
  fields: {
    Icon: { type: 'string', title: 'Icon (emoji or fas class)', defaultValue: '🎉' },
    Text: { type: 'string', title: 'Announcement Text', placeholder: 'e.g. Free shipping on orders over €50' },
    LinkText: { type: 'string', title: 'Link Text', placeholder: 'e.g. Learn more' },
    LinkUrl: { type: 'url', title: 'Link URL' },
    BackgroundColor: { type: 'color', title: 'Background Color', defaultValue: '#1f2937' },
    TextColor: { type: 'color', title: 'Text Color', defaultValue: '#ffffff' },
    Closeable: { type: 'bool', title: 'Dismissible', defaultValue: 'true' },
  },
});
