import { useState, useMemo, useCallback, useEffect } from 'react';
import { SortControl } from './components/SortControl';
import { Copy, Table, FileText, Check } from 'lucide-react';
import { defaultData } from './data';
import type { ModelData, SortConfig } from './types';

function App() {
  const [jsonInput, setJsonInput] = useState(() => JSON.stringify(defaultData, null, 2));
  const [data, setData] = useState<ModelData[]>([]);
  const [sortableKeys, setSortableKeys] = useState<Array<{ key: string; label: string; numeric?: boolean }>>([]);
  const [view, setView] = useState<'table' | 'json'>('table');
  const [copied, setCopied] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setJsonError(null);
      const parsedData = JSON.parse(jsonInput);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        setData(parsedData);
        const keys = Object.keys(parsedData[0]);
        const newSortableKeys = keys.map(key => ({
          key,
          label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          numeric: !isNaN(Number(parsedData[0][key]))
        }));
        setSortableKeys(newSortableKeys);
        
        // Only initialize sort config once
        if (!initialized) {
          setSortConfig([{ key: keys[0], direction: 'asc' }]);
          setInitialized(true);
        }
      }
    } catch (error) {
      setJsonError('Invalid JSON format. Please check your input.');
      setData([]);
      setSortableKeys([]);
    }
  }, [jsonInput, initialized]);
  
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      for (const { key, direction } of sortConfig) {
        const aValue = a[key];
        const bValue = b[key];
        
        // Find if the key should be treated as numeric
        const isNumeric = sortableKeys.find(k => k.key === key)?.numeric;
        
        let comparison = 0;
        if (isNumeric) {
          const aNum = parseFloat(String(aValue)) || 0;
          const bNum = parseFloat(String(bValue)) || 0;
          comparison = aNum - bNum;
        } else {
          const aStr = String(aValue ?? '');
          const bStr = String(bValue ?? '');
          comparison = aStr.localeCompare(bStr, undefined, { numeric: true });
        }
        
        if (comparison !== 0) {
          return direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }, [sortConfig, data]);

  const handleCopy = useCallback(() => {
    const jsonString = JSON.stringify(sortedData, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, [sortedData]);

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="mx-auto space-y-8 max-w-6xl">
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">JSON Data</h2>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className={`w-full h-48 p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              jsonError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Paste your JSON data here..."
          />
          {jsonError && (
            <p className="mt-2 text-sm text-red-600">{jsonError}</p>
          )}
        </div>
        <div className="p-6 space-y-6 bg-white rounded-xl shadow-lg">
          <SortControl
            sortConfig={sortConfig}
            onSortChange={setSortConfig}
            sortableKeys={sortableKeys}
          />
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex gap-2">
              <button
                onClick={() => setView('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${
                  view === 'table'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Table size={16} /> Table
              </button>
              <button
                onClick={() => setView('json')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${
                  view === 'json'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText size={16} /> JSON
              </button>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>
        </div>
        
        {view === 'table' ? (
          <div className="overflow-hidden bg-white rounded-xl shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {sortableKeys.map(({ key, label }) => (
                    <th key={key} className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {sortableKeys.map(({ key }) => (
                      <td key={key} className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {item[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        ) : (
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <pre className="overflow-x-auto font-mono text-sm whitespace-pre">
              {JSON.stringify(sortedData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
