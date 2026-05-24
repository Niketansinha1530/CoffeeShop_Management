import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-dark-100 px-4 py-3">
        <p className="text-xs text-dark-400 font-medium mb-1">{label}</p>
        <p className="text-sm font-bold text-dark-900">
          ₹{payload[0].value?.toLocaleString('en-IN')}
        </p>
        <p className="text-xs text-dark-400 mt-0.5">{payload[0].payload.orders} orders</p>
      </div>
    );
  }
  return null;
};

export default function SalesChart({ data = [] }) {
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }));

  return (
    <div className="glass-card p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-dark-900">Sales Overview</h3>
          <p className="text-xs sm:text-sm text-dark-400 mt-0.5">Daily revenue · last 30 days</p>
        </div>
        {/* Mini legend */}
        <div className="flex items-center gap-1.5 text-xs text-dark-400">
          <span className="w-3 h-0.5 rounded-full bg-coffee-500 inline-block" />
          Revenue
        </div>
      </div>
      {/* Responsive height: shorter on mobile */}
      <div className="h-[200px] sm:h-[260px] lg:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d67b25" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#d67b25" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e3e5" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9fa2a9', fontSize: 10 }}
              dy={10}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9fa2a9', fontSize: 10 }}
              dx={-5}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#d67b25"
              strokeWidth={2.5}
              fill="url(#colorRevenue)"
              dot={false}
              activeDot={{ r: 5, fill: '#d67b25', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
