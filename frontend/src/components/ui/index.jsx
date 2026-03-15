// src/components/ui/index.jsx — All shared UI primitives

import { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════════════ */
const TOAST_STYLES = {
  success: 'bg-green-600 text-white',
  error:   'bg-red-600 text-white',
  info:    'bg-navy-800 text-white',
  warning: 'bg-amber-500 text-white',
};
const TOAST_ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

export function Toasts({ toasts, dismiss }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[280px] max-w-sm
            pointer-events-auto animate-[slideIn_.25s_ease] ${TOAST_STYLES[t.type] || TOAST_STYLES.info}`}
          style={{ animation: 'slideIn .25s ease' }}
        >
          <span className="text-sm font-bold mt-0.5 flex-shrink-0">{TOAST_ICONS[t.type]}</span>
          <span className="text-sm flex-1 font-medium">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="text-white/70 hover:text-white ml-1 flex-shrink-0 text-base leading-none">✕</button>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   MODAL
═══════════════════════════════════════ */
export function Modal({ title, onClose, children, footer, size = 'md', dangerous = false }) {
  const sizeClass = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }[size] || 'max-w-xl';

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[500] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClass} max-h-[90vh] flex flex-col overflow-hidden`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0 ${dangerous ? 'bg-red-50' : ''}`}>
          <h3 className={`text-base font-bold ${dangerous ? 'text-red-700' : 'text-gray-900'}`}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-gray-50">{footer}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   LOADING STATES
═══════════════════════════════════════ */
export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-3' }[size];
  return <div className={`${s} rounded-full border-current border-t-transparent animate-spin ${className}`}/>;
}

export function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Spinner size="lg" className="text-navy-600"/>
      <p className="text-sm text-gray-500 font-medium">{text}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-50">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-3 bg-gray-200 rounded flex-1"/>
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <div className="text-base font-semibold text-gray-500 mb-1">{title}</div>
      {subtitle && <div className="text-sm text-gray-400 mb-4 max-w-xs">{subtitle}</div>}
      {action}
    </div>
  );
}

/* ═══════════════════════════════════════
   STATUS BADGE
═══════════════════════════════════════ */
const STATUS_MAP = {
  // Shipment statuses
  Booked:          'badge-blue',
  InTransit:       'badge-yellow',
  'In Transit':    'badge-yellow',
  OutForDelivery:  'badge-orange',
  'Out for Delivery': 'badge-orange',
  Delivered:       'badge-green',
  Delayed:         'badge-red',
  RTO:             'badge-orange',
  Cancelled:       'badge-gray',
  // Invoice statuses
  DRAFT:           'badge-gray',
  SENT:            'badge-blue',
  PAID:            'badge-green',
  CANCELLED:       'badge-red',
  // Quote statuses
  QUOTED:          'badge-blue',
  BOOKED:          'badge-green',
  LOST:            'badge-red',
  EXPIRED:         'badge-gray',
  // Reconciliation
  PENDING:         'badge-yellow',
  REVIEWED:        'badge-blue',
  DISPUTED:        'badge-red',
  SETTLED:         'badge-green',
  OK:              'badge-green',
  OVER:            'badge-red',
  UNDER:           'badge-yellow',
  NOT_FOUND:       'badge-gray',
  // User
  ADMIN:           'badge-purple',
  STAFF:           'badge-blue',
};
const STATUS_LABELS = {
  InTransit: 'In Transit',
  OutForDelivery: 'Out for Delivery',
};

export function StatusBadge({ status }) {
  return (
    <span className={STATUS_MAP[status] || 'badge-gray'}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

/* ═══════════════════════════════════════
   STAT CARD
═══════════════════════════════════════ */
export function StatCard({ icon, label, value, sub, trend, trendUp, bgColor = 'bg-white', loading = false }) {
  return (
    <div className={`${bgColor} rounded-xl border border-gray-100 shadow-sm-navy p-5`}>
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-6 w-6 bg-gray-200 rounded"/>
          <div className="h-8 w-24 bg-gray-200 rounded"/>
          <div className="h-3 w-16 bg-gray-200 rounded"/>
        </div>
      ) : (
        <>
          <div className="text-2xl mb-2">{icon}</div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</div>
          {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
          {trend !== undefined && (
            <div className={`text-xs font-semibold mt-1 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   CONFIRM DIALOG
═══════════════════════════════════════ */
export function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmClass = 'btn-danger', loading = false }) {
  return (
    <Modal title={title} onClose={onCancel} dangerous size="sm"
      footer={<>
        <button className="btn-secondary btn" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className={`btn ${confirmClass}`} onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size="sm"/> : confirmText}
        </button>
      </>}>
      <p className="text-sm text-gray-600">{message}</p>
    </Modal>
  );
}

/* ═══════════════════════════════════════
   ALERT
═══════════════════════════════════════ */
export function Alert({ type = 'error', children }) {
  const styles = {
    error:   'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    info:    'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  };
  return (
    <div className={`px-4 py-3 rounded-lg border text-sm font-medium mb-4 ${styles[type]}`}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════
   PAGINATION
═══════════════════════════════════════ */
export function Pagination({ page, pages, total, limit, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span className="text-xs text-gray-500">
        Showing {(page-1)*limit+1}–{Math.min(page*limit, total)} of {total} records
      </span>
      <div className="flex gap-1">
        <button onClick={() => onChange(page-1)} disabled={page<=1}
          className="btn btn-secondary btn-sm disabled:opacity-30">← Prev</button>
        <span className="btn btn-secondary btn-sm cursor-default">{page} / {pages}</span>
        <button onClick={() => onChange(page+1)} disabled={page>=pages}
          className="btn btn-secondary btn-sm disabled:opacity-30">Next →</button>
      </div>
    </div>
  );
}
