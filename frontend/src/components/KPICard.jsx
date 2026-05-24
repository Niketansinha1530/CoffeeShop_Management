export default function KPICard({ title, value, subtitle, icon, trend, color = 'coffee', delay = 0 }) {
  const colorMap = {
    coffee: 'from-coffee-500 to-coffee-600',
    green: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
  };

  const bgMap = {
    coffee: 'bg-coffee-50',
    green: 'bg-emerald-50',
    blue: 'bg-blue-50',
    purple: 'bg-violet-50',
    amber: 'bg-amber-50',
  };

  return (
    <div
      className="glass-card-hover p-4 sm:p-6 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`p-2.5 sm:p-3 rounded-xl ${bgMap[color]}`}>
          <div className={`text-lg sm:text-xl bg-gradient-to-r ${colorMap[color]} bg-clip-text text-transparent`}>
            {icon}
          </div>
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend > 0
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-600'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-dark-900 mb-1 truncate">{value}</p>
      <p className="text-xs sm:text-sm text-dark-400 font-medium">{title}</p>
      {subtitle && (
        <p className="text-xs text-dark-300 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
