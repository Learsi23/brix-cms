import { registerBlock } from '../registry';

registerBlock({
  type: 'TextWithButtonBlock',
  name: 'Text with Button',
  category: 'Content',
  icon: '🔤',
  description: 'Combination of a text block with an integrated action button. Useful for sections with inline CTA.',
  fields: {
    Title: { type: 'string', title: 'Title' },
    TitleColor: { type: 'color', title: 'Title Color', defaultValue: '#000000' },
    TitleSize: { type: 'string', title: 'Title Size', placeholder: 'Ex: 24px' },
    Subtitle: { type: 'string', title: 'Subtitle' },
    SubtitleColor: { type: 'color', title: 'Subtitle Color', defaultValue: '#000000' },
    SubtitleSize: { type: 'string', title: 'Subtitle Size', placeholder: 'Ex: 20px' },
    Description: { type: 'textarea', title: 'Description' },
    DescriptionColor: { type: 'color', title: 'Description Color', defaultValue: '#333333' },
    DescriptionSize: { type: 'string', title: 'Description Size', placeholder: 'Ex: 16px' },
    ButtonText: { type: 'string', title: 'Button Text' },
    ButtonUrl: { type: 'url', title: 'Button Link' },
    ButtonColor: { type: 'color', title: 'Button Color', defaultValue: '#10b981' },
    ButtonHoverColor: { type: 'color', title: 'Button Hover Color', defaultValue: '#059669' },
    ButtonBorderRadius: { type: 'string', title: 'Button Border Radius', placeholder: 'Ex: 10px', defaultValue: '8px' },
    ButtonBorder: { type: 'string', title: 'Button Border', placeholder: 'Ex: 2px solid #000' },
    ButtonWidth: { type: 'string', title: 'Button Width', defaultValue: 'auto' },
    ButtonPadding: { type: 'string', title: 'Button Padding', placeholder: 'Ex: 10px 20px', defaultValue: '12px 24px' },
    ButtonTextColor: { type: 'color', title: 'Button Text Color', defaultValue: '#ffffff' },
    ButtonPosition: {
      type: 'select', title: 'Button Position',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'left',
    },
  },
});
