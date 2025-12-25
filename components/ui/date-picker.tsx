'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type DateRangePickerProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Currently selected range */
  date?: DateRange;
  /** Called when the user selects a new range */
  onDateChange?: (range: DateRange) => void;
  /** Optional placeholder when no date is selected */
  placeholder?: string;
  /** Align the popover (default: start) */
  align?: 'start' | 'center' | 'end';
};

export function DateRangePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date range',
  align = 'start',
  className,
  ...props
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Handle selection from the Calendar (which returns { from, to } in range mode)
  const handleSelect = (selected: { from?: Date; to?: Date } | undefined) => {
    if (!selected) {
      onDateChange?.({ from: undefined, to: undefined });
      return;
    }

    const newRange = {
      from: selected.from,
      to: selected.to ?? selected.from, // if only one date is selected, treat to = from
    };

    onDateChange?.(newRange);
  };

  // Format the button text
  const displayText = (() => {
    if (!date?.from) return placeholder;
    if (!date?.to) return format(date.from, 'LLL dd, y');
    if (date.from.getTime() === date.to.getTime()) {
      return format(date.from, 'LLL dd, y');
    }
    return `${format(date.from, 'LLL dd, y')} - ${format(date.to, 'LLL dd, y')}`;
  })();

  return (
    <div className={cn('grid gap-2', className)} {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date?.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            mode="range"
            selected={{ from: date?.from, to: date?.to }}
            onSelect={(range) => {
              handleSelect(range as { from?: Date; to?: Date } | undefined);
              // Close popover when a full range is selected (optional UX improvement)
              if (range?.from && range?.to) {
                setOpen(false);
              }
            }}
            numberOfMonths={2} // Shows two months side-by-side for better range selection
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
