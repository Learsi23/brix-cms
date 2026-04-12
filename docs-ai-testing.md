# Ejemplos de uso del sistema de generación de páginas con IA

Este archivo contiene ejemplos de cómo usar el sistema desde línea de comandos y desde código.

## ⚙️ Setup previo

1. Instalar Ollama desde https://ollama.ai
2. Descargar un modelo: `ollama pull mistral`
3. Iniciar Ollama: `ollama serve`
4. Verificar que Next.js está corriendo en `http://localhost:3000`

## 🔍 Debug y verificación

### Verificar que Ollama está corriendo

```bash
curl http://localhost:3000/api/ai/debug?action=check-ollama
```

Respuesta esperada:

```json
{
  "status": "connected",
  "url": "http://localhost:11434",
  "models": [
    { "name": "mistral:latest", ... }
  ]
}
```

### Ver documentación de bloques disponibles

```bash
curl http://localhost:3000/api/ai/debug?action=blocks-doc
```

### Ver el system prompt

```bash
curl http://localhost:3000/api/ai/debug?action=system-prompt
```

## 🧪 Pruebas rápidas

### Probar Ollama directamente (sin crear página)

```bash
curl -X POST http://localhost:3000/api/ai/debug?action=test-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello, who are you?",
    "model": "mistral"
  }'
```

## 🚀 Generar una página

### Opción 1: Con curl

```bash
curl -X POST http://localhost:3000/api/ai/generate-page \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Crea una página de inicio con un hero grande, una sección de características en 3 columnas y un formulario de contacto al final"
  }'
```

### Opción 2: Con PowerShell (Windows)

```powershell
$body = @{
    prompt = "Crea una página de inicio con un hero, texto y un botón"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/ai/generate-page" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

### Opción 3: Con Node.js/JavaScript

```javascript
async function generatePage(prompt) {
  const response = await fetch("http://localhost:3000/api/ai/generate-page", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  console.log("Generated page:", data.page);
  return data.page;
}

generatePage("Crea una página de productos con galería");
```

### Opción 4: Con Python

```python
import requests
import json

prompt = "Crea una página de servicios con 4 tarjetas en grid"

response = requests.post(
    'http://localhost:3000/api/ai/generate-page',
    headers={'Content-Type': 'application/json'},
    json={'prompt': prompt}
)

data = response.json()
print(json.dumps(data, indent=2))
```

## 📝 Ejemplos de prompts

### Página simple

```
Crea una página con:
- Un título grande azul
- Un párrafo de texto
- Un botón de llamada a la acción
```

### Página de productos

```
Diseña una página de productos con:
- Un hero con imagen
- Una sección de filtros
- Una galería de 6 productos en 3 columnas
- Cada producto debe mostrar imagen, nombre, descripción y precio
- Un botón "Comprar" en cada tarjeta
```

### Página de servicios

```
Crea una página de servicios con:
- Título principal "Nuestros Servicios"
- Una sección en 4 columnas mostrando:
  - Diseño Web
  - Desarrollo
  - Marketing
  - Soporte
- Cada servicio tiene icono, título y descripción
- Un formulario de contacto al final
```

### Página de testimonios

```
Diseña una página de testimonios con:
- Un título "Lo que dicen nuestros clientes"
- 3 columnas con tarjetas de testimonios
- Cada tarjeta tiene:
  - Foto del cliente
  - Nombre
  - Empresa
  - Texto del testimonio
  - Rating de estrellas
```

### Página de landing

```
Crea una página de landing para una aplicación SaaS con:
- Hero grande con título "La mejor solución para tu negocio"
- 3 características principales en columnas
- Una sección de precios con 3 planes
- Un formulario de registro
- FAQ al final
```

## ✅ Respuesta esperada

```json
{
  "success": true,
  "page": {
    "id": "uuid-aqui",
    "title": "Mi página",
    "slug": "mi-pagina",
    "blocks": [
      {
        "type": "HeroBlock",
        "data": {
          "Title": { "Value": "..." },
          "Background": { "Value": "..." }
        }
      }
    ]
  }
}
```

## 🐛 Solución de problemas

### "Failed to communicate with Ollama"

```bash
# 1. Verificar que Ollama está corriendo
ollama serve

# 2. Verificar que el modelo existe
ollama list

# 3. Si no existe, descargarlo
ollama pull mistral
```

### "timeout" o respuesta lenta

- Los modelos grandes tardan más
- Intenta con `neural-chat` en lugar de `mistral`
- Aumenta el timeout en el código

### JSON inválido

- El prompt era muy ambiguo
- Intenta un prompt más claro y específico
- Los modelos pequeños a veces fallan, prueba con otro

## 🎯 Monitorear progreso

Para ver qué está haciendo Ollama:

```bash
# Terminal 1: Correr Ollama con verbose
OLLAMA_DEBUG=1 ollama serve

# Terminal 2: Enviar request
curl -X POST http://localhost:3000/api/ai/generate-page \
  -H "Content-Type: application/json" \
  -d '{"prompt": "..."}'
```

## 📊 Benchmarks típicos

| Modelo      | Velocidad     | Calidad        | Especialidad   |
| ----------- | ------------- | -------------- | -------------- |
| mistral     | ⚡⚡⚡ Rápido | ✅ Buena       | General, JSON  |
| neural-chat | ⚡⚡ Medio    | ✅✅ Excelente | Chat, creativo |
| llama2      | ⚡ Lento      | ✅ Buena       | Detallado      |

Para comenzar: **usa mistral**, es rápido y bueno con JSON.

## 🔗 Enlaces útiles

- [Documentación Ollama](https://ollama.ai)
- [Modelos disponibles](https://ollama.ai/library)
- [API de Ollama](https://github.com/jmorganca/ollama/blob/main/docs/api.md)
