import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  // On mobile, show fewer pages
  const maxVisible = 3;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-dark-50">
      <p className="text-xs sm:text-sm text-dark-400">
        Page <span className="font-semibold text-dark-700">{page}</span> of{' '}
        <span className="font-semibold text-dark-700">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2.5 rounded-xl hover:bg-dark-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
        >
          <HiChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              p === page
                ? 'bg-coffee-500 text-white shadow-sm'
                : 'hover:bg-dark-100 text-dark-600'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2.5 rounded-xl hover:bg-dark-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
        >
          <HiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
