import { useState, useMemo, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  addMonths,
  format,
} from "date-fns";

export function useCalendarState() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");

  const dateRange = useMemo(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      return {
        days: eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
        start: calendarStart,
        end: calendarEnd,
      };
    } else { // week view
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return {
        days: eachDayOfInterval({ start: weekStart, end: weekEnd }),
        start: weekStart,
        end: weekEnd,
      };
    }
  }, [currentDate, viewMode]);

  const navigatePrevious = useCallback(() => {
    setCurrentDate((prev) => (viewMode === "month" ? addMonths(prev, -1) : addWeeks(prev, -1)));
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    setCurrentDate((prev) => (viewMode === "month" ? addMonths(prev, 1) : addWeeks(prev, 1)));
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const headerText = useMemo(() => 
    viewMode === "month"
      ? format(currentDate, "MMMM yyyy")
      : `${format(startOfWeek(currentDate), "MMM d")} - ${format(endOfWeek(currentDate), "MMM d, yyyy")}`
  , [currentDate, viewMode]);

  return {
    currentDate,
    viewMode,
    setViewMode,
    dateRange,
    headerText,
    navigatePrevious,
    navigateNext,
    goToToday,
  };
}
