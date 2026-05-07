import { registerBlock } from '../registry';

registerBlock({
  type: 'NewsletterBlock',
  name: 'Newsletter Signup',
  category: 'Interactive',
  icon: 'fa-envelope-open-text',
  description: 'Email subscription form with a title, subtitle, and customisable call-to-action button.',
  fieldsArray: [
    { name: 'heading', type: 'text', title: 'Heading', placeholder: 'Subscribe to our newsletter', defaultValue: 'Subscribe to our newsletter' },
    { name: 'subtitle', type: 'text', title: 'Subtitle', placeholder: 'Get the latest news and offers directly in your inbox.', defaultValue: 'Get the latest news and offers directly in your inbox.' },
    { name: 'buttonLabel', type: 'text', title: 'Button Label', placeholder: 'Subscribe', defaultValue: 'Subscribe' },
    { name: 'successMessage', type: 'text', title: 'Success Message', placeholder: 'Thanks for subscribing!', defaultValue: 'Thanks for subscribing!' },
    { name: 'backgroundColor', type: 'color', title: 'Background Color', defaultValue: '#f9fafb' },
    { name: 'buttonColor', type: 'color', title: 'Button Color', defaultValue: '#111827' },
    { name: 'buttonTextColor', type: 'color', title: 'Button Text Color', defaultValue: '#ffffff' },
  ],
});