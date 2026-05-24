import { useState } from 'react';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi';

export default function DataTable({ columns, data, sortBy, sortOrder, onSort, emptyMessage = 'No data found' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`table-header ${col.sortable ? 'cursor-pointer select-none hover:text-dark-700 transition-colors' : ''}`}
                onClick={() => col.sortable && onSort && onSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <span className="text-coffee-500">
                      {sortOrder === 'asc' ? (
                        <HiChevronUp className="w-4 h-4" />
                      ) : (
                        <HiChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">📭</span>
                  <p className="text-dark-400 text-sm">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="hover:bg-coffee-50/30 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td key={col.key} className="table-cell">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
