import { registerBlock } from '../registry';

registerBlock({
  type: 'DropdownBlock',
  name: 'Dropdown',
  category: 'Media',
  icon: '🔽',
  description: 'Accordion-style dropdown menu. Ideal for FAQs or collapsible content.',
  fields: {
    Title: { type: 'string', title: 'Block Title', placeholder: 'Write the title (optional)' },
    TitleColor: { type: 'color', title: 'Title Color', defaultValue: '#000000' },
    TitleSize: { type: 'string', title: 'Title Size', placeholder: 'Ex: 24px, 2rem' },
    BackgroundColor: { type: 'color', title: 'Block Background Color', defaultValue: 'transparent' },
    BackgroundGradient: { type: 'string', title: 'CSS Gradient (optional)', placeholder: 'Ex: linear-gradient(45deg, #ff0000, #00ff00)', description: 'If specified, overrides the background color' },
    Question: { type: 'string', title: 'Dropdown Question', placeholder: 'Write the question' },
    QuestionColor: { type: 'color', title: 'Question Color', defaultValue: '#000000' },
    QuestionSize: { type: 'string', title: 'Question Size', placeholder: 'Ex: 18px, 1.2rem' },
    Answer: { type: 'textarea', title: 'Answer (HTML)', placeholder: 'Write the content' },
    AnswerColor: { type: 'color', title: 'Answer Color', defaultValue: '#333333' },
    AnswerSize: { type: 'string', title: 'Answer Size', placeholder: 'Ex: 16px, 1rem' },
    DropdownBackgroundColor: { type: 'color', title: 'Dropdown Background Color', defaultValue: '#f8f9fa' },
    OpenByDefault: { type: 'bool', title: 'Open by default?', defaultValue: 'false' },
  },
});
