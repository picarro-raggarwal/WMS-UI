import * as React from "react";
import { format } from "date-fns";

import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Clock } from "lucide-react";
import { Input } from "./input";
import { DateInput, DateSegment, FieldError, Label, Text, TimeField } from "react-aria-components";
import { Time } from "@internationalized/date";

interface DateTimePicker24hProps extends Omit<React.ComponentProps<typeof Input>, "onChange"> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  timeInputType?: "dropdown" | "field";
  futureOnly?: boolean;
}

export function DateTimePicker24h({
  value,
  name,
  id,
  onChange,
  timeInputType = "field",
  futureOnly = false,
  ...props
}: DateTimePicker24hProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse the value prop to get the current date
  const date = value && typeof value === "string" && value ? new Date(value) : undefined;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  // Helper to create a synthetic event and call onChange
  const handleDateTimeChange = (newDate: Date) => {
    if (onChange) {
      const formattedValue = format(newDate, "yyyy-MM-dd'T'HH:mm");
      const syntheticEvent = {
        target: {
          name: name || "",
          value: formattedValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // If we have an existing time, preserve it, otherwise set to current time
      if (date) {
        selectedDate.setHours(date.getHours());
        selectedDate.setMinutes(date.getMinutes());
      } else {
        const now = new Date();
        selectedDate.setHours(now.getHours());
        selectedDate.setMinutes(now.getMinutes());
      }
      handleDateTimeChange(selectedDate);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", timeValue: string) => {
    const currentDate = date || new Date();
    const newDate = new Date(currentDate);

    if (type === "hour") {
      newDate.setHours(parseInt(timeValue));
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(timeValue));
    }

    handleDateTimeChange(newDate);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal shadow-input active:scale-[1]",
            !date && "text-muted-foreground"
          )}>
          <CalendarIcon className="opacity-50 mr-0 w-4 h-4" />
          {date ? format(date, "MM/dd/yyyy HH:mm") : <span>MM/DD/YYYY HH:mm</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            disabled={(date) =>
              futureOnly && date < new Date(new Date().setDate(new Date().getDate() - 1))
            }
          />
          <div className="flex gap-2 bg-white px-4 py-4 border-neutral-200 border-t">
            <div className="flex items-center gap-1">
              <Clock className="size-4 text-neutral-400" />
              <span className="font-medium text-neutral-800 text-sm tracking-tight">Time</span>
            </div>
            <div className="flex-1" />

            {timeInputType === "field" ? (
              <TimeField
                hourCycle={24}
                className={
                  "flex h-9 w-full items-center font-medium justify-between rounded-lg border border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 hover:bg-neutral-100 px-3 py-1 text-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 shadow-input dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-400 dark:focus:ring-neutral-300"
                }
                value={date ? new Time(date.getHours(), date.getMinutes()) : null}
                onChange={(time) => {
                  if (time) {
                    const currentDate = date || new Date();
                    const newDate = new Date(currentDate);
                    newDate.setHours(time.hour);
                    newDate.setMinutes(time.minute);
                    handleDateTimeChange(newDate);
                  }
                }}>
                <DateInput>
                  {(segment) => (
                    <DateSegment
                      segment={segment}
                      className={
                        "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none  focus-visible:bg-primary-500  focus-visible:text-white focus-visible:ring-transparent py-1  px-0.5 -mx-0.5 hover:bg-white/50 hover:shadow-sm rounded-md"
                      }
                    />
                  )}
                </DateInput>
              </TimeField>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <label className="sr-only font-medium text-xs">Hour</label>
                  <Select
                    value={date ? date.getHours().toString() : ""}
                    onValueChange={(value) => handleTimeChange("hour", value)}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue placeholder="--" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour.toString()}>
                          {hour.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="sr-only font-medium text-xs">Minute</label>
                  <Select
                    value={date ? date.getMinutes().toString() : ""}
                    onValueChange={(value) => handleTimeChange("minute", value)}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue placeholder="--" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute.toString()}>
                          {minute.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
