import { registerBlock } from '../registry';

// Icon Card — equivalent to IconCardBlock.cs in .NET
registerBlock({
  type: 'IconCardBlock',
  name: 'Icon Card',
  category: 'Content',
  icon: '🪪',
  description: 'Card with large icon, title and description. Perfect for listing features, services or benefits in a 3-4 column grid.',
  fields: {
    // Container
    BackgroundColor: { type: 'color', title: 'Background Color' },
    BorderColor: { type: 'color', title: 'Border Color' },
    BorderRadius: { type: 'string', title: 'Border Radius', placeholder: 'e.g. 12px or 1rem' },
    BorderWidth: { type: 'string', title: 'Border Width', placeholder: 'e.g. 1px or 2px' },
    Padding: { type: 'string', title: 'Padding', placeholder: 'e.g. 1.5rem or 24px' },
    Shadow: { type: 'string', title: 'Shadow', placeholder: 'e.g. 0 4px 20px rgba(0,0,0,0.1)' },
    // Layout
    IconPosition: { type: 'select', title: 'Icon Position', options: [{ value: 'top', label: 'Top' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], defaultValue: 'left' },
    TextAlign: { type: 'select', title: 'Text Alignment', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }], defaultValue: 'left' },
    // Left/Top Icon (image)
    LeftIcon: { type: 'image', title: 'Left Icon (Image)' },
    LeftIconSize: { type: 'string', title: 'Left Icon Size', placeholder: 'e.g. 48px' },
    // Left/Top Icon (FontAwesome)
    LeftIconClass: { type: 'string', title: 'Left Icon (CSS Class)', placeholder: 'e.g. fas fa-rocket' },
    LeftIconColor: { type: 'color', title: 'Left Icon Color' },
    LeftIconFaSize: { type: 'string', title: 'Left Icon FontAwesome Size', placeholder: 'e.g. 2rem', defaultValue: '2rem' },
    // Right Icon (decorative)
    RightIcon: { type: 'image', title: 'Right Icon (Image)' },
    RightIconSize: { type: 'string', title: 'Right Icon Size', placeholder: 'e.g. 32px' },
    RightIconClass: { type: 'string', title: 'Right Icon (CSS Class)', placeholder: 'e.g. fas fa-arrow-right' },
    RightIconColor: { type: 'color', title: 'Right Icon Color' },
    // Title
    Title: { type: 'string', title: 'Title', placeholder: 'Enter title' },
    TitleColor: { type: 'color', title: 'Title Color' },
    TitleSize: { type: 'string', title: 'Title Size', placeholder: 'e.g. 1.25rem' },
    // Subtitle
    Subtitle: { type: 'string', title: 'Subtitle' },
    SubtitleColor: { type: 'color', title: 'Subtitle Color' },
    SubtitleSize: { type: 'string', title: 'Subtitle Size', placeholder: 'e.g. 1rem' },
    // Text
    Text: { type: 'textarea', title: 'Text', placeholder: 'Enter content' },
    TextColor: { type: 'color', title: 'Text Color' },
    TextSize: { type: 'string', title: 'Text Size', placeholder: 'e.g. 0.95rem' },
    // Markdown
    MarkDown: { type: 'textarea', title: 'Markdown Content' },
    MarkDownColor: { type: 'color', title: 'Markdown Color' },
    // Link (CTA)
    LinkUrl: { type: 'url', title: 'Link URL', placeholder: 'e.g. /servicios or https://...' },
    LinkText: { type: 'string', title: 'Button Text', placeholder: 'e.g. Ver más' },
    LinkBgColor: { type: 'color', title: 'Button Background Color' },
    LinkTextColor: { type: 'color', title: 'Button Text Color' },
    LinkNewTab: { type: 'bool', title: 'Open in new tab', defaultValue: 'false' },
  },
});
