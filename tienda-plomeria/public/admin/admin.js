// Panel de administración: productos, descuentos y pedidos
let token = sessionStorage.getItem('tk') || '', prods = [];
const api = async (url, method = 'GET', body) => {
  const r = await fetch('/api/admin' + url, { method, headers: { 'Content-Type': 'application/json', 'x-token': token }, body: body ? JSON.stringify(body) : undefined });
  if (r.status === 401) { sessionStorage.removeItem('tk'); token = ''; mostrar(); throw new Error('Sesión vencida'); }
  return r.json();
};
function mostrar() {
  const on = !!token; $('#login').hidden = on; $('#nav').hidden = !on;
  if (!on) { $('#productos').hidden = $('#pedidos').hidden = true; }
  else { pestana('productos'); cargarProductos(); }
}
function pestana(t) {
  ['productos', 'pedidos'].forEach(x => $('#' + x).hidden = x !== t);
  document.querySelectorAll('#nav [data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === t));
  if (t === 'pedidos') cargarPedidos();
}
$('#login').onsubmit = async e => {
  e.preventDefault();
  const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: $('#clave').value }) });
  const d = await r.json(); if (!r.ok) { $('#e-login').textContent = d.error; return; }
  token = d.token; sessionStorage.setItem('tk', token); mostrar();
};
$('#nav').onclick = e => { if (e.target.dataset.t) pestana(e.target.dataset.t); if (e.target.id === 'salir') { sessionStorage.removeItem('tk'); token = ''; mostrar(); } };

async function cargarProductos() {
  prods = await api('/products'); const cats = [...new Set(prods.map(p => p.category))];
  $('#cats').innerHTML = cats.map(c => `<option value="${esc(c)}">`).join('');
  $('#d-cat').innerHTML = '<option value="">Todas las categorías</option>' + cats.map(c => `<option>${esc(c)}</option>`).join('');
  $('#t-prod').innerHTML = '<tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Desc.</th><th>Stock</th><th></th></tr>' +
    prods.map(p => `<tr><td>${esc(p.name)}${p.active === false ? ' (oculto)' : ''}</td><td>${esc(p.category)}</td><td>${cop(p.price)}</td><td>${p.discount}%</td><td>${p.stock}</td>
    <td><button class="btn btn-l" data-ed="${p.id}">Editar</button><button class="btn btn-l" data-ocultar="${p.id}">${p.active === false ? 'Mostrar' : 'Ocultar'}</button><button class="btn btn-l" data-del="${p.id}">Borrar</button></td></tr>`).join('');
}
$('#t-prod').onclick = async e => {
  const d = e.target.dataset;
  if (d.ed) { const p = prods.find(x => x.id === d.ed), f = $('#f-prod'); for (const k of ['id', 'name', 'category', 'price', 'discount', 'stock', 'image', 'description']) f.elements[k].value = p[k] ?? ''; scrollTo(0, 0); }
  if (d.ocultar) { const p = prods.find(x => x.id === d.ocultar); await api('/products/' + p.id, 'PUT', { ...p, active: p.active === false }); cargarProductos(); }
  if (d.del && confirm('¿Borrar este producto? Esta acción no se puede deshacer.')) { await api('/products/' + d.del, 'DELETE'); cargarProductos(); }
};
$('#f-prod').onsubmit = async e => {
  e.preventDefault(); const b = Object.fromEntries(new FormData(e.target)), id = b.id; delete b.id;
  await api(id ? '/products/' + id : '/products', id ? 'PUT' : 'POST', b); e.target.reset(); e.target.elements.id.value = ''; cargarProductos();
};
$('#nuevo').onclick = () => { $('#f-prod').reset(); $('#f-prod').elements.id.value = ''; };
$('#f-desc').onsubmit = async e => { e.preventDefault(); await api('/discount', 'POST', { category: $('#d-cat').value, discount: $('#d-val').value }); cargarProductos(); };

async function cargarPedidos() {
  const os = await api('/orders'), est = ['Nuevo', 'Pagado', 'Preparando', 'Enviado', 'Entregado', 'Cancelado'];
  $('#t-ped').innerHTML = '<tr><th>Pedido</th><th>Cliente</th><th>Productos</th><th>Total</th><th>Pago</th><th>Estado</th></tr>' + (os.map(o => `<tr>
    <td>${esc(o.reference)}<br><small>${new Date(o.date).toLocaleString('es-CO')}</small></td>
    <td>${esc(o.customer.name)}<br><small>${esc(o.customer.phone)} · ${esc(o.customer.email)}<br>${esc(o.customer.address)}, ${esc(o.customer.city)}</small></td>
    <td>${o.items.map(i => `${i.qty}× ${esc(i.name)}`).join('<br>')}</td><td>${cop(o.total)}</td>
    <td class="${o.paymentStatus === 'APROBADO' ? 'ok' : o.paymentStatus === 'PENDIENTE' ? '' : 'mal'}">${esc(o.paymentStatus)}</td>
    <td><select data-ref="${o.reference}">${est.map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('') || '<tr><td colspan="6">Aún no hay pedidos.</td></tr>');
}
$('#t-ped').onchange = async e => { if (e.target.dataset.ref) await api('/orders/' + e.target.dataset.ref, 'PUT', { status: e.target.value }); };
mostrar();
