import { registerBlock } from '../registry';

// Container block — can have child blocks (isGroup: true)
// Equivalent to ColumnBlock : BlockGroupBase in .NET
registerBlock({
  type: 'ColumnBlock',
  name: 'Columns',
  category: 'Columns',
  icon: '⬜',
  description: 'Container that organizes child blocks into responsive columns (1-4 cols). Drag other blocks inside. Base of all grid layouts.',
  isGroup: true,
  fields: {
    Gap: {
      type: 'select', title: 'Column spacing',
      options: [
        { value: 'gap-0', label: 'None' },
        { value: 'gap-2', label: 'Small' },
        { value: 'gap-4', label: 'Medium' },
        { value: 'gap-6', label: 'Normal' },
        { value: 'gap-8', label: 'Large' },
        { value: 'gap-12', label: 'Extra large' },
      ],
      defaultValue: 'gap-6',
    },
    AnimateOnScroll: { type: 'bool', title: 'Animate on scroll', defaultValue: 'false' },
    Columns: {
      type: 'select', title: 'Number of columns',
      options: [
        { value: '1', label: '1 column' },
        { value: '2', label: '2 columns' },
        { value: '3', label: '3 columns' },
        { value: '4', label: '4 columns' },
      ],
      defaultValue: '2',
    },
  },
});
