import { registerBlock } from '../registry';

registerBlock({
  type: 'SocialProofBlock',
  name: 'Social Proof / Logos',
  category: 'Content',
  icon: '🏆',
  description: 'Client logos + Google/Trustpilot review count and score. Builds instant trust.',
  fields: {
    Title: { type: 'string', title: 'Title' },
    LogoUrls: { type: 'textarea', title: 'Logo URLs (comma-separated)', placeholder: 'https://..., https://...' },
    LogoHeight: { type: 'string', title: 'Logo Height', defaultValue: '40px' },
    ReviewCount: { type: 'string', title: 'Review Count', placeholder: 'e.g. 2,400+' },
    ReviewScore: { type: 'string', title: 'Average Score', placeholder: 'e.g. 4.9' },
    ReviewSource: { type: 'select', title: 'Review Platform', options: [{ value: 'Google', label: 'Google' }, { value: 'Trustpilot', label: 'Trustpilot' }, { value: 'Other', label: 'Other' }], defaultValue: 'Google' },
    BackgroundColor: { type: 'color', title: 'Background Color' },
    TextColor: { type: 'color', title: 'Text Color', defaultValue: '#6b7280' },
  },
});
