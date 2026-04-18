import { registerBlock } from '../registry';

registerBlock({
  type: 'FloatingChatBlock',
  name: 'Floating Chat Button',
  category: 'AI',
  icon: '💬',
  description: 'Floating chat button fixed to a corner of the screen. Opens a chat panel overlay.',
  fields: {
    Position: { type: 'select', title: 'Position', defaultValue: 'right', options: [{ value: 'right', label: 'Right' }, { value: 'left', label: 'Left' }] },
    ButtonColor: { type: 'color', title: 'Button Color', defaultValue: '#2563EB' },
    ButtonTextColor: { type: 'color', title: 'Button Text/Icon Color', defaultValue: '#ffffff' },
    ButtonIcon: { type: 'string', title: 'Button Icon (emoji)', defaultValue: '💬' },
    ButtonSize: { type: 'string', title: 'Button Size', defaultValue: '56px' },
    AiProvider: { type: 'select', title: 'AI Provider', defaultValue: 'auto', options: [{ value: 'auto', label: 'Auto (first available)' }, { value: 'ollama', label: 'Ollama (local)' }, { value: 'gemini', label: 'Google Gemini' }, { value: 'deepseek', label: 'DeepSeek' }, { value: 'mistral', label: 'Mistral AI' }] },
    CustomPrompt: { type: 'string', title: 'AI Instructions (System Prompt)' },
    WelcomeMessage: { type: 'string', title: 'Welcome Message' },
    Logo: { type: 'image', title: 'Logo' },
    LogoSize: { type: 'string', title: 'Logo Size', defaultValue: '28px' },
    AiLogo: { type: 'image', title: 'AI Response Logo' },
    AiLogoSize: { type: 'string', title: 'AI Logo Size', defaultValue: '24px' },
    PdfFiles: { type: 'string', title: 'PDF Filter (filename contains)' },
  },
});
