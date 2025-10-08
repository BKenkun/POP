'use client';

import * as React from 'react';
import { addDays, format } from 'date-fns';
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
import { Separator } from '@/components/ui/separator';


interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  compareDate?: DateRange | undefined;
  setCompareDate?: (date: DateRange | undefined) => void;
  isCompareEnabled: boolean;
  setIsCompareEnabled: (enabled: boolean) => void;
}

const DatePresets = ({ setDate }: { setDate: (date: DateRange | undefined) => void }) => {
    const presets = [
        { label: 'Hoy', range: { from: new Date(), to: new Date() } },
        { label: 'Ayer', range: { from: addDays(new Date(), -1), to: addDays(new Date(), -1) } },
        { label: 'Últimos 7 días', range: { from: addDays(new Date(), -6), to: new Date() } },
        { label: 'Últimos 14 días', range: { from: addDays(new Date(), -13), to: new Date() } },
        { label: 'Últimos 30 días', range: { from: addDays(new Date(), -29), to: new Date() } },
        { label: 'Este mes', range: { from: new Date(new Date().setDate(1)), to: new Date() } },
        { label: 'Mes pasado', range: { from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), to: new Date(new Date().getFullYear(), new Date().getMonth(), 0) }},
    ];

    return (
        <div className="flex flex-col space-y-2 pr-4 py-4 pl-4">
            {presets.map((preset) => (
            <Button
                key={preset.label}
                onClick={() => setDate(preset.range)}
                variant="ghost"
                className="justify-start"
            >
                {preset.label}
            </Button>
            ))}
        </div>
    );
};

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
                    <div className="border-r">
                        {isCompareEnabled && <p className="p-4 text-sm font-medium text-center text-muted-foreground">PERIODO A</p>}
                        <DatePresets setDate={setDate} />
                    </div>
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
                         <div className="border-r">
                            <p className="p-4 text-sm font-medium text-center text-muted-foreground">PERIODO B</p>
                            <DatePresets setDate={setCompareDate!} />
                        </div>
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
