import { registerBlock } from '../registry';

registerBlock({
  type: 'ButtonLinkBlock',
  name: 'Button Link',
  category: 'Content',
  icon: '🔗',
  description: 'Styled button or link. Simple CTA, internal or external link. Multiple color and size styles available.',
  fields: {
    Text: { type: 'string', title: 'Button Text', placeholder: 'Click here' },
    Url: { type: 'url', title: 'Link (URL)', placeholder: 'https://...' },
    Color: { type: 'color', title: 'Background Color', defaultValue: '#10b981' },
    HoverColor: { type: 'color', title: 'Hover Color', defaultValue: '#059669' },
    TextColor: { type: 'color', title: 'Text Color', defaultValue: '#ffffff' },
    BorderRadius: { type: 'string', title: 'Border Radius', placeholder: 'Ex: 8px, 9999px', defaultValue: '8px' },
    Border: { type: 'string', title: 'Border', placeholder: "Ex: 2px solid #000" },
    Width: { type: 'string', title: 'Width', placeholder: 'Ex: 200px, auto, 100%', defaultValue: 'auto' },
    Padding: { type: 'string', title: 'Padding', placeholder: 'Ex: 12px 24px', defaultValue: '12px 24px' },
    ButtonPosition: {
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
