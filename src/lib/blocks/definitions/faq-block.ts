import { registerBlock } from '../registry';

registerBlock({
  type: 'FAQBlock',
  name: 'FAQ (Specialized)',
  category: 'Interactive',
  icon: 'fa-question-circle',
  description: 'Specialized FAQ block with structured questions and answers. Different from accordion - optimized for Q&A content.',
  isGroup: true,
  fieldsArray: [
    { name: 'sectionId', type: 'text', title: 'Section ID (anchor)', placeholder: 'e.g. faq' },
    { name: 'style', type: 'select', title: 'FAQ Style', options: [{ label: 'Simple List', value: 'list' }, { label: 'Cards', value: 'cards' }, { label: 'Bordered', value: 'bordered' }], defaultValue: 'cards' },
    { name: 'backgroundColor', type: 'color', title: 'Background Color', defaultValue: 'transparent' },
    { name: 'paddingY', type: 'text', title: 'Vertical Padding', placeholder: '3rem', defaultValue: '3rem' },
    { name: 'title', type: 'text', title: 'Section Title' },
    { name: 'titleColor', type: 'color', title: 'Title Color', defaultValue: '#000000' },
    { name: 'titleAlign', type: 'select', title: 'Title Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }], defaultValue: 'center' },
    { name: 'description', type: 'richtext', title: 'Description', placeholder: 'Optional description below title' },
    { name: 'descriptionColor', type: 'color', title: 'Description Color', defaultValue: '#666666' },
    { name: 'questionColor', type: 'color', title: 'Question Color', defaultValue: '#000000' },
    { name: 'questionWeight', type: 'text', title: 'Question Weight', placeholder: 'normal, bold, 600', defaultValue: '600' },
    { name: 'answerColor', type: 'color', title: 'Answer Color', defaultValue: '#555555' },
    { name: 'answerWeight', type: 'text', title: 'Answer Weight', placeholder: 'normal, light, 400', defaultValue: '400' },
    { name: 'iconColor', type: 'color', title: 'Icon Color', defaultValue: '#5B6EF5' },
    { name: 'borderColor', type: 'color', title: 'Border Color', defaultValue: '#e5e7eb' },
    { name: 'columns', type: 'select', title: 'Columns Layout', options: [{ label: '1 Column', value: '1' }, { label: '2 Columns', value: '2' }], defaultValue: '1' },
  ],
});