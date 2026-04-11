import { registerBlock } from '../registry';

registerBlock({
  type: 'TestimonialItemBlock',
  name: 'Testimonial Item',
  category: 'Content',
  icon: '⭐',
  description: 'Single customer review with text, avatar, name and star rating. Add inside TestimonialsBlock.',
  fields: {
    ReviewText: { type: 'textarea', title: 'Review Text' },
    Name: { type: 'string', title: 'Customer Name' },
    Role: { type: 'string', title: 'Role / Company' },
    Avatar: { type: 'image', title: 'Avatar Photo' },
    Stars: { type: 'select', title: 'Star Rating', defaultValue: '5', options: [
      { value: '1', label: '★' },
      { value: '2', label: '★★' },
      { value: '3', label: '★★★' },
      { value: '4', label: '★★★★' },
      { value: '5', label: '★★★★★' },
    ]},
  },
});
