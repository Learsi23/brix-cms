import { registerBlock } from '../registry';

registerBlock({
  type: 'TestimonialsBlock',
  name: 'Testimonials',
  category: 'Content',
  icon: '💬',
  description: 'Carousel of customer reviews with avatar, name, role and stars. Add TestimonialItem blocks inside.',
  isGroup: true,
  fields: {
    Title: { type: 'string', title: 'Title' },
    TitleColor: { type: 'color', title: 'Title Color' },
    Subtitle: { type: 'string', title: 'Subtitle' },
    BackgroundColor: { type: 'color', title: 'Background Color' },
    CardBgColor: { type: 'color', title: 'Card Background', defaultValue: '#ffffff' },
    StarColor: { type: 'color', title: 'Star Color', defaultValue: '#f59e0b' },
    AutoPlay: { type: 'bool', title: 'Auto Play', defaultValue: 'true' },
    AutoPlayInterval: { type: 'string', title: 'Auto Play Interval (ms)', defaultValue: '4000' },
  },
});
