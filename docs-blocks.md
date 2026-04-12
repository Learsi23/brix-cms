# Brix — Guía para crear Bloques

Los **bloques** son las unidades atómicas de contenido del CMS. Cada página está compuesta por una lista de bloques ordenados que el editor puede añadir, reordenar y configurar.

Este sistema es idéntico al de Brix.Pro (.NET), traducido a TypeScript.

---

## Estructura de un Bloque

Un bloque tiene tres partes:

| Parte | Ubicación | Descripción |
|-------|-----------|-------------|
| **Definición** | `src/lib/blocks/definitions/` | Declara los campos editables (equivalente a la clase C# con `[BlockType]` y `[Field]`) |
| **Componente** | `src/components/blocks/` | Renderiza el bloque en el frontend |
| **Registro** | `src/lib/blocks/index.ts` | Importa la definición para que quede disponible |

---

## Paso 1 — Crear la definición del bloque

Crea un archivo en `src/lib/blocks/definitions/mi-bloque.ts`:

```typescript
import { registerBlock } from '../registry';

registerBlock({
  type: 'MiBloque',          // Nombre único — sin espacios
  name: 'Mi Bloque',         // Nombre visible en el editor
  category: 'Contenido',     // Grupo en el selector: Bloques, Contenido, Media, Columnas
  icon: '🎨',                // Emoji o clase CSS

  fields: {
    // Cada clave es el nombre del campo (se guarda en la BD como { "Value": "..." })
    Titulo: {
      type: 'string',
      title: 'Título',
      placeholder: 'Escribe el título aquí',
    },
    Descripcion: {
      type: 'textarea',
      title: 'Descripción',
      description: 'Texto largo opcional',
    },
    ColorFondo: {
      type: 'color',
      title: 'Color de Fondo',
      defaultValue: '#ffffff',
    },
    Imagen: {
      type: 'image',
      title: 'Imagen',
    },
    Alineacion: {
      type: 'select',
      title: 'Alineación',
      options: [
        { value: 'left',   label: 'Izquierda' },
        { value: 'center', label: 'Centro' },
        { value: 'right',  label: 'Derecha' },
      ],
      defaultValue: 'left',
    },
    MostrarBoton: {
      type: 'bool',
      title: '¿Mostrar botón?',
      defaultValue: 'false',
    },
    Tamanio: {
      type: 'number',
      title: 'Tamaño (px)',
      defaultValue: '16',
    },
  },
});
```

### Tipos de campo disponibles

| Tipo | Descripción | Input en el editor |
|------|-------------|-------------------|
| `string` | Texto de una línea | `<input type="text">` |
| `textarea` | Texto multilínea | `<textarea>` |
| `color` | Selector de color | Color picker + texto hex |
| `image` | URL de imagen | Ruta + preview |
| `markdown` | Contenido Markdown | Editor de texto |
| `select` | Lista desplegable | `<select>` con `options` |
| `bool` | Verdadero/Falso | Checkbox |
| `number` | Número | `<input type="number">` |
| `url` | Enlace URL | `<input type="url">` |

---

## Paso 2 — Crear el componente del bloque

Crea `src/components/blocks/MiBloque.tsx`:

```tsx
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function MiBloque({ data }: { data: BlockData }) {
  // getFieldValue(data, 'NombreCampo', 'valorPorDefecto')
  const titulo = getFieldValue(data, 'Titulo', '');
  const descripcion = getFieldValue(data, 'Descripcion', '');
  const colorFondo = getFieldValue(data, 'ColorFondo', '#ffffff');
  const imagen = getFieldValue(data, 'Imagen', '');
  const alineacion = getFieldValue(data, 'Alineacion', 'left');
  const mostrarBoton = getFieldValue(data, 'MostrarBoton') === 'true';

  return (
    <section style={{ backgroundColor: colorFondo, textAlign: alineacion as 'left' | 'center' | 'right' }}>
      {imagen && <img src={imagen} alt={titulo} className="w-full" />}
      {titulo && <h2 className="text-2xl font-bold">{titulo}</h2>}
      {descripcion && <p>{descripcion}</p>}
      {mostrarBoton && <button>Click aquí</button>}
    </section>
  );
}
```

---

## Paso 3 — Registrar la definición

Añade el import en `src/lib/blocks/index.ts`:

```typescript
// Añade esta línea junto al resto de imports
import './definitions/mi-bloque';
```

---

## Paso 4 — Añadir el renderer

En `src/components/blocks/BlockRenderer.tsx`, añade un `case` en el switch:

```typescript
import MiBloque from './MiBloque';

// Dentro del switch(type):
case 'MiBloque':
  return <MiBloque data={data} />;
```

---

## Bloques contenedores (isGroup: true)

Los bloques contenedores pueden tener **bloques hijos** (como `ColumnBlock` o `GalleryBlock`).

Para crear uno, añade `isGroup: true` en la definición:

```typescript
registerBlock({
  type: 'MiContenedor',
  name: 'Mi Contenedor',
  category: 'Columnas',
  icon: '⬜',
  isGroup: true,  // ← puede contener bloques hijos
  fields: { ... },
});
```

El componente recibe la prop `children` con los bloques hijos:

```tsx
import BlockRenderer from './BlockRenderer';

interface Props {
  data: BlockData;
  children?: Array<{ id: string; type: string; jsonData: string | null }>;
}

export default function MiContenedor({ data, children = [] }: Props) {
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
```

---

## Formato de datos en la base de datos

Cada bloque guarda sus campos en una columna `jsonData` con este formato:

```json
{
  "Titulo":      { "Value": "Hola mundo" },
  "ColorFondo":  { "Value": "#f0f0f0" },
  "Imagen":      { "Value": "/uploads/foto.jpg" },
  "Alineacion":  { "Value": "center" }
}
```

Esto es idéntico al formato de Brix.Pro (.NET) — los datos son completamente portables entre ambos sistemas.

---

## Estructura de archivos resultante

```
src/
├── lib/blocks/
│   ├── types.ts              ← Tipos TypeScript (FieldType, BlockDefinition, etc.)
│   ├── registry.ts           ← Registro de bloques
│   ├── index.ts              ← Importa todas las definiciones + re-exporta
│   └── definitions/
│       ├── hero-block.ts
│       ├── text-block.ts
│       ├── image-block.ts
│       ├── markdown-block.ts
│       ├── column-block.ts
│       ├── gallery-block.ts
│       ├── button-link-block.ts
│       └── mi-bloque.ts      ← Tu nuevo bloque
│
└── components/blocks/
    ├── BlockRenderer.tsx     ← Switch de tipo → componente
    ├── HeroBlock.tsx
    ├── TextBlock.tsx
    ├── ImageBlock.tsx
    ├── MarkdownBlock.tsx
    ├── ColumnBlock.tsx
    ├── GalleryBlock.tsx
    ├── ButtonLinkBlock.tsx
    └── MiBloque.tsx          ← Tu nuevo componente
```

---

## Comandos útiles

```bash
# Primera vez (inicializar base de datos)
npx prisma db push

# Ver la BD con interfaz visual
npx prisma studio

# Iniciar el servidor de desarrollo
npm run dev

# Admin del CMS
http://localhost:3000/admin
```
