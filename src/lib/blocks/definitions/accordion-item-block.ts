import { registerBlock } from '../registry';

registerBlock({
  type: 'AccordionItemBlock',
  name: 'Accordion Item',
  category: 'Interactive',
  icon: '📄',
  description: 'Single accordion item with a question and collapsible answer. Add inside AccordionBlock.',
  fields: {
    Question: { type: 'string', title: 'Question / Title' },
    Answer: { type: 'textarea', title: 'Answer (HTML allowed)' },
    OpenByDefault: { type: 'bool', title: 'Open by default', defaultValue: 'false' },
  },
});
