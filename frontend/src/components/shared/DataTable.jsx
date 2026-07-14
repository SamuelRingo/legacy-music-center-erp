import { useState, useMemo } from 'react';
import { Search, X, ChevronUp, ChevronDown, Inbox, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function DataTable({ 
  columns, 
  data = [], 
  searchKey, 
  searchPlaceholder = 'Cari...',
  actionElement,
  filterOptions = [],
  isLoading = false,
  onRowClick,
  pagination = true
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter Data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchTerm && searchKey) {
      result = result.filter(item => {
        const keys = searchKey.split('.');
        let value = item;
        for (const key of keys) {
          if (value === undefined || value === null) break;
          value = value[key];
        }
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filters (Exact Match)
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'ALL') {
        result = result.filter(item => String(item[key]) === String(value));
      }
    });

    return result;
  }, [data, searchTerm, searchKey, filters]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate Data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;

  const handleSort = (key) => {
    if (!key) return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
        <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
          {/* Search Bar */}
          {searchKey && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-9 pr-9"
              />
              {searchTerm && (
                <button 
                  onClick={() => { setSearchTerm(''); setPage(1); }}
                  className="absolute right-2 top-2.5 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Filters */}
          {filterOptions.map((f, idx) => (
            <Select 
              key={idx} 
              value={filters[f.key] || 'ALL'} 
              onValueChange={val => {
                setFilters(prev => ({ ...prev, [f.key]: val }));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua {f.label}</SelectItem>
                {f.options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {/* Action Buttons */}
        {actionElement && (
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            {actionElement}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
            <TableRow>
              {columns.map((col, index) => (
                <TableHead 
                  key={index} 
                  className={`font-semibold text-zinc-900 dark:text-zinc-300 select-none ${col.className || ''} ${col.accessorKey ? 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800' : ''}`}
                  onClick={() => col.accessorKey && handleSort(col.accessorKey)}
                >
                  <div className={`flex items-center gap-1 ${col.className?.includes('text-right') ? 'justify-end' : ''}`}>
                    {col.header}
                    {col.accessorKey && sortConfig.key === col.accessorKey && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-zinc-500 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    <p>Memuat data...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-zinc-400 gap-2">
                    <Inbox className="h-10 w-10 opacity-50" />
                    <p className="font-medium text-zinc-500">Belum ada data</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow 
                  key={row.id || rowIndex} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50' : ''}`}
                >
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className={col.className || ''}>
                      {col.cell ? col.cell(row) : row[col.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {sortedData.length > 0 && !isLoading && pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Tampilkan</span>
            <Select value={pageSize.toString()} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-16 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>baris</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Halaman {page} dari {totalPages}</span>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2" 
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2" 
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
