import { registerBlock } from '../registry';

registerBlock({
  type: 'VideoBlock',
  name: 'Video',
  category: 'Media',
  icon: 'fa-play-circle',
  description: 'Embedded YouTube or Vimeo video. Only requires the public URL of the video.',
  fieldsArray: [
    { name: 'videoUrl', type: 'url', title: 'YouTube or Vimeo URL', placeholder: 'https://www.youtube.com/watch?v=...' },
    { name: 'aspectRatio', type: 'text', title: 'Aspect Ratio', placeholder: '16/9 | 4/3 | 1/1', defaultValue: '16/9' },
    { name: 'maxWidth', type: 'text', title: 'Max Width', placeholder: 'e.g. 900px, 100%', defaultValue: '900px' },
    { name: 'title', type: 'text', title: 'Title (above video)' },
    { name: 'titleColor', type: 'color', title: 'Title Color', defaultValue: '#111827' },
    { name: 'subtitle', type: 'text', title: 'Subtitle / Description' },
    { name: 'subtitleColor', type: 'color', title: 'Subtitle Color', defaultValue: '#6b7280' },
    { name: 'textAlign', type: 'select', title: 'Text Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }], defaultValue: 'center' },
    { name: 'backgroundColor', type: 'color', title: 'Section Background', defaultValue: 'transparent' },
    { name: 'paddingY', type: 'text', title: 'Vertical Padding', defaultValue: '2rem' },
  ],
});
