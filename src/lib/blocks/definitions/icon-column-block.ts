import { registerBlock } from '../registry';

// Icon Column — equivalent to IconColumn.cs in .NET (group block for IconCardBlocks)
registerBlock({
  type: 'IconColumn',
  name: 'Icon Column',
  category: 'Columns',
  icon: '⊞',
  description: 'Column container optimized for IconCardBlock. Adds global icon support to the group.',
  isGroup: true,
  fields: {
    Gap: { type: 'string', title: 'Card Spacing', placeholder: 'e.g. gap-4, gap-6', defaultValue: 'gap-6' },
    ColumnsPerRow: { type: 'string', title: 'Columns per Row', placeholder: 'e.g. 1, 2, 3, 4', defaultValue: '3' },
    BackgroundColor: { type: 'color', title: 'Background Color' },
    Title: { type: 'string', title: 'Section Title', placeholder: 'Optional section title' },
    TitleColor: { type: 'color', title: 'Title Color' },
    TitleSize: { type: 'string', title: 'Title Size', placeholder: 'e.g. 24px, 2rem' },
  },
});
