import { useEffect, useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Event, EventType } from "@/lib/types";
import { getEvents, getEventTypes } from "@/lib/data";

interface CalendarViewProps {
  onEventClick: (event: Event) => void;
  onDateClick: (date: Date) => void;
}

export function CalendarView({ onEventClick, onDateClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [view, setView] = useState<"month" | "week" | "day">("month");

  useEffect(() => {
    setEvents(getEvents());
    setEventTypes(getEventTypes());
  }, []);

  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";

    return (
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">
          {format(currentMonth, dateFormat)}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    const dateFormat = "EEE";
    const days = [];
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium py-2">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = startOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    const day = startDate;
    let formattedDate = "";

    // Get all days in the month view
    const daysInMonthView = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    // Group events by date for quick lookup
    const eventsByDate: Record<string, Event[]> = {};
    events.forEach(event => {
      const dateStr = format(new Date(event.startTime), "yyyy-MM-dd");
      if (!eventsByDate[dateStr]) {
        eventsByDate[dateStr] = [];
      }
      eventsByDate[dateStr].push(event);
    });

    // Create calendar grid
    daysInMonthView.forEach((day, i) => {
      formattedDate = format(day, dateFormat);
      const dateStr = format(day, "yyyy-MM-dd");
      const dayEvents = eventsByDate[dateStr] || [];
      
      days.push(
        <div
          key={day.toString()}
          className={`min-h-[100px] p-2 border border-slate-200 ${
            !isSameMonth(day, monthStart)
              ? "bg-slate-50 text-slate-400"
              : isSameDay(day, selectedDate)
              ? "bg-blue-50 border-blue-200"
              : ""
          }`}
          onClick={() => {
            setSelectedDate(day);
            onDateClick(day);
          }}
        >
          <div className="flex justify-between">
            <span>{formattedDate}</span>
            {isSameDay(day, new Date()) && (
              <span className="bg-blue-500 text-white text-xs px-1 rounded-full">
                Today
              </span>
            )}
          </div>

          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 3).map((event) => {
              const eventType = eventTypes.find(
                (et) => et.id === event.eventTypeId
              );
              return (
                <div
                  key={event.id}
                  className="text-xs p-1 rounded truncate cursor-pointer"
                  style={{ backgroundColor: eventType?.color + "33", color: eventType?.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  {format(new Date(event.startTime), "HH:mm")} {event.title}
                </div>
              );
            })}
            {dayEvents.length > 3 && (
              <div className="text-xs text-slate-500">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div key={day.toString()} className="grid grid-cols-7">
            {days}
          </div>
        );
        days = [];
      }
    });

    return <div className="space-y-1">{rows}</div>;
  };

  const renderViewSelector = () => {
    return (
      <div className="mb-4">
        <div className="bg-slate-100 p-1 rounded-md inline-flex">
          <Button
            variant={view === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("month")}
            className="rounded-r-none"
          >
            Month
          </Button>
          <Button
            variant={view === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("week")}
            className="rounded-none"
          >
            Week
          </Button>
          <Button
            variant={view === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("day")}
            className="rounded-l-none"
          >
            Day
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4">
      {renderViewSelector()}
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </Card>
  );
}