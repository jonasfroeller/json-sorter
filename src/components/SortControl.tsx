import React from 'react';
import { ArrowDownAZ, ArrowUpAZ, Plus, X } from 'lucide-react';
import type { ModelData, SortConfig, SortableKeys } from '../types';

interface SortControlProps {
  sortConfig: SortConfig[];
  onSortChange: (newConfig: SortConfig[]) => void;
  sortableKeys: SortableKeys;
}

export function SortControl({ sortConfig, onSortChange, sortableKeys }: SortControlProps) {
  const addSort = () => {
    if (sortConfig.length < sortableKeys.length) {
      onSortChange([...sortConfig, { key: sortableKeys[0].key, direction: 'asc' }]);
    }
  };

  const removeSort = (index: number) => {
    onSortChange(sortConfig.filter((_, i) => i !== index));
  };

  const updateSort = (index: number, key: keyof ModelData | 'direction', value: string) => {
    const newConfig = [...sortConfig];
    if (key === 'direction') {
      newConfig[index].direction = value as 'asc' | 'desc';
    } else {
      newConfig[index] = {
        ...newConfig[index],
        key: value as keyof ModelData
      };
    }
    onSortChange(newConfig);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Sort Configuration</h2>
        <button
          onClick={addSort}
          disabled={sortConfig.length >= sortableKeys.length}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Add Sort
        </button>
      </div>
      <div className="space-y-2">
        {sortConfig.map((config, index) => (
          <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
            <select
              value={config.key}
              onChange={(e) => updateSort(index, 'key', e.target.value)}
              className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-sm"
            >
              {sortableKeys.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={() => updateSort(index, 'direction', config.direction === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {config.direction === 'asc' ? <ArrowUpAZ size={20} /> : <ArrowDownAZ size={20} />}
            </button>
            <button
              onClick={() => removeSort(index)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}