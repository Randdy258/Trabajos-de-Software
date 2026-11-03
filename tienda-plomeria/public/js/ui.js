// Utilidades de interfaz
const cop = n => '$' + Math.round(n).toLocaleString('es-CO');
const precioFinal = p => Math.round(p.price * (1 - (p.discount || 0) / 100));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = s => document.querySelector(s);
