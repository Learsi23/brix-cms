import { registerBlock } from '../registry';

registerBlock({
  type: 'LottieBlock',
  name: 'Lottie Animation',
  category: 'Media',
  icon: 'fa-film',
  description: 'Lottie animation. Lightweight JSON animations for engaging visual content.',
  fieldsArray: [
    { name: 'lottieUrl', type: 'url', title: 'Lottie JSON URL', description: 'Direct URL to .json Lottie file' },
    { name: 'width', type: 'text', title: 'Width', placeholder: '300px', defaultValue: '300px' },
    { name: 'height', type: 'text', title: 'Height', placeholder: '300px', defaultValue: '300px' },
    { name: 'autoPlay', type: 'select', title: 'Auto Play', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }], defaultValue: 'true' },
    { name: 'loop', type: 'select', title: 'Loop', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }], defaultValue: 'true' },
    { name: 'speed', type: 'text', title: 'Animation Speed', placeholder: '0.5, 1, 2', defaultValue: '1' },
    { name: 'backgroundColor', type: 'color', title: 'Background Color', defaultValue: 'transparent' },
    { name: 'borderRadius', type: 'text', title: 'Border Radius', placeholder: '0, 8px, 50%', defaultValue: '0' },
    { name: 'sectionId', type: 'text', title: 'Section ID (anchor)' },
    { name: 'paddingY', type: 'text', title: 'Vertical Padding', placeholder: '1rem', defaultValue: '1rem' },
  ],
});