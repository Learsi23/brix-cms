import { registerBlock } from '../registry';

registerBlock({
  type: 'ContactFormBlock',
  name: 'Contact Form',
  category: 'Email',
  icon: '📧',
  description: 'Complete contact form with name, email and message. Sends email notifications to the administrator.',
  fields: {
    Title: { type: 'string', title: 'Form Title' },
    RecipientEmail: { type: 'string', title: 'Recipient Email', placeholder: 'admin@yoursite.com' },
    Text: { type: 'string', title: 'Button Text', defaultValue: 'Send Message' },
    Url: { type: 'url', title: 'Link (URL)', placeholder: 'Destination URL' },
    Color: { type: 'color', title: 'Button Color' },
    HoverColor: { type: 'color', title: 'Button Hover Color' },
    BorderRadius: { type: 'string', title: 'Border Radius', placeholder: 'e.g. fas fa-font' },
    Border: { type: 'string', title: 'Button Border', placeholder: 'e.g. 2px solid #000' },
    Width: { type: 'string', title: 'Button Width' },
    Padding: { type: 'string', title: 'Button Padding', placeholder: 'e.g. fas fa-font' },
    TextColor: { type: 'color', title: 'Button Text Color' },
    ButtonPosition: { type: 'select', title: 'Button Position', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }], defaultValue: 'center' },
  },
});
