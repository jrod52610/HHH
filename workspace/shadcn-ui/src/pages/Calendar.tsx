import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";
import { CalendarView } from "@/components/calendar/calendar-view";
import { EventForm } from "@/components/calendar/event-form";
import { Event } from "@/lib/types";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const { currentUser } = useAuth();

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsCreatingEvent(false);
    setIsEventFormOpen(true);
  };

  const handleDateClick = (date: Date) => {
    // Creating a new event for the selected date
    const startTime = new Date(date);
    startTime.setHours(9, 0, 0, 0); // Default to 9:00 AM

    const endTime = new Date(date);
    endTime.setHours(10, 0, 0, 0); // Default to 10:00 AM

    setSelectedEvent({
      id: "",
      title: "",
      startTime,
      endTime,
      eventTypeId: "",
      status: "scheduled",
      createdBy: currentUser?.id || "",
      assignedTo: [],
    });

    setIsCreatingEvent(true);
    setIsEventFormOpen(true);
  };

  const handleCreateEvent = () => {
    // Set default values for a new event
    const now = new Date();
    const endTime = new Date(now);
    endTime.setHours(now.getHours() + 1);

    setSelectedEvent({
      id: "",
      title: "",
      startTime: now,
      endTime,
      eventTypeId: "",
      status: "scheduled",
      createdBy: currentUser?.id || "",
      assignedTo: [],
    });

    setIsCreatingEvent(true);
    setIsEventFormOpen(true);
  };

  const handleEventSaved = () => {
    setIsEventFormOpen(false);
    setSelectedEvent(null);
  };

  return (
    <AppShell>
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <Button 
            onClick={handleCreateEvent} 
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </div>

        <div className="flex-1">
          <CalendarView 
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        </div>

        <EventForm
          event={selectedEvent}
          open={isEventFormOpen}
          onOpenChange={setIsEventFormOpen}
          onSave={handleEventSaved}
        />
      </div>
    </AppShell>
  );
}