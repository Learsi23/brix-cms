import { registerBlock } from '../registry';

registerBlock({
  type: 'TimelineItemBlock',
  name: 'Timeline Item',
  category: 'Content',
  icon: '📍',
  description: 'A single step or milestone in a timeline. Add inside TimelineBlock.',
  fields: {
    StepLabel: { type: 'string', title: 'Step Label', placeholder: 'e.g. Step 1, 2021' },
    Icon: { type: 'string', title: 'Icon (FontAwesome class)', placeholder: 'fas fa-check' },
    Date: { type: 'string', title: 'Date / Period', placeholder: 'e.g. Jan 2024' },
    Title: { type: 'string', title: 'Title' },
    Description: { type: 'textarea', title: 'Description' },
    AccentColor: { type: 'color', title: 'Accent Color', defaultValue: '#3b82f6' },
  },
});
