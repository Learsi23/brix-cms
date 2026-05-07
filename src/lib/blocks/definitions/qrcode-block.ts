import { registerBlock } from '../registry';

registerBlock({
  type: 'QRCodeBlock',
  name: 'QR Code',
  category: 'Media',
  icon: 'fa-qrcode',
  description: 'QR code generator. Perfect for linking to URLs, payments, WiFi access, or contact info.',
  fieldsArray: [
    { name: 'content', type: 'text', title: 'QR Content', placeholder: 'https://example.com, WiFi network, payment link' },
    { name: 'contentType', type: 'select', title: 'Content Type', options: [{ label: 'URL/Link', value: 'url' }, { label: 'WiFi Network', value: 'wifi' }, { label: 'Contact (vCard)', value: 'vcard' }, { label: 'Email Address', value: 'email' }, { label: 'Phone Number', value: 'phone' }, { label: 'Plain Text', value: 'text' }], defaultValue: 'url' },
    { name: 'size', type: 'text', title: 'QR Size (px)', placeholder: '200', defaultValue: '200' },
    { name: 'foregroundColor', type: 'color', title: 'Foreground Color', defaultValue: '#000000' },
    { name: 'backgroundColor', type: 'color', title: 'Background Color', defaultValue: '#ffffff' },
    { name: 'style', type: 'select', title: 'QR Style', options: [{ label: 'Square', value: 'square' }, { label: 'Rounded', value: 'rounded' }, { label: 'Dots', value: 'dots' }], defaultValue: 'square' },
    { name: 'includeLabel', type: 'select', title: 'Include Label Below', options: [{ label: 'No', value: 'false' }, { label: 'Yes', value: 'true' }], defaultValue: 'false' },
    { name: 'label', type: 'text', title: 'Label Text', placeholder: 'e.g. Scan to visit' },
    { name: 'labelColor', type: 'color', title: 'Label Color', defaultValue: '#000000' },
    { name: 'borderRadius', type: 'text', title: 'Border Radius', placeholder: '8px', defaultValue: '8px' },
    { name: 'borderWidth', type: 'text', title: 'Border Width (px)', placeholder: '0', defaultValue: '0' },
    { name: 'align', type: 'select', title: 'Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }], defaultValue: 'center' },
    { name: 'sectionId', type: 'text', title: 'Section ID (anchor)' },
  ],
});