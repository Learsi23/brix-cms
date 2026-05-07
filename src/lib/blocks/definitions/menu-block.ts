import { registerBlock } from '../registry';

registerBlock({
  type: 'MenuBlock',
  name: 'Restaurant Menu',
  category: 'Content',
  icon: 'fa-utensils',
  description: 'Display a restaurant menu with categories, dish names, descriptions, and prices.',
  fieldsArray: [
    {
      name: 'title',
      type: 'text',
      title: 'Section Title',
      placeholder: 'Our Menu',
      defaultValue: 'Our Menu',
    },
    {
      name: 'subtitle',
      type: 'text',
      title: 'Subtitle',
      placeholder: 'Fresh ingredients, prepared with passion.',
      defaultValue: 'Fresh ingredients, prepared with passion.',
    },
    {
      name: 'menuContent',
      type: 'richtext',
      title: 'Menu Content',
      description: 'Write [Category Name] to start a section. Then one item per line: Name | Description | Price | Badge (badge is optional). Leave a blank line between sections.',
      placeholder: '[Starters]\nGarlic Bread | Toasted ciabatta with herb butter | €5\nSoup of the Day | Ask your server | €7 | Chef\'s pick\n\n[Mains]\nGrilled Chicken | Free-range chicken with seasonal vegetables | €16\nPasta Primavera | Fresh pasta with roasted vegetables | €14 | Vegan',
      defaultValue: `[Starters]
Garlic Bread | Toasted ciabatta with herb butter | €5
Soup of the Day | Ask your server | €7 | Chef's pick

[Mains]
Grilled Chicken | Free-range chicken with seasonal vegetables | €16
Pasta Primavera | Fresh pasta with roasted vegetables and pesto | €14 | Vegan`,
    },
    {
      name: 'accentColor',
      type: 'color',
      title: 'Accent Color',
      defaultValue: '#b45309',
    },
    {
      name: 'showDividers',
      type: 'boolean',
      title: 'Show Dividers',
      defaultValue: true,
    },
  ],
});