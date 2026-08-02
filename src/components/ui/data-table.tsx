'use client';

import * as React from 'react';
import { Search, ChevronDown, Download, Trash2, CheckCircle, ArrowUpDown } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  onBulkDelete?: (selectedIds: string[]) => void;
  onBulkPublish?: (selectedIds: string[]) => void;
  searchPlaceholder?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onBulkDelete,
  onBulkPublish,
  searchPlaceholder = 'Search records...',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const filteredData = React.useMemo(() => {
    return data.filter((row) =>
      Object.values(row).some(
        (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map((d) => d.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers = columns.map((c) => c.header).join(',');
    const rows = filteredData
      .map((row) =>
        columns
          .map((col) => {
            const val =
              typeof col.accessorKey === 'function'
                ? ''
                : String(row[col.accessorKey] ?? '');
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inkflow_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Bulk Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in">
              <Badge variant="accent">{selectedIds.length} Selected</Badge>
              {onBulkPublish && (
                <Button size="sm" variant="outline" onClick={() => onBulkPublish(selectedIds)}>
                  <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  Publish
                </Button>
              )}
              {onBulkDelete && (
                <Button size="sm" variant="destructive" onClick={() => onBulkDelete(selectedIds)}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          )}

          <Button size="sm" variant="outline" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground border-b border-border font-medium">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-border text-primary focus:ring-primary"
                />
              </th>
              {columns.map((col, idx) => (
                <th key={idx} className="p-4 whitespace-nowrap font-semibold">
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && <ArrowUpDown className="w-3.5 h-3.5 opacity-50 cursor-pointer" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-12 text-center text-muted-foreground">
                  <div className="py-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-foreground">No articles or posts found</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      No posts match your current search query or status filter. Try clearing filters or create a new post to get started.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'hover:bg-muted/30 transition-colors',
                      isSelected && 'bg-primary/5'
                    )}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(row.id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </td>
                    {columns.map((col, idx) => (
                      <td key={idx} className="p-4">
                        {col.cell
                          ? col.cell(row)
                          : typeof col.accessorKey === 'function'
                          ? col.accessorKey(row)
                          : (row[col.accessorKey] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
