import { registerBlock } from '../registry';

registerBlock({
  type: 'BrixGridDemoBlock',
  name: 'Brix Grid Demo',
  category: 'Content',
  icon: 'fa-th',
  description: 'Visual demonstration of the modular block system.',
  fieldsArray: [
    { name: 'title', type: 'text', title: 'Section Title' },
    { name: 'titleColor', type: 'color', title: 'Title Color', defaultValue: '#ffffff' },
    { name: 'titleSize', type: 'text', title: 'Title Size', placeholder: 'E.g.: 2rem', defaultValue: '2rem' },
    { name: 'subtitle', type: 'text', title: 'Subtitle' },
    { name: 'subtitleColor', type: 'color', title: 'Subtitle Color', defaultValue: '#9ca3af' },
    { name: 'layout', type: 'text', title: 'Layout', defaultValue: 'grid-text' },
  ],
});