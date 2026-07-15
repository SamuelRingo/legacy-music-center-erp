import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const BULAN = [
  { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
  { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
];

export default function MonthYearFilter({ monthFilter, yearFilter, onMonthChange, onYearChange }) {
  return (
    <div className="flex items-center gap-2">
      <Select value={monthFilter} onValueChange={onMonthChange}>
        <SelectTrigger className="w-32"><SelectValue placeholder="Bulan">{monthFilter ? BULAN.find(b => b.value.toString() === monthFilter)?.label : "Bulan"}</SelectValue></SelectTrigger>
        <SelectContent>
          {BULAN.map((b) => (
            <SelectItem key={b.value} value={b.value.toString()}>{b.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={yearFilter} onValueChange={onYearChange}>
        <SelectTrigger className="w-24"><SelectValue placeholder="Tahun" /></SelectTrigger>
        <SelectContent>
          {[2024, 2025, 2026, 2027].map(y => (
            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
