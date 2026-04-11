import { registerBlock } from '../registry';

registerBlock({
  type: 'CTABannerBlock',
  name: 'CTA Banner',
  category: 'Content',
  icon: '📣',
  description: 'Call-to-action banner with colored background, text and button. Ideal for closing sections or as a page footer.',
  fields: {
    Title: { type: 'string', title: 'Main Title' },
    TitleColor: { type: 'color', title: 'Title Color', defaultValue: '#ffffff' },
    TitleSize: { type: 'string', title: 'Title Size', placeholder: 'e.g. 2rem, 2.5rem', defaultValue: '2rem' },
    Subtitle: { type: 'string', title: 'Subtitle / Description' },
    SubtitleColor: { type: 'color', title: 'Subtitle Color', defaultValue: 'rgba(255,255,255,0.8)' },
    Btn1Text: { type: 'string', title: 'Button 1 Text', defaultValue: 'Get started' },
    Btn1Url: { type: 'url', title: 'Button 1 URL', defaultValue: '#' },
    Btn1BgColor: { type: 'color', title: 'Button 1 Background', defaultValue: '#ffffff' },
    Btn1TextColor: { type: 'color', title: 'Button 1 Text Color', defaultValue: '#111827' },
    Btn2Text: { type: 'string', title: 'Button 2 Text (optional)' },
    Btn2Url: { type: 'url', title: 'Button 2 URL', defaultValue: '#' },
    Btn2Color: { type: 'color', title: 'Button 2 Border/Text Color', defaultValue: '#ffffff' },
    BackgroundColor: { type: 'color', title: 'Background Color', defaultValue: '#10b981' },
    BackgroundColor2: { type: 'color', title: 'Background Color 2 (gradient)', defaultValue: '' },
    BackgroundImage: { type: 'image', title: 'Background Image (optional)' },
    PaddingY: { type: 'string', title: 'Vertical Padding', defaultValue: '5rem' },
    TextAlign: { type: 'select', title: 'Content Alignment', defaultValue: 'center', options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ]},
  },
});
