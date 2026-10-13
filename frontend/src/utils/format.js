const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const money = (n) => inr.format(Number(n) || 0);

// 12,50,000 -> ₹12.5 L, 3,20,00,000 -> ₹3.2 Cr
export function compactMoney(n) {
  const v = Number(n) || 0;
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2).replace(/\.?0+$/, '')} L`;
  return inr.format(v);
}

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';

export const isOverdue = (d, status) => status !== 'done' && d && new Date(d) < new Date(new Date().toDateString());

export const roleLabel = (r) => ({ admin: 'Admin', manager: 'Manager', sales_rep: 'Sales rep' }[r] || r);
