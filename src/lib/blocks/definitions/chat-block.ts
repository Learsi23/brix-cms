import { registerBlock } from '../registry';

registerBlock({
  type: 'ChatBlock',
  name: 'AI Assistant',
  category: 'AI',
  icon: '🤖',
  description: 'AI chat interface using Ollama. Visitors can ask questions and receive automatic responses.',
  fields: {
    BackgroundColor: { type: 'color', title: 'Block Background Color', defaultValue: '#ffffff' },
    Title: { type: 'string', title: 'Chat Title', placeholder: 'Ex: Smart Assistant' },
    TitleColor: { type: 'color', title: 'Title Color', defaultValue: '#000000' },
    TitleSize: { type: 'string', title: 'Title Size', placeholder: 'Ex: 24px' },
    Logo: { type: 'image', title: 'Chat Logo' },
    LogoSize: { type: 'string', title: 'Logo Size', placeholder: 'Ex: 24px' },
    Ai_Logo: { type: 'image', title: 'AI Logo' },
    Ai_LogoSize: { type: 'string', title: 'AI Logo Size', placeholder: 'Ex: 24px' },
    CustomPrompt: { type: 'string', title: 'AI Instructions (System Prompt)', placeholder: 'Tell the AI how to behave...' },
    WelcomeMessage: { type: 'string', title: 'Welcome Message', placeholder: 'Ex: Hello! How can I help you?' },
  },
});
