
'use client';

import * as React from 'react';
import { addDays, format, startOfMonth, endOfMonth, startOfYear, endOfYear, subYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';


interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  compareDate?: DateRange | undefined;
  setCompareDate?: (date: DateRange | undefined) => void;
  isCompareEnabled: boolean;
  setIsCompareEnabled: (enabled: boolean) => void;
}

export function DateRangePicker({
  className,
  date,
  setDate,
  compareDate,
  setCompareDate,
  isCompareEnabled,
  setIsCompareEnabled,
}: DateRangePickerProps) {

   const formatDateRange = (range: DateRange | undefined) => {
        if (!range?.from) return 'Selecciona un rango';
        if (!range.to) return format(range.from, 'LLL dd, y', { locale: es });
        return `${format(range.from, 'LLL dd, y', { locale: es })} - ${format(range.to, 'LLL dd, y', { locale: es })}`;
   }
   
    const today = new Date();
    const presets = [
        { label: 'Hoy', range: { from: today, to: today } },
        { label: 'Ayer', range: { from: addDays(today, -1), to: addDays(today, -1) } },
        { label: 'Últimos 7 días', range: { from: addDays(today, -6), to: today } },
        { label: 'Últimos 15 días', range: { from: addDays(today, -14), to: today } },
        { label: 'Últimos 30 días', range: { from: addDays(today, -29), to: today } },
        { label: 'Este mes', range: { from: startOfMonth(today), to: today } },
        { label: 'Mes pasado', range: { from: startOfMonth(addDays(today, -30)), to: endOfMonth(addDays(today, -30)) }},
        { label: 'Últimos 90 días', range: { from: addDays(today, -89), to: today } },
        { label: 'Últimos 120 días', range: { from: addDays(today, -119), to: today } },
        { label: 'Este año', range: { from: startOfYear(today), to: today } },
        { label: 'Año pasado', range: { from: startOfYear(subYears(today, 1)), to: endOfYear(subYears(today, 1)) } },
        { label: 'Histórico', range: undefined },
    ];
    
    const DatePresetsColumn = ({ period }: { period: 'A' | 'B' }) => {
        const setCorrectDate = period === 'A' ? setDate : setCompareDate;
        if (!setCorrectDate) return null;
        return (
            <div className="flex flex-col space-y-1 p-2 border-r">
                {presets.map(preset => (
                    <Button key={preset.label} variant="ghost" className="justify-start text-xs h-8" onClick={() => setCorrectDate(preset.range)}>
                        {preset.label}
                    </Button>
                ))}
            </div>
        )
    };


  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <div className="truncate">
                {formatDateRange(date)}
                {isCompareEnabled && compareDate && (
                    <span className="text-muted-foreground"> vs. {formatDateRange(compareDate)}</span>
                )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-medium">Seleccionar Fechas</h4>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="compare-mode">Comparar</Label>
                    <Switch
                        id="compare-mode"
                        checked={isCompareEnabled}
                        onCheckedChange={setIsCompareEnabled}
                    />
                </div>
            </div>
           
            <div className={cn("flex", isCompareEnabled && "divide-x")}>
                {/* --- Period A Block --- */}
                <div className="flex">
                    <DatePresetsColumn period="A" />
                     <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={isCompareEnabled ? 1 : 2}
                        locale={es}
                    />
                </div>

                {/* --- Period B Block (Conditional) --- */}
                {isCompareEnabled && (
                    <div className="flex">
                        <DatePresetsColumn period="B" />
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={compareDate?.from}
                            selected={compareDate}
                            onSelect={setCompareDate}
                            numberOfMonths={1}
                            locale={es}
                        />
                    </div>
                )}
            </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

