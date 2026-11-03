# Tienda de plomería y herramientas (Node.js + Wompi)

## Puesta en marcha (Windows)
1. Instala Node.js LTS desde https://nodejs.org
2. Abre una terminal en esta carpeta y ejecuta:  `npm install`
3. Copia `.env.example` como `.env` y completa tus llaves de Wompi (panel Wompi > Desarrolladores) y tu clave de admin.
4. Ejecuta:  `npm start`
5. Tienda: http://localhost:3000   |   Panel: http://localhost:3000/admin/

## Estructura (cada módulo se edita por separado)
- server.js ............ API, pedidos, firma de Wompi, webhook y panel admin
- data/db.json ......... productos y pedidos (haz copia de este archivo para respaldar)
- public/index.html .... página de la tienda (textos, contacto, pie de página)
- public/css/styles.css  colores de marca en las variables de :root
- public/js/cart.js .... carrito   | ui.js .... utilidades | main.js .... catálogo y pago
- public/gracias.html .. página tras el pago
- public/admin/ ........ panel de administración

## Configurar Wompi
- Pruebas: usa llaves `pub_test_...` (sandbox). Producción: cambia a `pub_prod_...`.
- En Wompi > Desarrolladores > URL de eventos escribe:  TU_DOMINIO/api/wompi/webhook
  (en pruebas locales usa un túnel como ngrok). El webhook marca el pago y descuenta el stock.

## Uso diario del panel (guía de capacitación)
- Subir producto: Productos > llena el formulario > "Guardar producto".
- Cambiar precio/stock/descuento: "Editar" en la fila > cambia el dato > Guardar.
- Descuento masivo: elige categoría y porcentaje > "Aplicar" (0% lo quita).
- Pedidos: cambia el estado (Preparando, Enviado…) con el selector; el pago se actualiza solo vía Wompi.

## Antes de publicar
- Sube a un hosting con Node.js (Render, Railway, VPS) con HTTPS y define SITE_URL con tu dominio.
- Cambia ADMIN_PASSWORD por una clave larga. Si esperas muchas ventas, migra db.json a SQLite/MySQL.
