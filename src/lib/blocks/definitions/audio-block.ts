import { registerBlock } from '../registry';

registerBlock({
  type: 'AudioBlock',
  name: 'Audio / Podcast',
  category: 'Media',
  icon: 'fa-headphones',
  description: 'Audio player for podcasts, music, or voice recordings. Supports custom cover image and episode info.',
  fieldsArray: [
    { name: 'audioUrl', type: 'url', title: 'Audio URL', description: 'Direct URL to audio file (mp3, wav, ogg)' },
    { name: 'coverImage', type: 'image', title: 'Cover Image', description: 'Album art or episode thumbnail' },
    { name: 'title', type: 'text', title: 'Episode/Track Title' },
    { name: 'description', type: 'richtext', title: 'Description', placeholder: 'Episode description or track info' },
    { name: 'artist', type: 'text', title: 'Artist/Podcast Name' },
    { name: 'showControls', type: 'select', title: 'Show Controls', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }], defaultValue: 'true' },
    { name: 'autoPlay', type: 'select', title: 'Auto Play', options: [{ label: 'No', value: 'false' }, { label: 'Yes', value: 'true' }], defaultValue: 'false' },
    { name: 'loop', type: 'select', title: 'Loop', options: [{ label: 'No', value: 'false' }, { label: 'Yes', value: 'true' }], defaultValue: 'false' },
    { name: 'style', type: 'select', title: 'Player Style', options: [{ label: 'Minimal', value: 'minimal' }, { label: 'Card with Cover', value: 'card' }, { label: 'Full Width', value: 'full' }], defaultValue: 'card' },
    { name: 'backgroundColor', type: 'color', title: 'Background Color', defaultValue: '#f3f4f6' },
    { name: 'textColor', type: 'color', title: 'Text Color', defaultValue: '#000000' },
    { name: 'accentColor', type: 'color', title: 'Accent Color', defaultValue: '#5B6EF5' },
    { name: 'sectionId', type: 'text', title: 'Section ID (anchor)' },
  ],
});