import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export default function DataTable({
  title,
  count,
  columns,
  data,
  emptyMessage = "No data found."
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);
  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  return <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center">
        <h3 className="text-gray-800 font-medium">{title} <span className="text-gray-500 font-normal">({count})</span></h3>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col, idx) => <th key={idx} className={`py-4 px-6 text-sm font-semibold text-gray-800 ${col.className || ''}`}>
                {col.header}
              </th>)}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, rowIndex) => <tr key={rowIndex} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              {columns.map((col, colIndex) => <td key={colIndex} className={`py-4 px-6 text-sm text-gray-600 ${col.className || ''}`}>
                  {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                </td>)}
            </tr>)}
          {paginatedData.length === 0 && <tr>
              <td colSpan={columns.length} className="py-8 text-center text-gray-500">{emptyMessage}</td>
            </tr>}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div className="flex justify-center items-center space-x-4 p-4 border-t border-gray-100">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:hover:bg-gray-200 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center space-x-2 text-gray-600 text-sm">
          <span className="bg-[#1c1e2f] px-3 py-1 rounded text-white border border-gray-600">{currentPage}</span>
          <span>/ {totalPages}</span>
        </div>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:hover:bg-gray-200 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>;
}