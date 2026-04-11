# 🤖 Generador de Páginas con IA - Guía Completa

## 📋 Requisitos

### 1. **Ollama instalado y ejecutándose**

```bash
# Descargar desde: https://ollama.ai
ollama serve
```

### 2. **Tener modelos descargados** (mínimo 1)

```bash
# Recomendado: deepseek-r1 14b (mejor para layouts)
ollama pull deepseek-r1:14b

# O uno de estos:
ollama pull qwen2.5-coder:14b
ollama pull llama3.1:8b
ollama pull mistral
ollama pull codestral:22b
```

---

## 🚀 Cómo Usar

### **Paso 1: Acceder al Generador**

1. Abre el Admin: `http://localhost:3000/admin`
2. En el sidebar, haz click en **🤖 Generador IA**

### **Paso 2: Escribir el Prompt**

Describe detalladamente la página que quieres crear. Ver ejemplos abajo.

### **Paso 3: Seleccionar Modelo**

- **Recomendado**: `deepseek-r1:14b`
- Mejor razonamiento y JSON estructurado
- Aunque es más lento (~60 seg), los resultados valen la pena

### **Paso 4: Seleccionar Media**

- Elige la carpeta de imágenes a referenciar
- La IA usará estas rutas en los bloques

### **Paso 5: Generar**

- Click en **🚀 Generar Página**
- Espera pacientemente (30-120 segundos según el modelo)

---

## 📦 Bloques Disponibles

_SOLO estos bloques pueden ser usados:_

| Bloque                     | Uso                                 | Ejemplo                        |
| -------------------------- | ----------------------------------- | ------------------------------ |
| **HeroBlock**              | Sección principal con imagen/título | Hero de bienvenida             |
| **TextBlock**              | Texto simple o párrafos             | Descripción, contenido         |
| **CardBlock**              | Tarjeta con título y descripción    | Testimonios, servicios         |
| **ImageBlock**             | Imagen responsiva                   | Fotos, ilustraciones           |
| **ColumnBlock**            | Layout multi-columna                | Estructura de 2, 3, 4 columnas |
| **GridColumn**             | Grid con título y descripción       | Grillas de servicios           |
| **ContactFormBlock**       | Formulario de contacto              | Contacto al cliente            |
| **GalleryBlock**           | Galería de imágenes                 | Portfolio, galería             |
| **ProductsGalleryBlock**   | Galería de productos                | Ecommerce                      |
| **ButtonLinkBlock**        | Botón con link                      | Calls to action                |
| **MarkdownBlock**          | Contenido Markdown                  | Texto formateado               |
| **FlexibleImageTextBlock** | Imagen + texto lado a lado          | Secciones mixtas               |
| **IconCardBlock**          | Tarjeta con ícono                   | Características, beneficios    |
| **DropdownBlock**          | Menú desplegable                    | FAQs, filtros                  |

---

## 💡 Ejemplos de Prompts

### **Ejemplo 1: Landing Page Simple**

```
Crea una página de inicio para una agencia web con:

HERO:
- Fondo azul oscuro
- Título blanco: "Diseño Web Profesional"
- Subtítulo: "Transformamos tus ideas en experiencias digitales"
- Botón naranja: "Solicitar Demo"

SERVICIOS (3 columnas con IconCardBlock):
- Columna 1: Ícono 🎨, Título "Diseño", Descripción "Interfaces modernas"
- Columna 2: Ícono 💻, Título "Desarrollo", Descripción "Código limpio y rápido"
- Columna 3: Ícono 📱, Título "Responsivo", Descripción "Se ve bien en todo"

CONTACTO:
- Formulario con email y mensaje
- Título: "¿Listo para comenzar?"

Colores: Azul #0047AB, naranja #FF6B35, blanco, gris oscuro #333333
```

### **Ejemplo 2: Blog Post**

```
Crea una página de artículo de blog:

ENCABEZADO:
- Imagen de portada grande
- Título: "5 Tendencias en Diseño Web 2026"
- Fecha, autor, categoría

CONTENIDO:
- Texto introductorio
- 5 secciones con títulos y párrafos
- Cada sección en contenedor con bordes suave

GALERÍA:
- 4 imágenes de ejemplo

CONCLUSIÓN:
- Párrafo final con resumen

AUTOR:
- Foto circular + nombre + descripción + link a Twitter

ARTÍCULOS RELACIONADOS:
- 3 CardBlock con título, imagen, descripción

Colores: Blanco fondo, verde #10B981 acentos, gris #4B5563 texto
```

### **Ejemplo 3: Página de Servicios Detallada**

```
Crea página de servicios con:

INTRO:
- Título: "Nuestros Servicios"
- Descripción del negocio

SERVICIOS PRINCIPALES (2 columnas x 3):
- Diseño Web + descripción
- Marketing Digital + descripción
- Consultoría + descripción
- Soporte 24/7 + descripción
- Optimización SEO + descripción
- Mantenimiento + descripción

PROCESO (4 columnas):
1. Consulta inicial
2. Propuesta
3. Desarrollo
4. Entrega

PORTFOLIO:
- Galería de 6 proyectos

PRECIOS (3 CardBlock):
- Plan Básico
- Plan Profesional
- Plan Empresarial

CONTACTO:
- Formulario + botón "Solicitar presupuesto"

Colores: Básico gris claro #F5F5F5, acentos rojo #E63946
```

### **Ejemplo 4: E-commerce Categoría**

```
Crea página de categoría de productos:

FILTROS:
- Dropdown para categoría
- Dropdown para precio

PRODUCTOS (Grid 4 columnas):
- 8 ProductCard con imagen, nombre, precio
- Cada uno con botón "Agregar al Carrito"

BENEFICIOS (3 ColumnBlock):
- "Envío Gratis"
- "Garantía 1 Año"
- "Devolución 30 días"

NEWSLETTER:
- Imagen de promoción
- Texto de suscripción
- Email input + botón "Suscribir"

Colores: Blanco, acentos verde #10B981, botones azul #0047AB
```

### **Ejemplo 5: About / Sobre Nosotros**

```
Crea página sobre la empresa:

WHO ARE WE (FlexibleImageTextBlock):
- Imagen a la izquierda
- Texto a la derecha: Historia de 3 párrafos

MISIÓN VISIÓN (3 CardBlock):
- Misión
- Visión
- Valores

EQUIPO (Grid 3 columnas):
- 3 miembros con foto, nombre, rol

NÚMEROS/STATS (4 ColumnBlock):
- "500+"
- "Clientes"
- "15"
- "Años"

CLIENTES PRINCIPALES:
- Galería logos

TESTIMONIOS (2 CardBlock):
- Testimonio 1
- Testimonio 2

Colores: Azul #0047AB profesional, grises neutros
```

---

## ⚠️ Reglas Importantes

**✅ HACED:**

- Ser específico sobre layouts: "3 columnas iguales", "2 columnas"
- Mencionar bloques disponibles por nombre
- Describir colores en hex: #FF6B35, #0047AB
- Especificar tamaños de fuente: 16px, 24px, 32px
- Usar ContentMarkdown formatted

**❌ NO HAGÁIS:**

- Inventar nuevos tipos de bloques
- Usar "TabsBlock", "CarouselBlock", "AccordionBlock" (no existen)
- Pedir componentes personalizados
- Usar más de 10-12 bloques por página
- Cambiar nombres de bloques

---

## 🔍 Diagnosticar Problemas

### **Error: "Failed to communicate with Ollama"**

1. Verifica que Ollama esté corriendo:

```bash
ollama serve
```

2. Verifica que tienes un modelo:

```bash
ollama list
```

3. Intenta el endpoint de debug:

```
http://localhost:3000/api/ai/debug?action=check-ollama
```

### **Modelo Muy Lento**

- Usa `llama3.1:8b` (más ligero)
- O espera más tiempo con modelos grandes

### **JSON Inválido**

- Sé más específico en el prompt
- Usa modelo `deepseek-r1:14b` (mejor razonamiento)
- Menos de 12 bloques por página

---

## 📧 Después de Generar

1. ✅ Se abrirá automáticamente el editor
2. ✅ Puedes cambiar:
   - Títulos
   - Textos
   - Colores
   - Imágenes
   - Estructura
3. ✅ Agregar/quitar bloques manualmente
4. ✅ Guardar y publicar

---

## 💬 Tips Finales

- **Comienza con prompts simples** (5-6 bloques)
- **Aumenta complejidad gradualmente**
- **Usa el mismo modelo** para resultados consistentes
- **Revisa y edita después** de generar
- **Haz preguntas específicas** en los prompts

---

¿Necesitas ayuda con un prompt específico? 🚀
