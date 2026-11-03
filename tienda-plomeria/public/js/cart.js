// Módulo del carrito: guarda productos en el navegador (localStorage)
const Cart = {
  items: JSON.parse(localStorage.getItem('carrito') || '[]'),
  save() { localStorage.setItem('carrito', JSON.stringify(this.items)); document.dispatchEvent(new Event('carrito')); },
  add(id) { const i = this.items.find(x => x.id === id); i ? i.qty++ : this.items.push({ id, qty: 1 }); this.save(); },
  setQty(id, q) { const i = this.items.find(x => x.id === id); if (i) { i.qty = Math.max(1, parseInt(q, 10) || 1); this.save(); } },
  remove(id) { this.items = this.items.filter(x => x.id !== id); this.save(); },
  clear() { this.items = []; this.save(); },
  count() { return this.items.reduce((a, i) => a + i.qty, 0); }
};
