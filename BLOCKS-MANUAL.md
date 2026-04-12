# Brix - Manual Técnico Completo

## Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Sistema de Páginas y Bloques](#sistema-de-páginas-y-bloques)
3. [Bloques Contenedor](#bloques-contenedor)
4. [Bloques de Contenido](#bloques-de-contenido)
5. [Bloques de Media](#bloques-de-media)
6. [Bloques de Ecommerce](#bloques-de-ecommerce)
7. [Bloques de Layout](#bloques-de-layout)
8. [Navbar](#navbar)
9. [Footer](#footer)
10. [Color de Fondo de Página](#color-de-fondo-de-página)
11. [Guía para Crear Páginas](#guía-para-crear-páginas)
12. [Generador de Páginas con IA](#generador-de-páginas-con-ia)

---

## Arquitectura General

Brix es un sistema de gestión de contenido basado en Next.js que permite crear páginas dinámicas mediante bloques modulares.

### Componentes Principales

- **Page**: Entidad en la base de datos que contiene título, slug, configuración y referencias a bloques
- **Block**: Unidad atómica de contenido que se renderiza en la página
- **BlockRenderer**: Componente que decide qué componente renderizar según el tipo de bloque
- **DynamicNavbar/Footer**: Componentes que leen la configuración global del sitio

### Flujo de Renderizado

```
URL → [[...slug]]/page.tsx
  → Buscar página por slug en DB
  → Obtener bloques asociados (root + hijos)
  → Leer BackgroundColor de page.jsonData
  → Renderizar BlockRenderer para cada bloque
```

---

## Sistema de Páginas y Bloques

### Estructura de Datos

**Page (Prisma)**
- `id`: ID único
- `title`: Título de la página
- `slug`: URL amigable (único)
- `jsonData`: JSON con configuración (backgroundColor, etc.)
- `isPublished`: Boolean para publicar
- `blocks`: Relación uno-a-muchos con Block

**Block (Prisma)**
- `id`: ID único
- `type`: Tipo de bloque ("HeroBlock", "ColumnBlock", etc.)
- `sortOrder`: Orden de renderizado
- `jsonData`: JSON con datos del bloque, formato `{ "Campo": { "Value": "valor" } }`
- `pageId`: Clave foránea a Page
- `parentId`: ID del bloque padre (para bloques anidados)

---

## Bloques Contenedor

Los bloques contenedor tienen `isGroup: true` y pueden contener bloques hijos (children).

> **IMPORTANTE**: Solo `ColumnBlock` y `GridColumn` son contenedores válidos para el sistema de IA. Los demás bloques listados como "isGroup" tienen su propio sistema de hijos específico.

### 1. ColumnBlock (Columnas)

**Propósito**: Contenedor que organiza bloques hijos en columnas responsivas (flex row). Ideal para 2-4 items lado a lado.

**Tipo**: `ColumnBlock`
**Categoría**: Layout (isGroup: true)

**Campos Configurables**:

| Campo | Tipo | Valores | Default | Descripción |
|-------|------|---------|---------|-------------|
| Gap | select | gap-0, gap-2, gap-4, gap-6, gap-8, gap-12 | gap-6 | Espacio entre columnas |

> Para controlar el número de columnas, agrega la cantidad de hijos directos que desees (1-4).

**Uso Típico**:
```
ColumnBlock (2 columnas = 2 hijos directos)
  ├── TextBlock (izquierda)
  └── ImageBlock (derecha)
```

---

### 2. GridColumn (Columna en Grid)

**Propósito**: Grid CSS responsivo. Usar para 5+ productos/cards o grids grandes con título de sección.

**Tipo**: `GridColumn`
**Categoría**: Layout (isGroup: true)

**Campos Configurables**:

| Campo | Tipo | Valores/Placeholder | Default | Descripción |
|-------|------|---------------------|---------|-------------|
| MaxColumns | string | 1-6 | 3 | Columnas máx en desktop |
| Gap | string | gap-4, gap-6, gap-8 | gap-6 | Espacio entre items |
| PaddingY | string | 3rem, 48px | 3rem | Padding vertical |
| PaddingX | string | 1.5rem, 24px | 1.5rem | Padding horizontal |
| BackgroundColor | color | - | transparent | Color de fondo |
| BackgroundImage | image | - | - | Imagen de fondo |
| ItemsAlign | select | start, center, end, stretch | stretch | Alineación de items |
| SectionId | string | servicios | - | ID ancla (#) |
| TitleSida | string | - | - | Eyebrow (sobre el título) |
| TitleSidaColor | color | - | - | Color del eyebrow |
| TitleSidaSize | string | 1rem, 16px | - | Tamaño del eyebrow |
| TitleSidaAlign | select | left, center, right | left | Alineación del eyebrow |
| Title | string | - | - | Título principal |
| TitleColor | color | - | - | Color del título |
| TitleSize | string | 2rem, 32px | - | Tamaño del título |
| SubTitle | string | - | - | Subtítulo |
| SubTitleColor | color | - | - | Color del subtítulo |
| SubTitleSize | string | 1.1rem, 18px | - | Tamaño del subtítulo |
| Description | textarea | - | - | Descripción (debajo del subtítulo) |
| DescriptionColor | color | - | - | Color de la descripción |
| HeaderTextAlign | select | left, center, right | left | Alineación del header |

**Regla para productos**: ≤4 productos → usa `ColumnBlock`; 5+ productos → usa `GridColumn` con `MaxColumns "2"`.

---

### 3. ProductColumnBlock (Columna de Productos)

**Propósito**: Catálogo completo de productos con sidebar de categorías y grid de productos. Carga automáticamente de la base de datos.

**Tipo**: `ProductColumnBlock`
**Categoría**: Ecommerce (isGroup: true)

**Campos Configurables**:

| Campo | Tipo | Valores/Placeholder | Default | Descripción |
|-------|------|---------------------|---------|-------------|
| Title | string | Our Products | - | Título del bloque |
| TitleColor | color | - | #1e293b | Color del título |
| TitleSize | string | 32px | 32px | Tamaño del título |
| SubTitle | string | - | - | Subtítulo |
| ShowSidebar | bool | true/false | true | Mostrar sidebar de categorías |
| Columns | string | 4 | 4 | Productos por fila |
| ProductsPerPage | string | 12 | 12 | Productos por página |
| BackgroundColor | color | - | #f8fafc | Color de fondo |
| CardBgColor | color | - | #ffffff | Fondo de las tarjetas |
| AccentColor | color | - | #2563eb | Color de acento (botones) |
| PaddingY | string | 3rem | 3rem | Padding vertical |
| ShowStock | bool | true/false | true | Mostrar badge de stock |
| ShowRating | bool | true/false | false | Mostrar estrellas de rating |
| ButtonText | string | Add to cart | Add to cart | Texto del botón |
| FilterCategories | string | Manga, Novela | - | Filtrar por categorías (vacío = todos) |

**Nota**: Usa este bloque cuando el usuario quiere un catálogo/tienda completa con filtrado por categorías. Carga productos de DB automáticamente.

---

### 4. GalleryBlock (Galería)

**Propósito**: Galería de imágenes en grid responsivo. Seleccionar múltiples imágenes de la biblioteca de medios.

**Tipo**: `GalleryBlock`
**Categoría**: Media (isGroup: true)

**Campos**:
- Title, TitleColor, TitleSize
- LayoutType: carousel/grid/masonry
- AutoPlay, AutoPlayInterval (3000ms)
- ShowArrows, ShowDots, InfiniteLoop
- ItemsPerView (3), Gap (16px), ItemHeight (300px)
- BackgroundColor (transparent), Padding (20px), BorderRadius

**Hijos**: ImageBlock

---

### 5. ProductsGalleryBlock (Galería de Productos)

**Propósito**: Renderiza automáticamente TODOS los productos publicados.

**Tipo**: `ProductsGalleryBlock`
**Categoría**: Media (isGroup: true)

**Campos**:
- Title, TitleColor, TitleSize
- CardsPerView (3), Gap (16px)
- BackgroundColor, Padding, BorderRadius

---

## Bloques de Contenido

Los bloques de contenido son hojas (leaf blocks) — **no tienen hijos**.

### 6. HeroBlock (Sección Hero)

**Propósito**: Banner principal de página completa con imagen de fondo, título y subtítulo.

**Tipo**: `HeroBlock`
**Categoría**: Content

**Campos**:

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| Title | string | - | Título principal |
| TitleColor | color | #ffffff | Color del título |
| TitleSize | string | 56px | Tamaño (siempre en px: 56px, 64px) |
| Subtitle | string | - | Subtítulo |
| SubtitleColor | color | #ffffff | Color del subtítulo |
| SubtitleSize | string | 20px | Tamaño (en px) |
| Description | string | - | Descripción |
| Background | image | - | Imagen de fondo |

> **Nota IA**: Usa siempre valores en px para los tamaños (56px, 64px). Nunca clases Tailwind (text-5xl).

---

### 7. TextBlock (Bloque de Texto)

**Propósito**: Bloque de texto versátil con título, subtítulo y cuerpo. Control total sobre tipografía, colores, alineación y márgenes.

**Tipo**: `TextBlock`
**Categoría**: Content

**Campos**:

**Posición**:
- VerticalPosition: top/middle/bottom
- HorizontalPosition: left/center/right

**Márgenes** (cada lado):
- MarginTop, MarginBottom, MarginLeft, MarginRight (ej: 0, 10px, 1rem)

**Padding** (cada lado):
- PaddingTop, PaddingBottom, PaddingLeft, PaddingRight

**Título**:
- Title, TitleColor, TitleSize (en px: 32px, 28px), TitleAlignment (left/center/right)

**Subtítulo**:
- Subtitle, SubtitleColor, SubtitleSize (en px: 18px), SubtitleAlignment

**Cuerpo**:
- Body (textarea), BodyColor, BodySize (en px: 16px), BodyAlignment (incluye justify)

---

### 8. ImageBlock (Imagen Simple)

**Propósito**: Imagen simple con texto alternativo y tamaño/alineación configurables.

**Tipo**: `ImageBlock`
**Categoría**: Content

**Campos**:
- Source: image
- AltText: string (texto alternativo)

---

### 9. CardBlock (Tarjeta Universal)

**Propósito**: Tarjeta visual con imagen, título, descripción y botón. Soporta layout vertical, horizontal y overlay. Ideal para grids de servicios/características.

**Tipo**: `CardBlock`
**Categoría**: Content

**Campos**:

**Contenido**:
- Title, TitleColor (#1f293b), TitleSize (1.5rem)
- Badge (subtítulo), BadgeColor, BadgeSize (0.875rem)
- Description, DescriptionColor, DescriptionSize

**Imagen e Icono**:
- Image, ImageHeight (250px)
- IconClass (FontAwesome: fas fa-rocket)

**Acción**:
- TargetUrl, ButtonText (Learn more)
- AccentColor (#3b82f6), ButtonTextColor (#ffffff)
- HoverColor, BorderRadius, Border, Padding
- ButtonPosition: left/center/right

**Layout**:
- LayoutType: vertical/horizontal/overlay
- UseGlassmorphism: Yes/No
- CardBgColor (#ffffff)

---

### 10. IconCardBlock (Tarjeta con Icono)

**Propósito**: Tarjeta con icono grande, título y descripción. Perfecto para listar características, servicios o beneficios en un grid de 3-4 columnas.

**Tipo**: `IconCardBlock`
**Categoría**: Content

**Campos**:

**Contenedor**:
- BackgroundColor, BorderColor
- BorderRadius (12px), BorderWidth (1px), Padding (1.5rem)
- Shadow (0 4px 20px rgba(0,0,0,0.1))

**Layout**:
- IconPosition: top/left/right
- TextAlign: left/center/right

**Icono Izquierdo**:
- LeftIcon (image), LeftIconSize (48px)
- LeftIconClass (FontAwesome: fas fa-star), LeftIconColor
- LeftIconFaSize (2rem)

**Icono Derecho** (decorativo):
- RightIcon, RightIconSize (32px)
- RightIconClass, RightIconColor

**Textos**:
- Title, TitleColor, TitleSize (1.25rem)
- Subtitle, SubtitleColor, SubtitleSize (1rem)
- Text, TextColor, TextSize (0.95rem)
- MarkDown, MarkDownColor

**Link (CTA)**:
- LinkUrl (/servicios o https://...)
- LinkText (Ver más)
- LinkBgColor, LinkTextColor
- LinkNewTab: true/false

---

### 11. ButtonLinkBlock (Botón Link)

**Propósito**: Botón o link con estilos. CTA simple, link interno o externo.

**Tipo**: `ButtonLinkBlock`
**Categoría**: Content

**Campos**:
- Text, Url
- Color (#10b981), HoverColor (#059669)
- TextColor (#ffffff)
- BorderRadius (8px, 9999px)
- Border, Width (200px, auto, 100%)
- Padding (12px 24px)
- ButtonPosition: left/center/right

---

### 12. CTABannerBlock (Banner CTA)

**Propósito**: Banner llamada-a-la-acción con fondo de color, texto y botón. Ideal para cerrar secciones.

**Tipo**: `CTABannerBlock`
**Categoría**: Content

**Campos**:
- Title, TitleColor (#ffffff), TitleSize (2rem)
- Subtitle, SubtitleColor (rgba blanco)
- Btn1Text, Btn1Url, Btn1BgColor, Btn1TextColor
- Btn2Text, Btn2Url, Btn2Color
- BackgroundColor (#10b981), BackgroundColor2 (degradado)
- BackgroundImage
- PaddingY (5rem)
- TextAlign: left/center/right

---

### 13. StatsBlock (Estadísticas)

**Propósito**: Bloque de estadísticas numéricas impactantes (ej. 500+ clientes, 98% satisfacción).

**Tipo**: `StatsBlock`
**Categoría**: Content

**Campos**:
- Title, TitleColor (#111827)
- Subtitle, SubtitleColor (#6b7280)
- Stat1Number (ej: +500), Stat1Label, Stat1Icon (fas fa-users)
- Stat2Number, Stat2Label, Stat2Icon
- Stat3Number, Stat3Label, Stat3Icon
- Stat4Number, Stat4Label, Stat4Icon
- NumberColor (#10b981), LabelColor (#6b7280)
- BackgroundColor (#1e293b), CardBgColor (#ffffff)
- PaddingY (4rem)

---

### 14. MarkdownBlock (Markdown)

**Propósito**: Renderiza contenido en formato Markdown. Ideal para textos largos, documentación o artículos con formato.

**Tipo**: `MarkdownBlock`
**Categoría**: Content

**Campos**:
- Content (tipo markdown: **negrita**, ## encabezados, - listas, etc.)

---

### 15. LogoStripBlock (Banda de Logos)

**Propósito**: Banda horizontal de logos de marcas/partners.

**Tipo**: `LogoStripBlock`
**Categoría**: Content

**Campos**:
- Heading, HeadingColor
- Logo1 (image), Logo1Url ... Logo6, Logo6Url
- LogoHeight (48px), Grayscale (true/false)
- BackgroundColor, PaddingY

---

### 16. ContactFormBlock (Formulario de Contacto)

**Propósito**: Formulario de contacto configurable.

**Tipo**: `ContactFormBlock`
**Categoría**: AI/Email

**Campos**:
- Title, RecipientEmail
- Text (botón), Color, HoverColor, BorderRadius, Border
- Width, Padding, TextColor
- ButtonPosition (left/center/right)

---

### 17. ChatBlock (Chat)

**Propósito**: Widget de chat con IA.

**Tipo**: `ChatBlock`
**Categoría**: AI/Email

**Campos**:
- CustomPrompt, WelcomeMessage
- Logo (image), LogoSize, Ai_Logo (image), Ai_LogoSize
- Title, TitleColor, TitleSize, BackgroundColor

---

## Bloques de Media

### 18. VideoBlock (Video)

**Propósito**: Video embebido de YouTube o Vimeo. Solo requiere la URL pública.

**Tipo**: `VideoBlock`
**Categoría**: Media

**Campos**:
- VideoUrl (YouTube/Vimeo)
- AspectRatio (16/9, 4/3, 1/1)
- MaxWidth (900px)
- Title, TitleColor, Subtitle, SubtitleColor
- TextAlign: left/center/right
- BackgroundColor, PaddingY (2rem)

---

### 19. MapBlock (Mapa)

**Propósito**: Mapa embebido con tarjeta de información.

**Tipo**: `MapBlock`
**Categoría**: Media

**Campos**:
- Address, Zoom (15), MapType (roadmap)
- Title, TitleColor, Subtitle, SubtitleColor
- PlaceName, AddressDisplay, Phone, Email, Hours
- ShowInfoCard (true/false), CardBgColor, CardTextColor
- MapHeight (450px), MaxWidth (100%), BorderRadius (16px)
- BackgroundColor, TextAlign, PaddingY (3rem)

---

### 20. FlexibleImageTextBlock

**Propósito**: Imagen y texto en layout flexible (alternado izquierda/derecha).

**Tipo**: `FlexibleImageTextBlock`
**Categoría**: Media

**Campos**:
- Layout: image-left/image-right
- Image (image), ImageWidth, ImageMaxWidth, ImageBorderRadius (rounded-xl)
- Title, TitleColor, TitleSize, TitleWeight (bold)
- SubTitle, SubTitleColor, SubTitleSize
- Text, TextColor, TextSize
- ButtonText, ButtonLink (URL), ButtonStyle (primary/outline)
- BackgroundColor, PaddingVertical (3rem), PaddingHorizontal (2rem)
- Gap (2rem)

---

### 21. DropdownBlock (Dropdown/FAQ)

**Propósito**: Acordeón estilo dropdown. Ideal para FAQs o contenido colapsable. Un bloque por pregunta.

**Tipo**: `DropdownBlock`
**Categoría**: Media

**Campos**:
- Title, TitleColor, TitleSize
- BackgroundColor, BackgroundGradient
- Question, QuestionColor, QuestionSize
- Answer, AnswerColor, AnswerSize
- DropdownBackgroundColor (#f8f9fa)
- OpenByDefault: true/false

---

## Bloques de Ecommerce

### 22. ProductCardBlock

**Propósito**: Tarjeta de producto individual para e-commerce.

**Tipo**: `ProductCardBlock`
**Categoría**: Ecommerce

**Campos**:
- ProductId: **SIEMPRE dejar vacío ""** — el sistema lo asigna automáticamente
- Name, Description, Price (29.99), Stock (50)
- Image (image)
- ButtonText (Add to cart)
- BackgroundColor (#ffffff)

---

### 23. CatalogItemBlock

**Propósito**: Tarjeta de producto rica con variantes, badges y ratings.

**Tipo**: `CatalogItemBlock`
**Categoría**: Ecommerce

**Campos**:
- ProductId: **SIEMPRE dejar vacío ""**
- Name, ShortDescription, LongDescription
- Image (image), Price, OriginalPrice (si hay oferta), CurrencySymbol (€/$)
- Stock, Category, Tags (nuevo,oferta)
- Sizes (S,M,L,XL), Colors (Rojo,Azul), CustomOptions
- Badge (Nuevo/Oferta/Bestseller), BadgeColor
- Rating (4.5), ReviewCount (128), ShowRating (true)
- ButtonText (Add to cart), BackgroundColor (#ffffff)

---

### 24. EmailButtonBlock

**Propósito**: Botón que abre cliente de email.

**Tipo**: `EmailButtonBlock`
**Categoría**: Ecommerce

**Campos**:
- Text, EmailAddress, Subject, Body
- BackgroundColor, HoverColor, TextColor
- BorderRadius (8px), Border, Width, Padding
- Position (center)

---

## Bloques de Layout

### 25. SpacerBlock (Espaciador)

**Propósito**: Espacio vacío configurable por altura. Separa secciones.

**Tipo**: `SpacerBlock`
**Categoría**: Layout

**Campos**:
- Height (3rem)
- BackgroundColor (transparent)

---

### 26. DividerBlock (Divisor)

**Propósito**: Línea divisoria horizontal con estilos configurables.

**Tipo**: `DividerBlock`
**Categoría**: Layout

**Campos**:
- Style: solid/dashed/dotted/double
- Color (#e2e8f0)
- Thickness (1px)
- Width (100%)
- PaddingY (1.5rem)

---

### 27. TextWithButtonBlock

**Propósito**: Bloque de texto con botón integrado.

**Tipo**: `TextWithButtonBlock`
**Categoría**: Interactive

**Campos**:
- Title, TitleColor, TitleSize
- Subtitle, SubtitleColor, SubtitleSize
- Description, DescriptionColor, DescriptionSize
- ButtonText, ButtonUrl, ButtonColor, ButtonTextColor
- ButtonBorderRadius, ButtonPosition (center)

---

## Navbar

### DynamicNavbar.tsx

Componente de navegación que lee la configuración desde `SiteConfig` con clave `site`.

**Ubicación**: `src/components/DynamicNavbar.tsx`

**Datos leídos de la base de datos**:
```json
{
  "navbar": {
    "backgroundColor": "#ffffff",
    "textColor": "#000000",
    "logo": "URL del logo",
    "logoAltText": "Logo",
    "logoWidth": "150px",
    "logoLink": "/",
    "isSticky": true,
    "hasShadow": true,
    "paddingVertical": "py-3",
    "menuItems": [
      {
        "customText": "Inicio",
        "customUrl": "",
        "isCustomUrl": false,
        "pageSlug": "home"
      }
    ]
  }
}
```

**Campos Configurables**:

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| backgroundColor | color | #ffffff | Color de fondo |
| textColor | color | #000000 | Color del texto |
| logo | string | - | URL del logo |
| logoAltText | string | Logo | Texto alternativo |
| logoWidth | string | 150px | Ancho del logo |
| logoLink | string | / | Link al hacer clic |
| isSticky | boolean | true | Fijar al top |
| hasShadow | boolean | true | Mostrar sombra |
| paddingVertical | string | py-3 | Padding vertical |
| menuItems | array | [] | Items del menú |

**Menú**: Si no hay `menuItems` configurados, muestra automáticamente las páginas publicadas. Si hay `menuItems`, usa esos.

**Elementos Fijos**: Después del menú, siempre muestra:
- Carrito (/cart)
- Panel Admin (/admin)

---

## Footer

### DynamicFooter.tsx

Componente de footer que lee la configuración desde `SiteConfig` con clave `site`.

**Ubicación**: `src/components/DynamicFooter.tsx`

**Datos leídos de la base de datos**:
```json
{
  "footer": {
    "backgroundColor": "#1a1a1a",
    "textColor": "#ffffff",
    "logo": "",
    "logoAltText": "Logo",
    "logoWidth": "150px",
    "logoPosition": "left",
    "showPagesColumn": true,
    "pagesColumnTitle": "Páginas",
    "pages": [],
    "showSocialMediaColumn": true,
    "socialMediaColumnTitle": "Síguenos",
    "socialMedia": [],
    "showCopyrightRow": true,
    "companyName": "",
    "companyNumber": "",
    "copyrightText": "Todos los derechos reservados",
    "showHorizontalLine": true,
    "paddingVertical": "py-6",
    "columnsGap": "gap-8"
  }
}
```

**Redes sociales soportadas**:
- facebook, instagram, twitter, x, linkedin, youtube, tiktok, whatsapp, pinterest, snapchat, reddit, discord, telegram

**Formato de socialMedia**:
```json
{
  "platform": "instagram",
  "url": "https://instagram.com/mi_empresa",
  "iconType": "class",
  "iconClass": "fab fa-instagram"
}
```

---

## Color de Fondo de Página

### Cómo Configurar

Cada página puede tener su propio color de fondo. Se configura en el campo `jsonData` de la página.

**Estructura**:
```json
{
  "BackgroundColor": {
    "Value": "#f8fafc"
  }
}
```

### Lectura en el Renderizado

En `[[...slug]]/page.tsx`:
```typescript
const pageSettings = page.jsonData ? JSON.parse(page.jsonData) : {};
const bgColor = pageSettings.BackgroundColor?.Value ?? '#ffffff';
```

Aplicado al contenedor principal:
```jsx
<div className="min-h-screen" style={{ backgroundColor: bgColor }}>
```

### Colores Comunes

| Color | Código | Uso |
|-------|--------|-----|
| Blanco | #ffffff | Default |
| Gris claro | #f8fafc | Fondo alternativo |
| Negro | #000000 | Fondo oscuro |
| Azul claro | #eff6ff | Fondos decorativos |

---

## Guía para Crear Páginas

### Método 1: Editor Visual (Admin)

1. Ir a `/admin/pages`
2. Hacer clic en "Nueva Página"
3. Configurar título y slug
4. Arrastrar bloques desde el panel lateral
5. Configurar cada bloque
6. Publicar

### Método 2: REST API

**Crear página**:
```
POST /api/pages
Body: {
  title: "Mi Página",
  slug: "mi-pagina",
  jsonData: "{\"BackgroundColor\":{\"Value\":\"#f8fafc\"}}"
}
```

**Agregar bloques**:
```
POST /api/pages/{id}/blocks
Body: {
  type: "HeroBlock",
  jsonData: "{\"Title\":{\"Value\":\"Bienvenido\"}}"
}
```

### Método 3: Generador de Páginas con IA

Ver sección [Generador de Páginas con IA](#generador-de-páginas-con-ia) más abajo.

### Estructuras Comunes de Páginas

#### Landing Page
```
HeroBlock (fondo con imagen)
TextBlock (bienvenida, centrado)
ColumnBlock → 3x CardBlock o IconCardBlock (servicios)
StatsBlock (estadísticas)
CTABannerBlock (llamada a la acción)
ContactFormBlock
```

#### Página de Servicios
```
HeroBlock
GridColumn (con título "Nuestros Servicios")
  ├── IconCardBlock (servicio 1)
  ├── IconCardBlock (servicio 2)
  └── IconCardBlock (servicio 3)
StatsBlock
CTABannerBlock
```

#### Página de Contacto
```
HeroBlock
TextBlock (info de contacto)
MapBlock
ContactFormBlock
```

#### Catálogo de Productos (completo)
```
HeroBlock
ProductColumnBlock (con sidebar de categorías)
```

#### Catálogo de Productos (manual, 4 productos o menos)
```
HeroBlock
ColumnBlock → 4x ProductCardBlock
CTABannerBlock
```

#### Catálogo de Productos (manual, 5+ productos)
```
HeroBlock
GridColumn (MaxColumns "2") → ProductCardBlock x N
CTABannerBlock
```

#### FAQ
```
HeroBlock
DropdownBlock (pregunta 1)
DropdownBlock (pregunta 2)
DropdownBlock (pregunta 3)
```

#### Página con Grid de Contenido
```
HeroBlock
ColumnBlock (2 columnas)
  ├── TextBlock
  └── ImageBlock
LogoStripBlock (clientes)
CTABannerBlock
```

---

## Generador de Páginas con IA

El generador de IA permite crear páginas completas mediante lenguaje natural. Soporta múltiples proveedores.

### Proveedores Disponibles

| Proveedor | Modelo Recomendado | Velocidad | Calidad |
|-----------|-------------------|-----------|---------|
| Google Gemini | gemini-2.0-flash | Rápido (~15s) | Muy buena |
| DeepSeek | deepseek-chat | Medio (~30s) | Excelente |
| Mistral AI | mistral-large-latest | Medio (~30s) | Buena |
| Ollama (local) | deepseek-r1:14b | Lento (60-120s) | Buena |

> **Recomendación**: Usar Gemini o DeepSeek con API key guardada para mejores resultados y mayor velocidad.

### Cómo Usar

1. Ir a **Admin → 🤖 Generador IA**
2. Escribir el prompt describiendo la página
3. El sistema puede hacer preguntas aclaratorias (paso 2)
4. Se genera y redirige automáticamente al editor de la página

### Flujo de Generación

```
Prompt del usuario
  → Análisis (primera llamada a la IA)
  → Si faltan datos: muestra preguntas → respuestas → genera página
  → Si tiene datos: crea la página directamente
  → Redirige al editor
```

### Reglas del Prompt para IA

**Bloques VÁLIDOS** — la IA solo puede usar estos tipos:

**Contenedores** (requieren hijos):
- `ColumnBlock`, `GridColumn`

**Hojas** (sin hijos):
- `HeroBlock`, `TextBlock`, `MarkdownBlock`, `ImageBlock`
- `CardBlock`, `IconCardBlock`, `StatsBlock`, `CTABannerBlock`
- `LogoStripBlock`, `SpacerBlock`, `DividerBlock`
- `GalleryBlock`, `ProductsGalleryBlock`, `FlexibleImageTextBlock`
- `VideoBlock`, `MapBlock`, `ButtonLinkBlock`, `DropdownBlock`
- `TextWithButtonBlock`, `EmailButtonBlock`
- `ProductCardBlock`, `CatalogItemBlock`, `ProductColumnBlock`
- `ContactFormBlock`, `ChatBlock`

**Tipos INVÁLIDOS** (no existen):
- `SectionBlock`, `FormBlock`, `NavbarBlock`, `HeaderBlock`
- `TabsBlock`, `CarouselBlock`, `AccordionBlock`, `IconColumn`

**Formato JSON de cada campo**: `{ "Value": "valor" }` — siempre string, incluso números y booleanos.

### Ejemplos de Prompts Efectivos

#### Ejemplo 1: Landing Page

```
Crea una página de inicio para una agencia web con:

HERO:
- Fondo azul oscuro
- Título blanco: "Diseño Web Profesional"
- Subtítulo: "Transformamos tus ideas en experiencias digitales"
- Botón naranja: "Solicitar Demo"

SERVICIOS (3 columnas con IconCardBlock):
- Ícono fas fa-paint-brush, Título "Diseño", Descripción "Interfaces modernas"
- Ícono fas fa-code, Título "Desarrollo", Descripción "Código limpio y rápido"
- Ícono fas fa-mobile-alt, Título "Responsivo", Descripción "Se ve bien en todo"

ESTADÍSTICAS: 500+ clientes, 98% satisfacción, 10 años

CONTACTO: Formulario con email y mensaje

Colores: Azul #0047AB, naranja #FF6B35, fondo blanco
```

#### Ejemplo 2: Página de Servicios Detallada

```
Crea página de servicios con:

INTRO: Título centrado "Nuestros Servicios" + descripción

SERVICIOS (GridColumn 3 columnas con IconCardBlock):
- Diseño Web, Marketing Digital, Consultoría
- Soporte 24/7, SEO, Mantenimiento

PROCESO (ColumnBlock 4 columnas con CardBlock):
1. Consulta → 2. Propuesta → 3. Desarrollo → 4. Entrega

CTA: Banner oscuro con botón "Solicitar Presupuesto" → /contacto

Colores: Gris claro #F5F5F5 fondo, acento rojo #E63946
```

#### Ejemplo 3: Catálogo de Productos (5+ items)

```
Crea página de categoría con 6 productos de ropa:
- Camiseta Azul - $29.99
- Pantalón Negro - $49.99
- Vestido Rojo - $59.99
- Chaqueta Gris - $79.99
- Shorts Beige - $35.99
- Falda Verde - $45.99

Usar GridColumn con 3 columnas y ProductCardBlock.
Fondo blanco, botones azul #0047AB.
```

### Tips para Mejores Resultados

1. **Sé específico en el layout**: "3 columnas iguales", "2 columnas con imagen izquierda"
2. **Menciona bloques por nombre** si es importante el tipo exacto
3. **Colores en hex**: #FF6B35, #0047AB (nunca nombres como "azul marino")
4. **Tamaños de fuente en px**: "título 48px", "texto 16px"
5. **Límite**: Máximo 15 bloques por página para evitar timeouts
6. **Productos**: Para 5+ productos, menciona GridColumn explícitamente
7. **FontAwesome**: Usa clases reales como `fas fa-rocket`, `fas fa-star`, `fas fa-users`

---

## Glosario

- **Block**: Unidad atómica de contenido
- **isGroup/Container**: Bloque que puede contener otros bloques hijos
- **jsonData**: JSON con configuración de cada bloque en formato `{ "Campo": { "Value": "valor" } }`
- **slug**: URL amigable de la página (solo minúsculas y guiones)
- **SiteConfig**: Configuración global del sitio (navbar, footer)
- **BackgroundColor**: Color de fondo de la página
- **Sticky**: Navbar que se fija al hacer scroll
- **Glassmorphism**: Efecto visual translúcido
- **Leaf block**: Bloque sin hijos (no contenedor)
- **eyebrow**: Texto pequeño encima del título principal (TitleSida en GridColumn)

---

*Manual de Brix Next.js*
*Versión: 2.0*
*Fecha: Abril 2026*
