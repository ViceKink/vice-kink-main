
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
}

export function CustomDatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date",
  className,
}: CustomDatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);
  
  // We'll separately track each part of the date to avoid automatic resetting
  const [selectedDay, setSelectedDay] = React.useState<string | undefined>(
    selectedDate ? selectedDate.getDate().toString() : undefined
  );
  const [selectedMonth, setSelectedMonth] = React.useState<string | undefined>(
    selectedDate ? selectedDate.getMonth().toString() : undefined
  );
  const [selectedYear, setSelectedYear] = React.useState<string | undefined>(
    selectedDate ? selectedDate.getFullYear().toString() : undefined
  );
  
  // Initialize the parts when the value prop changes
  React.useEffect(() => {
    if (value) {
      setSelectedDay(value.getDate().toString());
      setSelectedMonth(value.getMonth().toString());
      setSelectedYear(value.getFullYear().toString());
      setSelectedDate(value);
    }
  }, [value]);
  
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
  
  // Get available days for the selected month and year
  const getAvailableDays = () => {
    if (!selectedMonth || !selectedYear) return days;
    
    const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };
  
  const availableDays = getAvailableDays();
  
  // Function to update the date when selections change
  const updateDate = (part: 'day' | 'month' | 'year', value: string) => {
    // Update the individual part state
    if (part === 'day') {
      setSelectedDay(value);
    } else if (part === 'month') {
      setSelectedMonth(value);
    } else if (part === 'year') {
      setSelectedYear(value);
    }
    
    // Only try to construct a full date if we have all parts
    if (
      (part === 'day' && selectedMonth && selectedYear) ||
      (part === 'month' && selectedDay && selectedYear) ||
      (part === 'year' && selectedDay && selectedMonth)
    ) {
      // Use existing values for parts not currently being changed
      const day = part === 'day' ? parseInt(value) : selectedDay ? parseInt(selectedDay) : 1;
      const month = part === 'month' ? parseInt(value) : selectedMonth ? parseInt(selectedMonth) : 0;
      const year = part === 'year' ? parseInt(value) : selectedYear ? parseInt(selectedYear) : currentYear;
      
      // Create new date with all the parts
      let newDate = new Date(year, month, day, 12, 0, 0, 0);
      
      // Handle edge cases like selecting April 31 or February 30
      const maxDaysInMonth = new Date(year, month + 1, 0).getDate();
      if (day > maxDaysInMonth) {
        newDate = new Date(year, month, maxDaysInMonth, 12, 0, 0, 0);
        // Update the day state if it was adjusted
        setSelectedDay(maxDaysInMonth.toString());
      }
      
      // Check if date is disabled
      if (disabled && disabled(newDate)) {
        return;
      }
      
      setSelectedDate(newDate);
      onChange?.(newDate);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-3">
        {/* Day Dropdown */}
        <div className="space-y-1">
          <Label htmlFor="day-select" className="text-xs">Day</Label>
          <Select
            value={selectedDay}
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
            value={selectedMonth}
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
            value={selectedYear}
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
