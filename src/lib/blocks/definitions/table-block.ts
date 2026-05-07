import { registerBlock } from '../registry';

registerBlock({
  type: 'TableBlock',
  name: 'Table',
  category: 'Content',
  icon: 'fa-table',
  description: 'Simple data table. Different from comparison table - optimized for displaying structured data.',
  fieldsArray: [
    { name: 'tableData', type: 'richtext', title: 'Table Content', description: 'First line = column headers. Each next line = one row. Separate columns with the pipe character |', placeholder: 'Product | Price | Status\nApple | €1.50 | Available\nBanana | €0.80 | Available', defaultValue: 'Product | Price | Status\nItem 1 | €10.00 | Available\nItem 2 | €20.00 | Available' },
    { name: 'caption', type: 'text', title: 'Table Caption', placeholder: 'Optional table title' },
    { name: 'style', type: 'select', title: 'Table Style', options: [{ label: 'Default', value: 'default' }, { label: 'Striped', value: 'striped' }, { label: 'Bordered', value: 'bordered' }, { label: 'Minimal', value: 'minimal' }], defaultValue: 'striped' },
    { name: 'headerBackground', type: 'color', title: 'Header Background', defaultValue: '#f3f4f6' },
    { name: 'headerColor', type: 'color', title: 'Header Text Color', defaultValue: '#000000' },
    { name: 'cellColor', type: 'color', title: 'Cell Text Color', defaultValue: '#111827' },
    { name: 'rowBackground', type: 'color', title: 'Row Background', defaultValue: '#ffffff' },
    { name: 'rowAlternateBackground', type: 'color', title: 'Alternate Row Background', defaultValue: '#f9fafb' },
    { name: 'borderColor', type: 'color', title: 'Border Color', defaultValue: '#e5e7eb' },
    { name: 'cellPadding', type: 'text', title: 'Cell Padding', placeholder: '12px', defaultValue: '12px' },
    { name: 'textAlign', type: 'select', title: 'Text Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }], defaultValue: 'left' },
    { name: 'mobileScroll', type: 'select', title: 'Scroll on Mobile', options: [{ label: 'Yes (horizontal scroll)', value: 'true' }, { label: 'No', value: 'false' }], defaultValue: 'true' },
    { name: 'sectionId', type: 'text', title: 'Section ID (anchor)' },
  ],
});