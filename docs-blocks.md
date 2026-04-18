# Brix — Guide for creating Blocks

**Blocks** are the atomic units of content of the CMS. Each page is composed of an ordered list of blocks that the editor can add, reorder, and configure.

This system is identical to Brix.Pro (.NET), translated to TypeScript.

---

## Structure of a Block

A block has three parts:

| Part | Location | Description |
|------|----------|-------------|
| **Definition** | `src/lib/blocks/definitions/` | Declares the editable fields (equivalent to the C# class with `[BlockType]` and `[Field]`) |
| **Component** | `src/components/blocks/` | Renders the block on the frontend |
| **Registration** | `src/lib/blocks/index.ts` | Imports the definition to make it available |

---

## Step 1 — Create the block definition

Create a file in `src/lib/blocks/definitions/my-block.ts`:

```typescript
import { registerBlock } from '../registry';

registerBlock({
  type: 'MyBlock',          // Unique name — no spaces
  name: 'My Block',         // Visible name in the editor
  category: 'Content',      // Group in the selector: Blocks, Content, Media, Columns
  icon: '🎨',                // Emoji or CSS class

  fields: {
    // Each key is the field name (saved in the DB as { "Value": "..." })
    Title: {
      type: 'string',
      title: 'Title',
      placeholder: 'Write the title here',
    },
    Description: {
      type: 'textarea',
      title: 'Description',
      description: 'Optional long text',
    },
    BackgroundColor: {
      type: 'color',
      title: 'Background Color',
      defaultValue: '#ffffff',
    },
    Image: {
      type: 'image',
      title: 'Image',
    },
    Alignment: {
      type: 'select',
      title: 'Alignment',
      options: [
        { value: 'left',   label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right',  label: 'Right' },
      ],
      defaultValue: 'left',
    },
    ShowButton: {
      type: 'bool',
      title: 'Show button?',
      defaultValue: 'false',
    },
    Size: {
      type: 'number',
      title: 'Size (px)',
      defaultValue: '16',
    },
  },
});
Available field types
Type	Description	Editor input
string	Single-line text	<input type="text">
textarea	Multi-line text	<textarea>
color	Color picker	Color picker + hex text
image	Image URL	Path + preview
markdown	Markdown content	Text editor
select	Dropdown list	<select> with options
bool	True/False	Checkbox
number	Number	<input type="number">
url	Link URL	<input type="url">
Step 2 — Create the block component
Create src/components/blocks/MyBlock.tsx:

tsx
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function MyBlock({ data }: { data: BlockData }) {
  // getFieldValue(data, 'FieldName', 'defaultValue')
  const title = getFieldValue(data, 'Title', '');
  const description = getFieldValue(data, 'Description', '');
  const backgroundColor = getFieldValue(data, 'BackgroundColor', '#ffffff');
  const image = getFieldValue(data, 'Image', '');
  const alignment = getFieldValue(data, 'Alignment', 'left');
  const showButton = getFieldValue(data, 'ShowButton') === 'true';

  return (
    <section style={{ backgroundColor: backgroundColor, textAlign: alignment as 'left' | 'center' | 'right' }}>
      {image && <img src={image} alt={title} className="w-full" />}
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      {description && <p>{description}</p>}
      {showButton && <button>Click here</button>}
    </section>
  );
}
Step 3 — Register the definition
Add the import in src/lib/blocks/index.ts:

typescript
// Add this line along with the other imports
import './definitions/my-block';
Step 4 — Add the renderer
In src/components/blocks/BlockRenderer.tsx, add a case to the switch:

typescript
import MyBlock from './MyBlock';

// Inside the switch(type):
case 'MyBlock':
  return <MyBlock data={data} />;
Container blocks (isGroup: true)
Container blocks can have child blocks (like ColumnBlock or GalleryBlock).

To create one, add isGroup: true in the definition:

typescript
registerBlock({
  type: 'MyContainer',
  name: 'My Container',
  category: 'Columns',
  icon: '⬜',
  isGroup: true,  // ← can contain child blocks
  fields: { ... },
});
The component receives the children prop with the child blocks:

tsx
import BlockRenderer from './BlockRenderer';

interface Props {
  data: BlockData;
  children?: Array<{ id: string; type: string; jsonData: string | null }>;
}

export default function MyContainer({ data, children = [] }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {children.map(child => {
        const childData = child.jsonData ? JSON.parse(child.jsonData) : {};
        return (
          <div key={child.id}>
            <BlockRenderer type={child.type} data={childData} />
          </div>
        );
      })}
    </div>
  );
}
Database data format
Each block saves its fields in a jsonData column with this format:

json
{
  "Title":      { "Value": "Hello world" },
  "BackgroundColor":  { "Value": "#f0f0f0" },
  "Image":      { "Value": "/uploads/photo.jpg" },
  "Alignment":  { "Value": "center" }
}
This is identical to the Brix.Pro (.NET) format — the data is completely portable between both systems.

Resulting file structure
text
src/
├── lib/blocks/
│   ├── types.ts              ← TypeScript types (FieldType, BlockDefinition, etc.)
│   ├── registry.ts           ← Block registry
│   ├── index.ts              ← Imports all definitions + re-exports
│   └── definitions/
│       ├── hero-block.ts
│       ├── text-block.ts
│       ├── image-block.ts
│       ├── markdown-block.ts
│       ├── column-block.ts
│       ├── gallery-block.ts
│       ├── button-link-block.ts
│       └── my-block.ts       ← Your new block
│
└── components/blocks/
    ├── BlockRenderer.tsx     ← Type → component switch
    ├── HeroBlock.tsx
    ├── TextBlock.tsx
    ├── ImageBlock.tsx
    ├── MarkdownBlock.tsx
    ├── ColumnBlock.tsx
    ├── GalleryBlock.tsx
    ├── ButtonLinkBlock.tsx
    └── MyBlock.tsx           ← Your new component
Useful commands
bash
# First time (initialize database)
npx prisma db push

# View the DB with visual interface
npx prisma studio

# Start the development server
npm run dev

# CMS Admin
http://localhost:3000/admin