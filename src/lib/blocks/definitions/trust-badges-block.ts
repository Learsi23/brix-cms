import { registerBlock } from '../registry';

registerBlock({
  type: 'TrustBadgesBlock',
  name: 'Trust Badges',
  category: 'Commerce',
  icon: 'fa-shield-halved',
  description: 'Row of e-commerce trust badges: free shipping, secure payment, easy returns, etc.',
  fieldsArray: [
    { name: 'badge1Icon', type: 'text', title: 'Badge 1 — Icon (FontAwesome class)', defaultValue: 'fa-truck' },
    { name: 'badge1Label', type: 'text', title: 'Badge 1 — Label', defaultValue: 'Free Shipping' },
    { name: 'badge1Sublabel', type: 'text', title: 'Badge 1 — Sub-label', defaultValue: 'On orders over €50' },
    { name: 'badge2Icon', type: 'text', title: 'Badge 2 — Icon', defaultValue: 'fa-rotate-left' },
    { name: 'badge2Label', type: 'text', title: 'Badge 2 — Label', defaultValue: 'Easy Returns' },
    { name: 'badge2Sublabel', type: 'text', title: 'Badge 2 — Sub-label', defaultValue: '30-day return policy' },
    { name: 'badge3Icon', type: 'text', title: 'Badge 3 — Icon', defaultValue: 'fa-lock' },
    { name: 'badge3Label', type: 'text', title: 'Badge 3 — Label', defaultValue: 'Secure Payment' },
    { name: 'badge3Sublabel', type: 'text', title: 'Badge 3 — Sub-label', defaultValue: 'SSL encrypted checkout' },
    { name: 'badge4Icon', type: 'text', title: 'Badge 4 — Icon', defaultValue: 'fa-headset' },
    { name: 'badge4Label', type: 'text', title: 'Badge 4 — Label', defaultValue: '24/7 Support' },
    { name: 'badge4Sublabel', type: 'text', title: 'Badge 4 — Sub-label', defaultValue: "We're here to help" },
    { name: 'iconColor', type: 'color', title: 'Icon Color', defaultValue: '#111827' },
    { name: 'backgroundColor', type: 'color', title: 'Background Color', defaultValue: '#f9fafb' },
    { name: 'showBorder', type: 'boolean', title: 'Show Border', defaultValue: true },
  ],
});