import { registerBlock } from '../registry';

registerBlock({
  type: 'HeroBlock',
  name: 'Hero Section',
  category: 'Content',
  icon: 'fa-bullhorn',
  description: 'Full-page main banner with background image, title, subtitle, overlay and CTA button.',
  fieldsArray: [
    { name: 'title', type: 'text', title: 'Title', placeholder: 'Write the title' },
    { name: 'titleColor', type: 'color', title: 'Title Color', defaultValue: '#ffffff' },
    { name: 'titleSize', type: 'text', title: 'Title Size', placeholder: 'e.g. 64px' },
    { name: 'subtitle', type: 'text', title: 'Subtitle' },
    { name: 'subtitleColor', type: 'color', title: 'Subtitle Color', defaultValue: '#e2e8f0' },
    { name: 'subtitleSize', type: 'text', title: 'Subtitle Size', placeholder: 'e.g. 20px' },
  ],
});
