import { registerBlock } from '../registry';

registerBlock({
  type: 'VideoBlock',
  name: 'Video',
  category: 'Media',
  icon: '▶️',
  description: 'Embedded YouTube or Vimeo video. Only requires the public URL of the video.',
  fields: {
    VideoUrl: { type: 'url', title: 'YouTube or Vimeo URL', placeholder: 'https://www.youtube.com/watch?v=...' },
    AspectRatio: { type: 'string', title: 'Aspect Ratio', placeholder: '16/9 | 4/3 | 1/1', defaultValue: '16/9' },
    MaxWidth: { type: 'string', title: 'Max Width', placeholder: 'e.g. 900px, 100%', defaultValue: '900px' },
    Title: { type: 'string', title: 'Title (above video)' },
    TitleColor: { type: 'color', title: 'Title Color', defaultValue: '#111827' },
    Subtitle: { type: 'string', title: 'Subtitle / Description' },
    SubtitleColor: { type: 'color', title: 'Subtitle Color', defaultValue: '#6b7280' },
    TextAlign: { type: 'select', title: 'Text Alignment', defaultValue: 'center', options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ]},
    BackgroundColor: { type: 'color', title: 'Section Background', defaultValue: 'transparent' },
    PaddingY: { type: 'string', title: 'Vertical Padding', defaultValue: '2rem' },
  },
});
