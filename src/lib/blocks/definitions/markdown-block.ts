import { registerBlock } from '../registry';

registerBlock({
  type: 'MarkdownBlock',
  name: 'Markdown',
  category: 'Content',
  icon: '✍️',
  description: 'Renders content in Markdown format. Ideal for long texts, documentation or formatted articles.',
  fields: {
    Content: { type: 'markdown', title: 'Markdown Content' },
  },
});
