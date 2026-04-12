# Sistema de Generación de Páginas con IA - Brix

Este sistema permite que **Ollama** (un LLM local) genere páginas completas para tu CMS, usando los bloques disponibles (ColumnBlock, HeroBlock, TextBlock, etc).

## 🎯 ¿Cómo funciona?

1. **Sistema de Prompts**: Un prompt del sistema que le explica a Ollama los bloques disponibles
2. **Endpoint API**: `/api/ai/generate-page` que recibe un prompt y retorna una página generada
3. **Creación automática**: Los bloques se crean automáticamente en la base de datos

## 📦 Requisitos

### 1. Instalar Ollama

- **Descargar desde**: https://ollama.ai
- **Windows**: Descarga el instalador `.exe`
- **Mac/Linux**: Sigue las instrucciones del sitio

### 2. Descargar un modelo

Una vez instalado Ollama, descarga un modelo:

```bash
ollama pull mistral
# o
ollama pull neural-chat
# o
ollama pull llama2
```

### 3. Iniciar Ollama

```bash
ollama serve
```

Esto levanta el servidor en `http://localhost:11434`

## ⚙️ Configuración

### Variables de entorno

Agrega a tu `.env.local`:

```env
# Opcional - por defecto es http://localhost:11434
OLLAMA_URL=http://localhost:11434

# Opcional - por defecto es mistral
OLLAMA_MODEL=mistral
```

## 🚀 Uso

### Desde el Admin

1. Ve a **Pages**
2. Haz clic en el botón **"Generar página con IA"** (o un botón similar)
3. Escribe un prompt describiendo la página que quieres
4. Selecciona el modelo de IA
5. Haz clic en **"Generar Página"**

### Desde el código

```typescript
import { generatePageWithAI } from "@/lib/ai/hooks";

const page = await generatePageWithAI(
  "Crea una página de inicio con un hero grande, una sección de características con 3 columnas y un formulario de contacto",
);
```

### Con el hook

```typescript
'use client';

import { useAIPageGeneration } from '@/lib/ai/hooks';

export function MyComponent() {
  const { generatePage, loading, error, page } = useAIPageGeneration();

  const handleGenerate = async () => {
    const generatedPage = await generatePage(
      'Página de productos con galería'
    );
  };

  return (
    // ...
  );
}
```

## 📝 Ejemplos de Prompts

### Ejemplo 1: Página simple

```
Crea una página con un título grande en un hero,
luego una sección con texto explicativo y
un botón llamando a la acción
```

### Ejemplo 2: Página de productos

```
Crea una página de productos con:
- Un hero con imagen de portada
- Una sección de 3 columnas con tarjetas de productos
- Cada tarjeta debe tener imagen, título, descripción y precio
- Un formulario de contacto al final
```

### Ejemplo 3: Página de servicios

```
Diseña una página de servicios con:
- Un título principal atractivo
- Una sección grid de 4 servicios, cada uno con icono y descripción
- Una sección de testimonios (3 columnas)
- Call to action al final
```

## 🔧 Problemas comunes

### Error: "Failed to communicate with Ollama"

**Solución**: Asegúrate de que Ollama esté corriendo:

```bash
ollama serve
```

### Demora en la generación

Es normal que tarde 10-30 segundos. Los modelos grandes pueden tardar más.

### JSON inválido en respuesta

Intenta con un prompt más claro y específico. El modelo a veces genera texto extra fuera del JSON.

## 📂 Archivos del sistema

- `/src/lib/ai/prompts.ts` - Sistema de prompts
- `/src/lib/ai/hooks.ts` - Hooks para usar en componentes
- `/src/app/api/ai/generate-page/route.ts` - Endpoint principal
- `/src/components/admin/AIPageGenerator.tsx` - Componente UI

## 🎨 Bloques disponibles

El sistema conoce los siguientes bloques:

### Contenedores

- **ColumnBlock** - Layout en columnas responsive
- **GridColumn** - Grid con estilos y títulos grandes

### Contenido

- **TextBlock** - Texto simple
- **MarkdownBlock** - Texto con markdown
- **HeroBlock** - Sección hero grande
- **ImageBlock** - Imágenes

### Elementos

- **ButtonLinkBlock** - Botones/enlaces
- **CardBlock** - Tarjetas
- **ProductCardBlock** - Tarjetas de productos
- **IconCardBlock** - Tarjetas con iconos
- **GalleryBlock** - Galería de imágenes

### Formularios

- **ContactFormBlock** - Formulario de contacto
- **ChatBlock** - Chat con IA

### Especializado

- **ProductsGalleryBlock** - Galería de productos
- **DropdownBlock** - Menús desplegables
- **EmailButtonBlock** - Botones de email

## 🔐 Notas de seguridad

- El endpoint `/api/ai/generate-page` crea páginas automáticamente
- Considera agregar autenticación: `ProtectedLayout` simplifica esto
- Ollama corre localmente por defecto, no hay datos externos

## 📚 Estructura de respuesta

Ollama retorna JSON en este formato:

```json
{
  "title": "Título de la página",
  "slug": "slug-de-la-pagina",
  "blocks": [
    {
      "type": "ColumnBlock",
      "data": {
        "Columns": { "Value": "2" },
        "Gap": { "Value": "gap-6" }
      },
      "children": [
        {
          "type": "TextBlock",
          "data": {
            "Title": { "Value": "Mi Título" },
            "TitleColor": { "Value": "#000000" }
          }
        }
      ]
    }
  ]
}
```

## 🎓 Tips para mejores resultados

1. **Sé específico**: "Crea 3 columnas con tarjetas azules" es mejor que "Crea columnas"
2. **Describe el layout**: Menciona ColumnBlock o GridColumn explícitamente si es importante
3. **Especifica contenido**: Describe qué texto, colores y estructura quieres
4. **Prueba modelos**: Mistral es rápido, Neural Chat es muy bueno, Llama2 es detallado
5. **Itera**: Si la primera página no es perfecta, ajusta el prompt y vuelve a intentar

## 🚀 Próximas mejoras

- [ ] Agregar validación de JSON más robusta
- [ ] Soporte para streaming (mostrar progreso)
- [ ] Cache de prompts para reutilizar
- [ ] Interfaz más amigable para los prompts
- [ ] Historial de páginas generadas
- [ ] Edición interactiva post-generación
