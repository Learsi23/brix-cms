import { registerBlock } from '../registry';

registerBlock({
  type: 'CountdownBlock',
  name: 'Countdown Timer',
  category: 'Interactive',
  icon: '⏱️',
  description: 'Countdown timer for offers, launches, or events. Set the target date.',
  fields: {
    Title: { type: 'string', title: 'Title', placeholder: 'e.g. Offer ends soon!' },
    TargetDate: { type: 'string', title: 'Target Date (ISO)', placeholder: 'e.g. 2025-12-31T23:59:59' },
    OnEndText: { type: 'string', title: 'Text when ended', defaultValue: "It's over!" },
    BackgroundColor: { type: 'color', title: 'Background Color' },
    TextColor: { type: 'color', title: 'Text Color', defaultValue: '#1f2937' },
    DigitBgColor: { type: 'color', title: 'Digit Background', defaultValue: '#1f2937' },
    DigitColor: { type: 'color', title: 'Digit Color', defaultValue: '#ffffff' },
    ShowLabels: { type: 'bool', title: 'Show Labels (Days, Hrs…)', defaultValue: 'true' },
  },
});
