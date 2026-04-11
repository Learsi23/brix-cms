import { registerBlock } from '../registry';

registerBlock({
  type: 'TextBlock',
  name: 'Text Block',
  category: 'Content',
  icon: '📝',
  description: 'Text block with title, subtitle and body. Controls typography, colors, alignment and margins. Versatile for any section.',
  fields: {
    // Position
    VerticalPosition: {
      type: 'select', title: 'Vertical Position',
      options: [
        { value: 'top', label: 'Top' },
        { value: 'middle', label: 'Middle' },
        { value: 'bottom', label: 'Bottom' },
      ],
      defaultValue: 'top',
    },
    HorizontalPosition: {
      type: 'select', title: 'Horizontal Position',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'left',
    },
    // Margins
    MarginTop: { type: 'string', title: 'Margin Top', placeholder: 'Ex: 0, 10px, 1rem', defaultValue: '0' },
    MarginBottom: { type: 'string', title: 'Margin Bottom', placeholder: 'Ex: 0, 10px, 1rem', defaultValue: '0' },
    MarginLeft: { type: 'string', title: 'Margin Left', placeholder: 'Ex: 0, 10px, 1rem', defaultValue: '0' },
    MarginRight: { type: 'string', title: 'Margin Right', placeholder: 'Ex: 0, 10px, 1rem', defaultValue: '0' },
    // Padding
    PaddingTop: { type: 'string', title: 'Padding Top', placeholder: 'Ex: 0, 10px, 1rem', defaultValue: '0' },
    PaddingBottom: { type: 'string', title: 'Padding Bottom', placeholder: 'Ex: 0, 10px, 1rem', defaultValue: '0' },
    PaddingLeft: { type: 'string', title: 'Padding Left', placeholder: 'Ex: 0, 10px, 1rem', defaultValue: '0' },
    PaddingRight: { type: 'string', title: 'Padding Right', placeholder: 'Ex: 0, 10px, 1rem', defaultValue: '0' },
    // Title
    Title: { type: 'string', title: 'Title', placeholder: 'Write the title' },
    TitleColor: { type: 'color', title: 'Title Color', defaultValue: '#000000' },
    TitleSize: { type: 'string', title: 'Title Size', placeholder: 'Ex: 24px, 2rem, text-4xl' },
    TitleWeight: {
      type: 'select', title: 'Title Weight',
      options: [
        { value: '100', label: 'Thin (100)' },
        { value: '200', label: 'Extra Light (200)' },
        { value: '300', label: 'Light (300)' },
        { value: '400', label: 'Regular (400)' },
        { value: '500', label: 'Medium (500)' },
        { value: '600', label: 'Semi Bold (600)' },
        { value: '700', label: 'Bold (700)' },
        { value: '800', label: 'Extra Bold (800)' },
        { value: '900', label: 'Black (900)' },
      ],
      defaultValue: '700',
    },
    TitleAlignment: {
      type: 'select', title: 'Title Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'left',
    },
    // Subtitle
    Subtitle: { type: 'string', title: 'Subtitle', placeholder: 'Write the subtitle (optional)' },
    SubtitleColor: { type: 'color', title: 'Subtitle Color', defaultValue: '#000000' },
    SubtitleSize: { type: 'string', title: 'Subtitle Size', placeholder: 'Ex: 18px, 1.5rem, text-2xl' },
    SubtitleWeight: {
      type: 'select', title: 'Subtitle Weight',
      options: [
        { value: '100', label: 'Thin (100)' },
        { value: '200', label: 'Extra Light (200)' },
        { value: '300', label: 'Light (300)' },
        { value: '400', label: 'Regular (400)' },
        { value: '500', label: 'Medium (500)' },
        { value: '600', label: 'Semi Bold (600)' },
        { value: '700', label: 'Bold (700)' },
        { value: '800', label: 'Extra Bold (800)' },
        { value: '900', label: 'Black (900)' },
      ],
      defaultValue: '500',
    },
    SubtitleAlignment: {
      type: 'select', title: 'Subtitle Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'left',
    },
    // Body
    Body: { type: 'textarea', title: 'Content' },
    BodyColor: { type: 'color', title: 'Content Color', defaultValue: '#000000' },
    BodySize: { type: 'string', title: 'Content Size', placeholder: 'Ex: 16px, 1rem, text-base' },
    BodyWeight: {
      type: 'select', title: 'Content Weight',
      options: [
        { value: '100', label: 'Thin (100)' },
        { value: '200', label: 'Extra Light (200)' },
        { value: '300', label: 'Light (300)' },
        { value: '400', label: 'Regular (400)' },
        { value: '500', label: 'Medium (500)' },
        { value: '600', label: 'Semi Bold (600)' },
        { value: '700', label: 'Bold (700)' },
        { value: '800', label: 'Extra Bold (800)' },
        { value: '900', label: 'Black (900)' },
      ],
      defaultValue: '400',
    },
    BodyAlignment: {
      type: 'select', title: 'Content Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
        { value: 'justify', label: 'Justified' },
      ],
      defaultValue: 'left',
    },
  },
});