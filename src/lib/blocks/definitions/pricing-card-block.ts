import { registerBlock } from '../registry';

registerBlock({
  type: 'PricingCardBlock',
  name: 'Pricing Card',
  category: 'Content',
  icon: '💳',
  description: 'Individual pricing plan card with feature list and CTA. Add inside PricingBlock.',
  fields: {
    PlanName: { type: 'string', title: 'Plan Name', placeholder: 'Basic, Pro, Enterprise' },
    Price: { type: 'string', title: 'Price', placeholder: '29' },
    Period: { type: 'string', title: 'Period', defaultValue: '/month' },
    Description: { type: 'string', title: 'Short Description' },
    Features: { type: 'textarea', title: 'Features (one per line)' },
    ButtonText: { type: 'string', title: 'Button Text', defaultValue: 'Get started' },
    ButtonUrl: { type: 'url', title: 'Button URL', defaultValue: '#' },
    AccentColor: { type: 'color', title: 'Accent Color', defaultValue: '#3b82f6' },
    CardBgColor: { type: 'color', title: 'Card Background', defaultValue: '#ffffff' },
    IsPopular: { type: 'bool', title: 'Mark as Popular', defaultValue: 'false' },
    PopularLabel: { type: 'string', title: 'Popular Badge Label', defaultValue: 'Most popular' },
  },
});
