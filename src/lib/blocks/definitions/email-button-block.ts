import { registerBlock } from '../registry';

registerBlock({
  type: 'EmailButtonBlock',
  name: 'Email Button',
  category: 'Email',
  icon: '✉️',
  description: 'Special button that opens the email client with a predefined recipient. Ideal for quick contact.',
  fields: {
    Text: { type: 'string', title: 'Button Text', placeholder: 'Ex: Contact us' },
    EmailAddress: { type: 'string', title: 'Email', placeholder: 'Ex: info@example.com' },
    Subject: { type: 'string', title: 'Email Subject', placeholder: 'Ex: Inquiry from website' },
    Body: { type: 'textarea', title: 'Email Body', placeholder: 'Ex: Hello, I would like to...' },
    BackgroundColor: { type: 'color', title: 'Button Color', defaultValue: '#3b82f6' },
    HoverColor: { type: 'color', title: 'Hover Color', defaultValue: '#2563eb' },
    TextColor: { type: 'color', title: 'Text Color', defaultValue: '#ffffff' },
    BorderRadius: { type: 'string', title: 'Border Radius', placeholder: 'Ex: 8px, 9999px', defaultValue: '8px' },
    Border: { type: 'string', title: 'Border', placeholder: 'Ex: 2px solid #000' },
    Width: { type: 'string', title: 'Width', placeholder: 'Ex: 200px, 100%', defaultValue: 'auto' },
    Padding: { type: 'string', title: 'Padding', placeholder: 'Ex: 12px 24px', defaultValue: '12px 24px' },
    Position: {
      type: 'select', title: 'Button Position',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'center',
    },
  },
});
