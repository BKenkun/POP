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

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  setDate,
}: DateRangePickerProps) {
  const presets = [
    { label: 'Hoy', range: { from: new Date(), to: new Date() } },
    { label: 'Ayer', range: { from: addDays(new Date(), -1), to: addDays(new Date(), -1) } },
    { label: 'Últimos 7 días', range: { from: addDays(new Date(), -6), to: new Date() } },
    { label: 'Últimos 14 días', range: { from: addDays(new Date(), -13), to: new Date() } },
    { label: 'Últimos 30 días', range: { from: addDays(new Date(), -29), to: new Date() } },
    { label: 'Este mes', range: { from: new Date(new Date().setDate(1)), to: new Date() } },
  ];

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
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y', { locale: es })} -{' '}
                  {format(date.to, 'LLL dd, y', { locale: es })}
                </>
              ) : (
                format(date.from, 'LLL dd, y', { locale: es })
              )
            ) : (
              <span>Selecciona un rango</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex" align="end">
            <div className="flex flex-col space-y-2 border-r pr-4 py-4 pl-4">
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
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
