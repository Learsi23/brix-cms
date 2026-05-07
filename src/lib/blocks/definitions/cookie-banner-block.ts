import { registerBlock } from '../registry';

registerBlock({
  type: 'CookieBannerBlock',
  name: 'Cookie Banner',
  category: 'Interactive',
  icon: 'fa-cookie',
  description: 'GDPR cookie consent banner. Display privacy notice and consent buttons.',
  fieldsArray: [
    { name: 'position', type: 'select', title: 'Position', options: [{ label: 'Bottom', value: 'bottom' }, { label: 'Top', value: 'top' }, { label: 'Bottom Left', value: 'bottom-left' }, { label: 'Bottom Right', value: 'bottom-right' }], defaultValue: 'bottom' },
    { name: 'backgroundColor', type: 'color', title: 'Background Color', defaultValue: '#1f2937' },
    { name: 'textColor', type: 'color', title: 'Text Color', defaultValue: '#ffffff' },
    { name: 'title', type: 'text', title: 'Title', defaultValue: 'We use cookies' },
    { name: 'message', type: 'richtext', title: 'Message', defaultValue: 'We use cookies to enhance your browsing experience and analyze our traffic.' },
    { name: 'privacyPolicyUrl', type: 'url', title: 'Privacy Policy URL', placeholder: '/privacy-policy' },
    { name: 'acceptButtonText', type: 'text', title: 'Accept Button Text', defaultValue: 'Accept All' },
    { name: 'declineButtonText', type: 'text', title: 'Decline Button Text', defaultValue: 'Decline' },
    { name: 'acceptButtonColor', type: 'color', title: 'Accept Button Color', defaultValue: '#10b981' },
    { name: 'declineButtonColor', type: 'color', title: 'Decline Button Color', defaultValue: '#6b7280' },
    { name: 'buttonTextColor', type: 'color', title: 'Button Text Color', defaultValue: '#ffffff' },
    { name: 'borderRadius', type: 'text', title: 'Border Radius', placeholder: '8px', defaultValue: '8px' },
    { name: 'width', type: 'text', title: 'Width', placeholder: '100%', defaultValue: '100%' },
    { name: 'padding', type: 'text', title: 'Padding', placeholder: '16px', defaultValue: '16px' },
    { name: 'zIndex', type: 'text', title: 'Z-Index', placeholder: '9999', defaultValue: '9999' },
  ],
});