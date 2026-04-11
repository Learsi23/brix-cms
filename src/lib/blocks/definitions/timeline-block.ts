import { registerBlock } from '../registry';

registerBlock({
  type: 'TimelineBlock',
  name: 'Timeline / Steps',
  category: 'Content',
  icon: '📅',
  description: 'Timeline of steps or milestones. Ideal for "How it works", company history, or process. Add TimelineItem blocks inside.',
  isGroup: true,
  fields: {
    Title: { type: 'string', title: 'Title' },
    TitleColor: { type: 'color', title: 'Title Color' },
    Subtitle: { type: 'string', title: 'Subtitle' },
    BackgroundColor: { type: 'color', title: 'Background Color' },
    ConnectorColor: { type: 'color', title: 'Connector Line Color', defaultValue: '#3b82f6' },
    Layout: { type: 'select', title: 'Layout', options: [{ value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' }], defaultValue: 'vertical' },
    TextAlign: { type: 'select', title: 'Text Alignment', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }], defaultValue: 'left' },
  },
});
