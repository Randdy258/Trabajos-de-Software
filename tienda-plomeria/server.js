// Servidor: API de productos, pedidos, panel admin y Wompi (sin base de datos externa: usa data/db.json)
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const express = require('express');

// Carga simple del archivo .env
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach(l => {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
} catch (e) { console.warn('Falta el archivo .env (copia .env.example)'); }
const E = process.env, PORT = E.PORT || 3000, SHIPPING = Number(E.SHIPPING_COP || 0);

// ---------- "Base de datos" en JSON ----------
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const load = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const save = db => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
const price = p => Math.round(p.price * (1 - (p.discount || 0) / 100));
const sha = s => crypto.createHash('sha256').update(s).digest('hex');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Tienda ----------
app.get('/api/config', (req, res) => res.json({ store: E.STORE_NAME || 'Tienda', shipping: SHIPPING }));
app.get('/api/products', (req, res) => res.json(load().products.filter(p => p.active !== false)));

// Crea el pedido con precios del servidor y devuelve la firma de integridad para Wompi
app.post('/api/orders', (req, res) => {
  const { customer, items } = req.body || {};
  if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address || !customer?.city || !Array.isArray(items) || !items.length)
    return res.status(400).json({ error: 'Completa todos los datos del pedido.' });
  const db = load(); let subtotal = 0; const lines = [];
  for (const it of items) {
    const p = db.products.find(x => x.id === it.id && x.active !== false), qty = parseInt(it.qty, 10);
    if (!p || !(qty > 0)) return res.status(400).json({ error: 'Producto no válido.' });
    if (qty > p.stock) return res.status(400).json({ error: `Solo quedan ${p.stock} unidades de "${p.name}".` });
    lines.push({ id: p.id, name: p.name, qty, unit: price(p) }); subtotal += price(p) * qty;
  }
  const total = subtotal + SHIPPING, reference = 'PLM-' + Date.now().toString(36).toUpperCase();
  db.orders.unshift({ reference, date: new Date().toISOString(), customer, items: lines, subtotal, shipping: SHIPPING, total,
    paymentStatus: 'PENDIENTE', status: 'Nuevo', stockDiscounted: false });
  save(db);
  const cents = total * 100;
  res.json({ reference, amountInCents: cents, currency: 'COP', publicKey: E.WOMPI_PUBLIC_KEY,
    signature: sha(`${reference}${cents}COP${E.WOMPI_INTEGRITY_SECRET}`), redirectUrl: `${E.SITE_URL || ''}/gracias.html` });
});

// Webhook de Wompi: configura en su panel  {SITE_URL}/api/wompi/webhook
app.post('/api/wompi/webhook', (req, res) => {
  const ev = req.body || {}, sig = ev.signature || {};
  const get = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);
  const check = sha((sig.properties || []).map(p => get(ev.data, p)).join('') + ev.timestamp + E.WOMPI_EVENTS_SECRET);
  if (check !== sig.checksum) return res.status(401).end();
  const tx = ev.data?.transaction; if (ev.event !== 'transaction.updated' || !tx) return res.status(200).end();
  const db = load(), o = db.orders.find(x => x.reference === tx.reference);
  if (o) {
    o.paymentStatus = { APPROVED: 'APROBADO', DECLINED: 'RECHAZADO', VOIDED: 'ANULADO', ERROR: 'ERROR' }[tx.status] || tx.status;
    o.transactionId = tx.id;
    if (tx.status === 'APPROVED' && !o.stockDiscounted) {
      o.items.forEach(i => { const p = db.products.find(x => x.id === i.id); if (p) p.stock = Math.max(0, p.stock - i.qty); });
      o.stockDiscounted = true; if (o.status === 'Nuevo') o.status = 'Pagado';
    }
    save(db);
  }
  res.status(200).end();
});

// ---------- Administración ----------
const tokens = new Set();
app.post('/api/admin/login', (req, res) => {
  if (!E.ADMIN_PASSWORD || req.body?.password !== E.ADMIN_PASSWORD) return res.status(401).json({ error: 'Clave incorrecta' });
  const t = crypto.randomBytes(24).toString('hex'); tokens.add(t); res.json({ token: t });
});
const auth = (req, res, next) => tokens.has(req.headers['x-token']) ? next() : res.status(401).json({ error: 'Sesión vencida' });
const clean = b => ({ name: String(b.name || '').slice(0, 120), category: String(b.category || 'General').slice(0, 60),
  price: Math.max(0, Number(b.price) || 0), discount: Math.min(90, Math.max(0, Number(b.discount) || 0)),
  stock: Math.max(0, parseInt(b.stock, 10) || 0), image: String(b.image || '').slice(0, 500),
  description: String(b.description || '').slice(0, 500), active: b.active !== false });

app.get('/api/admin/products', auth, (req, res) => res.json(load().products));
app.post('/api/admin/products', auth, (req, res) => {
  const db = load(), p = { id: 'p' + Date.now().toString(36), ...clean(req.body) };
  db.products.unshift(p); save(db); res.json(p);
});
app.put('/api/admin/products/:id', auth, (req, res) => {
  const db = load(), i = db.products.findIndex(p => p.id === req.params.id);
  if (i < 0) return res.status(404).end();
  db.products[i] = { ...db.products[i], ...clean(req.body) }; save(db); res.json(db.products[i]);
});
app.delete('/api/admin/products/:id', auth, (req, res) => {
  const db = load(); db.products = db.products.filter(p => p.id !== req.params.id); save(db); res.json({ ok: true });
});
app.post('/api/admin/discount', auth, (req, res) => { // descuento masivo por categoría (o todas)
  const { category, discount } = req.body, db = load(), d = Math.min(90, Math.max(0, Number(discount) || 0));
  db.products.forEach(p => { if (!category || p.category === category) p.discount = d; }); save(db); res.json({ ok: true });
});
app.get('/api/admin/orders', auth, (req, res) => res.json(load().orders));
app.put('/api/admin/orders/:ref', auth, (req, res) => {
  const db = load(), o = db.orders.find(x => x.reference === req.params.ref);
  if (!o) return res.status(404).end();
  if (req.body.status) o.status = req.body.status;
  if (req.body.paymentStatus) o.paymentStatus = req.body.paymentStatus; // por si confirmas un pago manualmente
  save(db); res.json(o);
});

app.listen(PORT, () => console.log(`Tienda lista en http://localhost:${PORT}  |  Admin: http://localhost:${PORT}/admin/`));
