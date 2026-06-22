const STYLES = {
  placed:    'bg-blue-50 text-blue-700 border border-blue-200',
  shipped:   'bg-amber-50 text-amber-700 border border-amber-200',
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
  approved:  'bg-green-50 text-green-700 border border-green-200',
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  rejected:  'bg-red-50 text-red-600 border border-red-200',
};

const ICONS = {
  placed: '📦', shipped: '🚚', delivered: '✅', cancelled: '✗',
  approved: '✓', pending: '⏳', rejected: '✗',
};

export default function StatusBadge({ status, className = '' }) {
  const s = (status || '').toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${STYLES[s] ?? 'bg-gray-100 text-gray-600'} ${className}`}>
      <span>{ICONS[s] ?? '•'}</span>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}
