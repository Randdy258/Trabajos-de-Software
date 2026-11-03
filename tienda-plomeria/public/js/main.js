// Tienda: catálogo, filtros, carrito y pago con Wompi
let productos = [], cfg = { shipping: 0 }, cat = 'Todos';

async function iniciar() {
  [productos, cfg] = await Promise.all([fetch('/api/products').then(r => r.json()), fetch('/api/config').then(r => r.json())]);
  document.querySelectorAll('.nombre-tienda').forEach(e => e.textContent = cfg.store);
  document.title = cfg.store + ' | Herramientas y accesorios';
  pintarFiltros(); pintarCatalogo(); pintarCarrito();
}

function pintarFiltros() {
  const cats = ['Todos', ...new Set(productos.map(p => p.category))];
  $('#filtros').innerHTML = cats.map(c => `<button class="chip ${c === cat ? 'on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  $('#filtros').onclick = e => { if (e.target.dataset.c) { cat = e.target.dataset.c; pintarFiltros(); pintarCatalogo(); } };
}

function pintarCatalogo() {
  const q = $('#buscar').value.toLowerCase();
  const lista = productos.filter(p => (cat === 'Todos' || p.category === cat) && (p.name + p.description).toLowerCase().includes(q));
  $('#catalogo').innerHTML = lista.map(p => `
    <article class="card">
      ${p.discount ? `<span class="etiqueta">-${p.discount}%</span>` : ''}
      <div class="img">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : '🔧'}</div>
      <div class="info"><small>${esc(p.category)}</small><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p>
        <div class="precio">${cop(precioFinal(p))}${p.discount ? `<s>${cop(p.price)}</s>` : ''}</div>
        <small>${p.stock > 0 ? p.stock + ' disponibles' : 'Agotado'}</small>
        <button class="btn btn-n" data-add="${p.id}" ${p.stock < 1 ? 'disabled' : ''}>Añadir al carrito</button></div>
    </article>`).join('') || '<p class="vacio">No encontramos productos con ese filtro. Prueba otra categoría o palabra.</p>';
}

function pintarCarrito() {
  $('#cuenta').textContent = Cart.count();
  const filas = Cart.items.map(i => ({ ...i, p: productos.find(p => p.id === i.id) })).filter(i => i.p);
  const sub = filas.reduce((a, i) => a + precioFinal(i.p) * i.qty, 0);
  $('#lineas').innerHTML = filas.map(({ p, qty }) => `
    <div class="linea"><div><strong>${esc(p.name)}</strong><br><small>${cop(precioFinal(p))} c/u</small></div>
      <div style="text-align:right"><strong>${cop(precioFinal(p) * qty)}</strong></div>
      <div class="qty"><button data-menos="${p.id}" aria-label="Quitar uno">−</button>
        <input type="number" min="1" max="${p.stock}" value="${qty}" data-qty="${p.id}" aria-label="Cantidad">
        <button data-mas="${p.id}" aria-label="Añadir uno">+</button></div>
      <button class="quitar" data-quitar="${p.id}">Quitar</button></div>`).join('') || '<p class="vacio">Tu carrito está vacío. Añade productos del catálogo.</p>';
  $('#sub').textContent = cop(sub); $('#envio').textContent = filas.length ? cop(cfg.shipping) : '$0';
  $('#total').textContent = cop(filas.length ? sub + cfg.shipping : 0); $('#ir-pago').disabled = !filas.length;
}

const panel = (id, on) => { $('#capa').classList.toggle('on', on); ['carrito', 'pago'].forEach(x => $('#' + x).classList.toggle('on', on && x === id)); };

document.addEventListener('click', e => {
  const t = e.target, d = t.dataset;
  if (d.add) { Cart.add(d.add); panel('carrito', true); }
  if (d.mas) Cart.setQty(d.mas, Cart.items.find(i => i.id === d.mas).qty + 1);
  if (d.menos) Cart.setQty(d.menos, Cart.items.find(i => i.id === d.menos).qty - 1);
  if (d.quitar) Cart.remove(d.quitar);
  if (t.closest('#abrir-carrito')) panel('carrito', true);
  if (t.id === 'capa' || t.closest('.cerrar')) panel('', false);
  if (t.id === 'ir-pago') panel('pago', true);
});
document.addEventListener('change', e => { if (e.target.dataset.qty) Cart.setQty(e.target.dataset.qty, e.target.value); });
document.addEventListener('carrito', pintarCarrito);
$('#buscar').addEventListener('input', pintarCatalogo);

// Enviar pedido y redirigir al checkout seguro de Wompi
$('#form-pago').addEventListener('submit', async e => {
  e.preventDefault(); const b = $('#pagar'), m = $('#error'); m.textContent = ''; b.disabled = true; b.textContent = 'Procesando…';
  const customer = Object.fromEntries(new FormData(e.target));
  try {
    const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer, items: Cart.items }) });
    const o = await r.json(); if (!r.ok) throw new Error(o.error);
    const q = new URLSearchParams({ 'public-key': o.publicKey, currency: o.currency, 'amount-in-cents': o.amountInCents, reference: o.reference,
      'signature:integrity': o.signature, 'redirect-url': o.redirectUrl, 'customer-data:email': customer.email,
      'customer-data:full-name': customer.name, 'customer-data:phone-number': customer.phone });
    Cart.clear(); location.href = 'https://checkout.wompi.co/p/?' + q;
  } catch (err) { m.textContent = err.message || 'No pudimos crear el pedido. Intenta de nuevo.'; b.disabled = false; b.textContent = 'Pagar con Wompi'; }
});
iniciar();
