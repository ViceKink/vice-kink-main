
import * as React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CustomDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
  className?: string;
  disableCalendar?: boolean;
}

export function CustomDatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date",
  className,
}: CustomDatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);
  
  // Generate days (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Months
  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];
  
  // Generate years (1900 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => currentYear - i
  );

  // Extract day, month, year from the selected date
  const day = selectedDate ? selectedDate.getDate().toString() : undefined;
  const month = selectedDate ? selectedDate.getMonth().toString() : undefined;
  const year = selectedDate ? selectedDate.getFullYear().toString() : undefined;

  // Function to update the date when selections change
  const updateDate = (part: 'day' | 'month' | 'year', value: string) => {
    const newDate = new Date(selectedDate || new Date());
    
    if (part === 'day') {
      newDate.setDate(parseInt(value));
    } else if (part === 'month') {
      newDate.setMonth(parseInt(value));
      
      // Handle edge cases like selecting April 31 or February 30
      const maxDaysInMonth = new Date(newDate.getFullYear(), parseInt(value) + 1, 0).getDate();
      if (newDate.getDate() > maxDaysInMonth) {
        newDate.setDate(maxDaysInMonth);
      }
    } else if (part === 'year') {
      newDate.setFullYear(parseInt(value));
      
      // Handle February 29 in non-leap years
      if (newDate.getMonth() === 1 && newDate.getDate() === 29) {
        const isLeapYear = (newDate.getFullYear() % 4 === 0 && newDate.getFullYear() % 100 !== 0) || newDate.getFullYear() % 400 === 0;
        if (!isLeapYear) {
          newDate.setDate(28);
        }
      }
    }
    
    // Check if date is disabled
    if (disabled && disabled(newDate)) {
      return;
    }
    
    setSelectedDate(newDate);
    onChange?.(newDate);
  };

  // Get available days for the selected month and year
  const getAvailableDays = () => {
    if (!month || !year) return days;
    
    const daysInMonth = new Date(parseInt(year), parseInt(month) + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const availableDays = getAvailableDays();

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-3">
        {/* Day Dropdown */}
        <div className="space-y-1">
          <Label htmlFor="day-select" className="text-xs">Day</Label>
          <Select
            value={day}
            onValueChange={(value) => updateDate('day', value)}
          >
            <SelectTrigger id="day-select" className="w-[80px]">
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent className="overflow-y-auto max-h-[240px] z-50 bg-popover">
              {availableDays.map((d) => (
                <SelectItem 
                  key={d} 
                  value={d.toString()} 
                  className="cursor-pointer"
                >
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month Dropdown */}
        <div className="space-y-1">
          <Label htmlFor="month-select" className="text-xs">Month</Label>
          <Select
            value={month}
            onValueChange={(value) => updateDate('month', value)}
          >
            <SelectTrigger id="month-select" className="w-[120px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="overflow-y-auto max-h-[240px] z-50 bg-popover">
              {months.map((m) => (
                <SelectItem 
                  key={m.value} 
                  value={m.value} 
                  className="cursor-pointer"
                >
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Dropdown */}
        <div className="space-y-1">
          <Label htmlFor="year-select" className="text-xs">Year</Label>
          <Select
            value={year}
            onValueChange={(value) => updateDate('year', value)}
          >
            <SelectTrigger id="year-select" className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="overflow-y-auto max-h-[240px] z-50 bg-popover">
              {years.map((y) => (
                <SelectItem 
                  key={y} 
                  value={y.toString()} 
                  className="cursor-pointer"
                >
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedDate && (
        <div className="text-sm text-foreground bg-muted p-2 rounded-md">
          {format(selectedDate, "PPP")}
        </div>
      )}
    </div>
  );
}
