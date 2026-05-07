import { registerBlock } from '../registry';

registerBlock({
  type: 'FeatureListBlock',
  name: 'Feature List',
  category: 'Content',
  icon: 'fa-list-check',
  description: 'List of features with icons. Perfect for showing features, benefits, or checklists.',
  fieldsArray: [
    { name: 'sectionId', type: 'text', title: 'Section ID (anchor)', placeholder: 'e.g. features' },
    { name: 'title', type: 'text', title: 'Section Title' },
    { name: 'titleColor', type: 'color', title: 'Title Color', defaultValue: '#000000' },
    { name: 'titleAlign', type: 'select', title: 'Title Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }], defaultValue: 'left' },
    { name: 'columns', type: 'select', title: 'Columns', options: [{ label: '1 Column', value: '1' }, { label: '2 Columns', value: '2' }, { label: '3 Columns', value: '3' }, { label: '4 Columns', value: '4' }], defaultValue: '2' },
    { name: 'gap', type: 'text', title: 'Gap Between Items', placeholder: '1rem', defaultValue: '1rem' },
    { name: 'itemIconColor', type: 'color', title: 'Icon Color', defaultValue: '#10b981' },
    { name: 'itemIconSize', type: 'text', title: 'Icon Size', placeholder: '24px', defaultValue: '24px' },
    { name: 'itemTitleColor', type: 'color', title: 'Item Title Color', defaultValue: '#000000' },
    { name: 'itemTitleWeight', type: 'text', title: 'Item Title Weight', placeholder: 'normal, bold, 600', defaultValue: '600' },
    { name: 'itemDescriptionColor', type: 'color', title: 'Item Description Color', defaultValue: '#666666' },
    { name: 'itemDescriptionSize', type: 'text', title: 'Item Description Size', placeholder: '14px', defaultValue: '14px' },
    { name: 'backgroundColor', type: 'color', title: 'Background Color', defaultValue: 'transparent' },
    { name: 'paddingY', type: 'text', title: 'Vertical Padding', placeholder: '2rem', defaultValue: '2rem' },
  ],
});