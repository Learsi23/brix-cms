// ====================================================================
// TIPOS DEL SISTEMA DE BLOQUES - EDEN CMS
// ====================================================================
// Equivalente TypeScript al sistema de Fields y BlockType de .NET
// ====================================================================

/** Tipos de campo disponibles — equivalentes a los Fields de .NET */
export type FieldType =
  | 'string'          // StringField
  | 'textarea'        // TextAreaField
  | 'color'           // ColorField
  | 'image'           // ImageField
  | 'markdown'        // MarkdownField
  | 'select'          // SelectField<string>
  | 'bool'            // BoolField
  | 'number'          // NumberField
  | 'url'             // UrlField
  | 'product-select'   // Selector dinámico de productos (carga /api/product)
  | 'category-select'; // Selector dinámico de categorías (carga /api/category)

/** Opción para campos de tipo select */
export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

/** Definición de un campo dentro de un bloque */
export interface FieldDefinition {
  type: FieldType;
  title: string;
  placeholder?: string;
  description?: string;
  /** Solo para type === 'select' */
  options?: SelectOption[];
  /** Valor por defecto */
  defaultValue?: string;
}

/** Definición de un tipo de bloque (equivalente a [BlockType(...)] en .NET) */
export interface BlockDefinition {
  /** Identificador único: "HeroBlock", "TextBlock", etc. */
  type: string;
  /** Nombre visible en el editor */
  name: string;
  /** Categoría para agrupar en el selector: "Blocks", "Content", "Media", "Columns" */
  category: string;
  /** Icono emoji */
  icon: string;
  /** Si es true, puede contener bloques hijos (ColumnBlock, GalleryBlock) */
  isGroup?: boolean;
  /** Descripción corta del bloque — se muestra en el tooltip del editor y la usa la IA */
  description?: string;
  /** Campos del bloque — equivalentes a las propiedades con [Field] en .NET */
  fields: Record<string, FieldDefinition>;
}

// ====================================================================
// FORMATO DE DATOS EN BASE DE DATOS
// ====================================================================
// Los datos de cada bloque se almacenan como JSON en `jsonData`
// Cada campo se almacena como: { "Value": "..." }
// Igual que en Brix.Pro .NET
//
// Ejemplo de jsonData de un HeroBlock:
// {
//   "Title": { "Value": "Mi Título" },
//   "TitleColor": { "Value": "#333333" },
//   "Background": { "Value": "/uploads/hero.jpg", "AltText": "Imagen hero" }
// }
// ====================================================================

/** Valor de un campo simple */
export interface FieldValue {
  Value: string;
  [key: string]: unknown;
}

/** Datos completos de un bloque (jsonData deserializado) */
export type BlockData = Record<string, FieldValue>;

/** Bloque tal como viene de la API */
export interface BlockDto {
  id: string;
  type: string;
  sortOrder: number;
  jsonData: string | null;
  pageId: string;
  parentId: string | null;
  /** Datos parseados de jsonData */
  data?: BlockData;
}

/** DTO para publicar bloques (igual que PublishPageDto en .NET) */
export interface PublishBlockDto {
  originalId: string;
  type: string;
  jsonData: string;
  sortOrder: number;
  parentId: string | null;
}

export interface PublishPageDto {
  title: string;
  slug: string;
  description?: string;
  ogImage?: string;
  jsonData?: string;
  blocks: PublishBlockDto[];
}

// Utilidades

/** Obtiene el valor de un campo del bloque, con fallback */
export function getFieldValue(data: BlockData | undefined, field: string, fallback = ''): string {
  return data?.[field]?.Value ?? fallback;
}

/** Crea un BlockData vacío con los valores por defecto de una definición */
export function createDefaultData(def: BlockDefinition): BlockData {
  const data: BlockData = {};
  for (const [key, field] of Object.entries(def.fields)) {
    data[key] = { Value: field.defaultValue ?? '' };
  }
  return data;
}
