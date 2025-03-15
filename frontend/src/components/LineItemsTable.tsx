import React from 'react';

interface LineItemsTableProps {
  items: any[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onItemChange: (index: number, field: string, value: any) => void;
  columns: {
    field: string;
    header: string;
    type: 'text' | 'number' | 'select' | 'calculated';
    options?: { value: string; label: string }[];
    width?: string;
    readOnly?: boolean;
    formatter?: (value: any) => string;
  }[];
  totals?: {
    field: string;
    label: string;
    formatter?: (value: any) => string;
  }[];
  emptyMessage?: string;
}

export default function LineItemsTable({
  items,
  onAddItem,
  onRemoveItem,
  onItemChange,
  columns,
  totals,
  emptyMessage = 'No items added yet',
}: LineItemsTableProps) {
  return (
    <div className="mt-4">
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
              <th scope="col" className="relative px-3 py-3 w-10">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-3 py-4 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              items.map((item, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-3 py-2 whitespace-nowrap text-sm">
                      {column.type === 'text' && (
                        <input
                          type="text"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={item[column.field] || ''}
                          onChange={(e) => onItemChange(rowIndex, column.field, e.target.value)}
                          readOnly={column.readOnly}
                        />
                      )}
                      {column.type === 'number' && (
                        <input
                          type="number"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={item[column.field] || ''}
                          onChange={(e) => onItemChange(rowIndex, column.field, e.target.value)}
                          readOnly={column.readOnly}
                        />
                      )}
                      {column.type === 'select' && column.options && (
                        <select
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={item[column.field] || ''}
                          onChange={(e) => onItemChange(rowIndex, column.field, e.target.value)}
                          disabled={column.readOnly}
                        >
                          <option value="">Select...</option>
                          {column.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {column.type === 'calculated' && (
                        <div className="py-2 px-1">
                          {column.formatter
                            ? column.formatter(item[column.field])
                            : item[column.field]}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(rowIndex)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {totals && items.length > 0 && (
            <tfoot className="bg-gray-50">
              {totals.map((total, index) => (
                <tr key={index}>
                  <td
                    colSpan={columns.length - 1}
                    className="px-3 py-2 text-right text-sm font-medium text-gray-700"
                  >
                    {total.label}
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                    {total.formatter
                      ? total.formatter(
                          items.reduce((sum, item) => sum + (parseFloat(item[total.field]) || 0), 0)
                        )
                      : items.reduce((sum, item) => sum + (parseFloat(item[total.field]) || 0), 0)}
                  </td>
                  <td></td>
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>
      <div className="mt-2">
        <button
          type="button"
          onClick={onAddItem}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Item
        </button>
      </div>
    </div>
  );
}
