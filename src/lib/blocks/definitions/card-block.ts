import { registerBlock } from '../registry';

// Universal Hero Card — equivalent to CardBlock.cs in .NET
registerBlock({
  type: 'CardBlock',
  name: 'Universal Hero Card',
  category: 'Content',
  icon: '🃏',
  description: 'Tarjeta visual con imagen, título, descripción y botón. Soporta layout vertical, horizontal y overlay. Ideal para grids de servicios o features.',
  fields: {
    // Content
    Title: { type: 'string', title: 'Main Title', placeholder: 'e.g. Our Services' },
    TitleColor: { type: 'color', title: 'Title Color', defaultValue: '#1f2937' },
    TitleSize: { type: 'string', title: 'Title Size', placeholder: 'e.g. 1.5rem or 24px', defaultValue: '1.5rem' },
    Badge: { type: 'string', title: 'Subtitle / Badge' },
    BadgeColor: { type: 'color', title: 'Badge Color', defaultValue: '#4b5563' },
    BadgeSize: { type: 'string', title: 'Badge Size', defaultValue: '0.875rem' },
    Description: { type: 'textarea', title: 'Detailed Description' },
    DescriptionColor: { type: 'color', title: 'Description Color', defaultValue: '#4b5563' },
    DescriptionSize: { type: 'string', title: 'Description Size', defaultValue: '0.875rem' },

    // Image & Icon
    Image: { type: 'image', title: 'Main Image' },
    ImageHeight: { type: 'string', title: 'Image Height', placeholder: 'e.g. 250px or 300px', defaultValue: '250px' },
    IconClass: { type: 'string', title: 'Icon (FontAwesome)', placeholder: 'fas fa-rocket' },

    // Action
    TargetUrl: { type: 'url', title: 'Target URL' },
    ButtonText: { type: 'string', title: 'Button Text', defaultValue: 'Learn more' },
    AccentColor: { type: 'color', title: 'Button Background Color', defaultValue: '#3b82f6' },
    ButtonTextColor: { type: 'color', title: 'Button Text Color', defaultValue: '#ffffff' },
    HoverColor: { type: 'color', title: 'Button Hover Color' },
    BorderRadius: { type: 'string', title: 'Border Radius', placeholder: 'e.g. 8px, 1rem' },
    Border: { type: 'string', title: 'Button Border', placeholder: "e.g. 2px solid #000" },
    Padding: { type: 'string', title: 'Padding', placeholder: 'e.g. 1rem, 2rem' },
    TextColor: { type: 'color', title: 'Text Color' },
    ButtonPosition: { type: 'string', title: 'Button Position', placeholder: 'left, center, right' },

    // Layout
    LayoutType: {
      type: 'select', title: 'Layout',
      options: [
        { value: 'vertical', label: 'Vertical' },
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'overlay', label: 'Overlay' },
      ],
      defaultValue: 'vertical',
    },
    UseGlassmorphism: {
      type: 'select', title: 'Glass Effect?',
      options: [
        { value: 'No', label: 'No' },
        { value: 'Yes', label: 'Yes' },
      ],
      defaultValue: 'No',
    },
    CardBgColor: { type: 'color', title: 'Card Background Color', defaultValue: '#ffffff' },
  },
});
