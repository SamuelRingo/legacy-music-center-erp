

export default function MetricCard({ title, value, subtitle, icon: Icon, variant = 'info' }) {
  const variantStyles = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400'
    },
    danger: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400'
    },
    info: {
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      text: 'text-zinc-600 dark:text-zinc-400'
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      text: 'text-amber-600 dark:text-amber-400'
    }
  };

  const style = variantStyles[variant] || variantStyles.info;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 print:p-2 outline-none ring-0 focus:outline-none focus:ring-0 print:border print:border-solid print:border-gray-400 print:rounded-none print:shadow-none print:break-inside-avoid">
      <div className={`w-10 h-10 print:w-7 print:h-7 rounded-lg print:rounded-none flex items-center justify-center ${style.bg} ${style.text}`}>
        <Icon className="w-5 h-5 print:w-3.5 print:h-3.5" />
      </div>
      <p className="text-sm font-medium text-zinc-500 mt-3 print:mt-1 print:text-xs">{title}</p>
      <h3 className="text-3xl print:text-xl font-bold text-zinc-900 dark:text-white mt-1 print:mt-0">{value}</h3>
      {subtitle && (
        <p className="text-xs text-zinc-400 mt-1 print:text-[10px] print:mt-0">{subtitle}</p>
      )}
    </div>
  );
}
