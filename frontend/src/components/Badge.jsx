export default function Badge({ type, value }) {
  const styles = {
    // Category badges
    HOT: 'bg-orange-50 text-orange-600 border-orange-200',
    COLD: 'bg-sky-50 text-sky-600 border-sky-200',
    // Payment method badges
    CARD: 'bg-violet-50 text-violet-600 border-violet-200',
    UPI: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    CASH: 'bg-amber-50 text-amber-600 border-amber-200',
    // Status badges
    COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    PENDING: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    CANCELLED: 'bg-red-50 text-red-600 border-red-200',
    FAILED: 'bg-red-50 text-red-600 border-red-200',
    // Default
    default: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const icons = {
    HOT: '🔥',
    COLD: '❄️',
    CARD: '💳',
    UPI: '📱',
    CASH: '💵',
  };

  const style = styles[value] || styles.default;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${style} transition-colors`}>
      {icons[value] && <span className="text-[10px]">{icons[value]}</span>}
      {value}
    </span>
  );
}
