import { registerBlock } from '../registry';

registerBlock({
  type: 'BeforeAfterBlock',
  name: 'Before / After Image',
  category: 'Media',
  icon: 'fa-columns',
  description: 'Image comparison slider. Perfect for showing transformations, before/after results, or product comparisons.',
  fieldsArray: [
    { name: 'beforeImage', type: 'image', title: 'Before Image', description: "The 'before' image (left side)" },
    { name: 'afterImage', type: 'image', title: 'After Image', description: "The 'after' image (right side)" },
    { name: 'beforeLabel', type: 'text', title: 'Before Label', placeholder: 'e.g. Before, Original', defaultValue: 'Before' },
    { name: 'afterLabel', type: 'text', title: 'After Label', placeholder: 'e.g. After, Result', defaultValue: 'After' },
    { name: 'labelColor', type: 'color', title: 'Label Text Color', defaultValue: '#ffffff' },
    { name: 'labelBackground', type: 'color', title: 'Label Background', defaultValue: '#000000' },
    { name: 'orientation', type: 'select', title: 'Slider Orientation', options: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }], defaultValue: 'horizontal' },
    { name: 'startingPosition', type: 'text', title: 'Starting Position (%)', placeholder: '0-100', defaultValue: '50' },
    { name: 'width', type: 'text', title: 'Max Width', placeholder: 'e.g. 800px, 100%', defaultValue: '100%' },
    { name: 'height', type: 'text', title: 'Height', placeholder: 'e.g. 500px, auto', defaultValue: '500px' },
    { name: 'borderRadius', type: 'text', title: 'Border Radius', placeholder: '0, 8px, 1rem', defaultValue: '0' },
    { name: 'sectionId', type: 'text', title: 'Section ID (anchor)' },
    { name: 'paddingY', type: 'text', title: 'Vertical Padding', placeholder: '2rem', defaultValue: '2rem' },
  ],
});