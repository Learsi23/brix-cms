import { registerBlock } from '../registry';

registerBlock({
  type: 'TeamMemberBlock',
  name: 'Team Member',
  category: 'Content',
  icon: '👤',
  description: 'Individual team member card with photo, name, role and social links. Add inside TeamBlock.',
  fields: {
    Photo: { type: 'image', title: 'Photo' },
    Name: { type: 'string', title: 'Name' },
    Role: { type: 'string', title: 'Role / Position' },
    Description: { type: 'textarea', title: 'Short Bio' },
    LinkedInUrl: { type: 'url', title: 'LinkedIn URL' },
    TwitterUrl: { type: 'url', title: 'Twitter / X URL' },
    Email: { type: 'string', title: 'Email' },
    CardBgColor: { type: 'color', title: 'Card Background', defaultValue: '#ffffff' },
  },
});
