import { registerBlock } from '../registry';

registerBlock({
  type: 'SpacerBlock',
  name: 'Spacer',
  category: 'Layout',
  icon: '↕️',
  description: 'Configurable empty space by height. Use it to separate sections and create visual breathing room between blocks.',
  fields: {
    Height: { type: 'string', title: 'Height', placeholder: 'e.g. 40px, 3rem, 80px', defaultValue: '48px' },
    BackgroundColor: { type: 'color', title: 'Background Color (optional)', defaultValue: 'transparent' },
  },
});
