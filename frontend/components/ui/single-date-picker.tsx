// components/ui/single-date-picker.tsx
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type SingleDatePickerProps = React.HTMLAttributes<HTMLDivElement> & {
  date?: Date | undefined; // ← explicitly allow undefined
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  align?: 'start' | 'center' | 'end';
};

export function SingleDatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  align = 'start',
  className,
  ...props
}: SingleDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn('grid gap-2', className)} {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'LLL dd, y') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(day) => {
              onDateChange?.(day);
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
