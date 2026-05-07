import { registerBlock } from '../registry';

registerBlock({
  type: 'ImageBlock',
  name: 'Simple Image',
  category: 'Content',
  icon: 'fa-image',
  description: 'Simple image with alt text, configurable size and alignment options.',
  fields: {
    Source: { type: 'image', title: 'Select Image' },
    AltText: { type: 'string', title: 'Alternative Text (Alt)' },
  },
});
