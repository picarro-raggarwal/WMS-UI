import { Input } from "@/components/ui/input";
import { cn } from "@/utils";
import { FC, ReactElement, useEffect, useRef, useState } from "react";

interface DurationInputProps {
  value: number; // Duration in seconds
  onChange: (totalSeconds: number) => void;
  maxSeconds?: number;
  minSeconds?: number;
  className?: string;
  onError?: () => void;
  onSuccess?: () => void;
}

export const DurationInput: FC<DurationInputProps> = ({
  value,
  onChange,
  className,
  maxSeconds = 600, // Default 10 minutes
  minSeconds = 0,
  onError,
  onSuccess
}): ReactElement => {
  const [minutes, setMinutes] = useState<string>("");
  const [seconds, setSeconds] = useState<string>("");
  const [error, setError] = useState({ isError: false, msg: "" });
  const [isMinutesFocused, setIsMinutesFocused] = useState(false);
  const [isSecondsFocused, setIsSecondsFocused] = useState(false);

  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);

  // Call error callbacks when error state changes
  useEffect(() => {
    if (onError && onSuccess) {
      if (error.isError) {
        onError();
      } else {
        onSuccess();
      }
    }
  }, [error.isError, onError, onSuccess]);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value === 0) {
      setMinutes("");
      setSeconds("");
    } else {
      const mins = Math.floor(value / 60);
      const secs = value % 60;
      setMinutes(mins > 0 ? mins.toString() : "");
      setSeconds(secs > 0 ? secs.toString() : "");
    }
  }, [value]);

  const validateAndUpdate = (newMinutes: string, newSeconds: string) => {
    setError({ isError: false, msg: "" });

    const mins = parseInt(newMinutes) || 0;
    const secs = parseInt(newSeconds) || 0;

    // Validation
    if (mins > 60) {
      setError({
        isError: true,
        msg: "Minutes cannot be greater than 60"
      });
    }

    if (secs > 59) {
      setError({
        isError: true,
        msg: "Seconds cannot be greater than 59"
      });
    }

    const totalVal = mins * 60 + secs;

    if (totalVal > maxSeconds) {
      setError({
        isError: true,
        msg: `Duration cannot be greater than ${Math.floor(
          maxSeconds / 60
        )} minutes`
      });
    }

    if (totalVal < minSeconds && totalVal !== 0) {
      setError({
        isError: true,
        msg: `Duration cannot be less than ${Math.floor(
          minSeconds / 60
        )} minute`
      });
    }

    onChange(totalVal);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, ""); // Only digits

    // Remove leading zeros while typing (except for single "0")
    if (inputValue.length > 1 && inputValue.startsWith("0")) {
      inputValue = inputValue.replace(/^0+/, "");
    }

    // Limit to 2 digits and max 60
    inputValue = inputValue.slice(0, 2);
    if (parseInt(inputValue) > 60) {
      inputValue = "60";
    }

    setMinutes(inputValue);

    // Only validate if we have a complete value or it's empty
    if (inputValue === "" || parseInt(inputValue) > 0) {
      validateAndUpdate(inputValue, seconds);
    }

    // Auto-focus to seconds when 2 digits entered or when they type a valid single digit > 6
    if (
      inputValue.length === 2 ||
      (inputValue.length === 1 && parseInt(inputValue) > 6)
    ) {
      setTimeout(() => secondsRef.current?.focus(), 0);
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, ""); // Only digits

    // Remove leading zeros while typing (except for single "0")
    if (
      inputValue.length > 1 &&
      inputValue.startsWith("0") &&
      inputValue !== "00"
    ) {
      inputValue = inputValue.replace(/^0+/, "");
    }

    // Limit to 2 digits and max 59
    inputValue = inputValue.slice(0, 2);
    if (parseInt(inputValue) > 59) {
      inputValue = "59";
    }

    setSeconds(inputValue);

    // Only validate if we have a complete value or it's empty
    if (inputValue === "" || parseInt(inputValue) >= 0) {
      validateAndUpdate(minutes, inputValue);
    }
  };

  const handleMinutesFocus = () => {
    setIsMinutesFocused(true);
  };

  const handleMinutesBlur = () => {
    setIsMinutesFocused(false);
    // Format on blur - no padding needed for minutes
  };

  const handleSecondsFocus = () => {
    setIsSecondsFocused(true);
  };

  const handleSecondsBlur = () => {
    setIsSecondsFocused(false);
    // Format on blur - add leading zero for single digit seconds
    if (seconds.length === 1 && seconds !== "") {
      const paddedSeconds = seconds.padStart(2, "0");
      setSeconds(paddedSeconds);
      validateAndUpdate(minutes, paddedSeconds);
    }
  };

  const handleMinutesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Tab" ||
      e.key === "ArrowRight" ||
      e.key === ":" ||
      e.key === "."
    ) {
      e.preventDefault();
      secondsRef.current?.focus();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      secondsRef.current?.focus();
    }
    if (e.key === "Backspace" && minutes === "" && secondsRef.current) {
      // Allow backspace to move to previous field if current is empty
    }
  };

  const handleSecondsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0) {
      e.preventDefault();
      minutesRef.current?.focus();
    }
    if (e.key === "Backspace" && seconds === "") {
      e.preventDefault();
      minutesRef.current?.focus();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      // Trigger blur to format and then blur the field
      e.currentTarget.blur();
    }
  };

  return (
    <div
      className={cn("relative flex flex-col items-end", className)}
      role="group"
      aria-label="Duration input"
    >
      <div className="flex items-center gap-1">
        <div className="relative">
          <Input
            ref={minutesRef}
            type="text"
            inputMode="numeric"
            value={minutes}
            onChange={handleMinutesChange}
            onKeyDown={handleMinutesKeyDown}
            onFocus={handleMinutesFocus}
            onBlur={handleMinutesBlur}
            placeholder={isMinutesFocused ? "00" : "mm"}
            aria-label="Minutes"
            className={cn(
              "px-0.5 [&>input]:px-2 py-1 w-12 !min-w-0 h-9 text-sm text-center transition-all",
              error.isError &&
                "border-red-500 focus:border-red-500 focus:ring-red-500 hover:border-red-500 hover:ring-red-500",
              isMinutesFocused && "ring-1 ring-primary-500 border-primary-500"
            )}
            maxLength={2}
          />
        </div>

        <span className="font-medium text-gray-400 text-sm select-none">:</span>

        <div className="relative">
          <Input
            ref={secondsRef}
            type="text"
            inputMode="numeric"
            value={seconds}
            onChange={handleSecondsChange}
            onKeyDown={handleSecondsKeyDown}
            onFocus={handleSecondsFocus}
            onBlur={handleSecondsBlur}
            placeholder={isSecondsFocused ? "00" : "ss"}
            aria-label="Seconds"
            className={cn(
              "px-0.5 [&>input]:px-2 py-1 w-12 !min-w-0 h-9 text-sm text-center transition-all",
              error.isError &&
                "border-red-500 focus:border-red-500 focus:ring-red-500",
              isSecondsFocused && "ring-1 ring-primary-500 border-primary-500"
            )}
            maxLength={2}
          />
        </div>
      </div>

      {error.isError && (
        <div className="top-full right-0 z-10 mt-1 text-[0.7rem] text-red-600 whitespace-wrap">
          {error.msg}
        </div>
      )}
    </div>
  );
};
