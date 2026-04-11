import { registerBlock } from '../registry';

registerBlock({
  type: 'TeamBlock',
  name: 'Team',
  category: 'Content',
  icon: '👥',
  description: 'Grid of team members with photo, name, position and social links. Add TeamMember blocks inside.',
  isGroup: true,
  fields: {
    Title: { type: 'string', title: 'Title' },
    TitleColor: { type: 'color', title: 'Title Color' },
    Subtitle: { type: 'string', title: 'Subtitle' },
    Columns: { type: 'select', title: 'Columns (desktop)', options: [{ value: '2', label: '2 columns' }, { value: '3', label: '3 columns' }, { value: '4', label: '4 columns' }], defaultValue: '3' },
    BackgroundColor: { type: 'color', title: 'Background Color' },
  },
});
