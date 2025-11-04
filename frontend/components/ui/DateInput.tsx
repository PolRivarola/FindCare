"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateInputProps {
  value?: string; 
  onChange: (value: string) => void;
  min?: string; 
  max?: string; 
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  enableYearNavigation?: boolean; 
  fromYear?: number; 
  toYear?: number; 
}

export function DateInput({
  value,
  onChange,
  min,
  max,
  placeholder = "Selecciona una fecha",
  className,
  id,
  disabled,
  enableYearNavigation = false,
  fromYear,
  toYear,
}: DateInputProps) {
  const [open, setOpen] = React.useState(false);
  
  const date = value ? new Date(value + "T00:00:00") : undefined;
  
  const displayValue = date
    ? format(date, "dd/MM/yyyy", { locale: es })
    : "";

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      onChange(formattedDate);
      setOpen(false);
    }
  };

  const minDate = min ? new Date(min + "T00:00:00") : undefined;
  const maxDate = max ? new Date(max + "T00:00:00") : undefined;
  
  const currentYear = new Date().getFullYear();
  const defaultFromYear = fromYear || (enableYearNavigation ? currentYear - 100 : undefined);
  const defaultToYear = toYear || (enableYearNavigation ? currentYear : undefined);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10",
              !date && "text-muted-foreground",
              className
            )}
            disabled={disabled}
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? displayValue : <span className="text-muted-foreground">{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
            captionLayout={enableYearNavigation ? "dropdown-buttons" : "buttons"}
            fromYear={defaultFromYear}
            toYear={defaultToYear}
            locale={es}
            classNames={enableYearNavigation ? {
              caption_label: "hidden",
            } : undefined}
          />
        </PopoverContent>
      </Popover>
      <input type="hidden" id={id} value={value || ""} />
    </div>
  );
}

