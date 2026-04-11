import { registerBlock } from '../registry';

registerBlock({
  type: 'PricingBlock',
  name: 'Pricing',
  category: 'Content',
  icon: '💰',
  description: 'Pricing table with multiple plans (Basic/Pro/Enterprise), feature list, and CTA button. Add PricingCard blocks inside.',
  isGroup: true,
  fields: {
    Title: { type: 'string', title: 'Title' },
    TitleColor: { type: 'color', title: 'Title Color' },
    Subtitle: { type: 'string', title: 'Subtitle' },
    BackgroundColor: { type: 'color', title: 'Background Color' },
    Currency: { type: 'string', title: 'Currency Symbol', placeholder: '€, $, kr', defaultValue: '€' },
  },
});
