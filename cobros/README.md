# Cobros por transferencia: guía de uso

Herramienta de un solo archivo (`cobros-transferencia.html`) para generar mensajes de cobro por transferencia bancaria y enviarlos por WhatsApp o correo. No necesita servidor, instalación ni suscripciones.

## Contenido de la carpeta

- `cobros-transferencia.html`: la aplicación completa (HTML, CSS y JavaScript).
- `README.md`: esta guía.

## Uso diario

1. Abre `cobros-transferencia.html` en el navegador (escritorio o móvil).
2. La primera vez, abre **Mis datos bancarios**, llena todo y pulsa **Guardar mis datos**:
   - Nombre o negocio (aparece como firma)
   - Titular, banco y CLABE
   - Plazo de pago por defecto (en días)
   - Moneda (por defecto `MXN`)
   - Código de país para WhatsApp (por defecto `52`)
3. En el formulario captura: cliente, importe y motivo del pago. Son opcionales el WhatsApp del cliente (10 dígitos), su correo y un plazo distinto al habitual.
4. Pulsa **Generar mensaje**. Puedes editar el texto antes de enviarlo.
5. Elige cómo enviarlo:
   - **Copiar**: copia el texto para pegarlo donde quieras.
   - **WhatsApp**: abre el chat con el mensaje escrito. Sin teléfono, WhatsApp te deja elegir el contacto.
   - **Correo**: abre tu app de correo con asunto y cuerpo listos.
   - **PDF / Imprimir**: abre el diálogo de impresión; elige «Guardar como PDF» para adjuntarlo.

## Cambiar de cuenta bancaria

Abre **Mis datos bancarios**, modifica los campos y pulsa **Guardar mis datos**. Los mensajes nuevos usarán los datos actualizados. Los datos se guardan por navegador y dispositivo, así que si usas la herramienta en el teléfono y en la computadora, hay que capturarlos en cada uno.

## Personalizar el mensaje

Abre el archivo en VS Code y busca la función `generar()` dentro de la etiqueta `<script>`. Ahí está la variable `t`, que contiene el texto del mensaje. Puedes cambiar frases, emojis o el orden de los datos.

Otros puntos editables:

| Qué | Dónde |
|---|---|
| Plazo por defecto | Campo `plazo` (también desde la interfaz) |
| Moneda y formato del importe | Campo `moneda`; formato en la función `fmt()` |
| Asunto del correo | Variable `asunto` en la función `enlaces()` |
| Contenido del PDF/recibo | Función `recibo()` |
| Colores | Variables CSS al inicio de `<style>` (`--ac`, `--bg`, etc.) |
| Nombre de almacenamiento | Constante `KEY` (`cobros_cfg_v1`) |

## Valores precargados (opcional)

Si quieres que los datos aparezcan sin tener que guardarlos en cada dispositivo, agrega el atributo `value` a los campos en el HTML, por ejemplo:

```html
<input id="titular" value="Tu Nombre Completo">
<input id="banco" value="Tu Banco">
```

Si subes el proyecto a un repositorio público, no incluyas tu CLABE en el código.

## Publicarlo

Sube la carpeta a cualquier hosting estático (GitHub Pages, Netlify, tu propio servidor). Ten en cuenta que los datos guardados con el botón dependen del dominio: si cambias la dirección, hay que volver a capturarlos.

## Solución de problemas

- **No copia al portapapeles**: algunos navegadores bloquean el acceso fuera de HTTPS. Selecciona el texto del cuadro y cópialo manualmente.
- **El botón de WhatsApp no abre el chat del cliente**: revisa que el número tenga 10 dígitos y que el código de país esté bien configurado.
- **El PDF sale con elementos extra**: usa «Guardar como PDF» desde el diálogo de impresión y desactiva encabezados y pies de página.
- **Los datos desaparecieron**: se borran si limpias los datos del navegador o usas modo incógnito. Vuelve a capturarlos.
