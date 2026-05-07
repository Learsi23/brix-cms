import { registerBlock } from '../registry';

registerBlock({
  type: 'CodeBlock',
  name: 'Code Block',
  category: 'Content',
  icon: 'fa-code',
  description: 'Syntax highlighted code block. Perfect for code snippets, API examples, and tutorials.',
  fieldsArray: [
    { name: 'code', type: 'richtext', title: 'Code', placeholder: 'Paste your code here' },
    { name: 'language', type: 'select', title: 'Language', options: [{ label: 'JavaScript', value: 'javascript' }, { label: 'TypeScript', value: 'typescript' }, { label: 'Python', value: 'python' }, { label: 'Java', value: 'java' }, { label: 'C#', value: 'csharp' }, { label: 'Go', value: 'go' }, { label: 'Rust', value: 'rust' }, { label: 'PHP', value: 'php' }, { label: 'Ruby', value: 'ruby' }, { label: 'SQL', value: 'sql' }, { label: 'HTML', value: 'html' }, { label: 'CSS', value: 'css' }, { label: 'JSON', value: 'json' }, { label: 'YAML', value: 'yaml' }, { label: 'Bash/Shell', value: 'bash' }, { label: 'Plain Text', value: 'plaintext' }], defaultValue: 'javascript' },
    { name: 'theme', type: 'select', title: 'Syntax Theme', options: [{ label: 'Default', value: 'default' }, { label: 'Dark', value: 'dark' }, { label: 'GitHub', value: 'github' }, { label: 'Monokai', value: 'monokai' }, { label: 'Dracula', value: 'dracula' }], defaultValue: 'dark' },
    { name: 'backgroundColor', type: 'color', title: 'Background Color', defaultValue: '#1e293b' },
    { name: 'textColor', type: 'color', title: 'Text Color', defaultValue: '#e2e8f0' },
    { name: 'borderRadius', type: 'text', title: 'Border Radius', placeholder: '8px', defaultValue: '8px' },
    { name: 'showLineNumbers', type: 'select', title: 'Show Line Numbers', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }], defaultValue: 'true' },
    { name: 'showCopyButton', type: 'select', title: 'Show Copy Button', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }], defaultValue: 'true' },
    { name: 'maxHeight', type: 'text', title: 'Max Height', placeholder: 'e.g. 400px, auto' },
    { name: 'fontSize', type: 'text', title: 'Font Size', placeholder: '14px', defaultValue: '14px' },
    { name: 'title', type: 'text', title: 'Code Title/Filename', placeholder: 'e.g. example.js' },
    { name: 'titleBackground', type: 'color', title: 'Title Bar Background', defaultValue: '#0f172a' },
    { name: 'sectionId', type: 'text', title: 'Section ID (anchor)' },
  ],
});