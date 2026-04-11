import { registerBlock } from '../registry';

registerBlock({
  type: 'AccordionBlock',
  name: 'Accordion / FAQ',
  category: 'Interactive',
  icon: '📋',
  description: 'Multi-item collapsible accordion. Perfect for FAQs. Add AccordionItem blocks inside.',
  isGroup: true,
  fields: {
    Title: { type: 'string', title: 'Block Title' },
    TitleColor: { type: 'color', title: 'Title Color' },
    BackgroundColor: { type: 'color', title: 'Background Color' },
    ActiveColor: { type: 'color', title: 'Active Color (Border/Icon)', defaultValue: '#3b82f6' },
    AllowMultiple: { type: 'bool', title: 'Allow multiple open', defaultValue: 'false' },
  },
});
