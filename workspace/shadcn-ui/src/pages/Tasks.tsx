import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event, EventType } from "@/lib/types";
import { getEvents, getEventTypes, getUsers, saveEvent } from "@/lib/data";
import { Calendar, Clock, MapPin, User, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { EventForm } from "@/components/calendar/event-form";
import { useAuth } from "@/lib/auth-context";

export default function TasksPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"cleaning" | "maintenance" | "all">("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEvents(getEvents());
    setEventTypes(getEventTypes());
  };

  const getUserName = (userId: string) => {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    return user?.name || "Unknown";
  };

  const getEventTypeColor = (typeId: string) => {
    const type = eventTypes.find(t => t.id === typeId);
    return type?.color || "#888";
  };

  const getEventTypeName = (typeId: string) => {
    const type = eventTypes.find(t => t.id === typeId);
    return type?.name || "Unknown";
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEventFormOpen(true);
  };

  const handleEventSaved = () => {
    setIsEventFormOpen(false);
    setSelectedEvent(null);
    loadData();
  };

  const handleStatusChange = (event: Event, newStatus: "scheduled" | "in-progress" | "completed" | "cancelled") => {
    const updatedEvent = { ...event, status: newStatus };
    saveEvent(updatedEvent);
    loadData();
  };

  const filterEvents = (events: Event[]) => {
    if (activeTab === "all") {
      return events;
    }
    
    return events.filter(event => {
      const eventType = eventTypes.find(et => et.id === event.eventTypeId);
      return eventType?.category === activeTab;
    });
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="border-blue-400 text-blue-600">Scheduled</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="border-amber-400 text-amber-600">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-green-400 text-green-600">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="border-red-400 text-red-600">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const filteredEvents = filterEvents(events);

  return (
    <AppShell>
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tasks</h1>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={(val: string) => setActiveTab(val as "cleaning" | "maintenance" | "all")}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="cleaning">Cleaning Tasks</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Tasks</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found for this category
              </div>
            ) : (
              filteredEvents.map(event => (
                <Card key={event.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div 
                        className="w-2 h-full"
                        style={{ backgroundColor: getEventTypeColor(event.eventTypeId) }}
                      />
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">{getEventTypeName(event.eventTypeId)}</p>
                          </div>
                          <div>{renderStatusBadge(event.status)}</div>
                        </div>
                        
                        {event.description && (
                          <p className="mt-2 text-sm">{event.description}</p>
                        )}
                        
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-6">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {format(new Date(event.startTime), "MMM d, yyyy")}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
                              {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                            </span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          
                          {event.assignedTo && event.assignedTo.length > 0 && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <User className="h-4 w-4 mr-1" />
                              <span>
                                {event.assignedTo.map(userId => getUserName(userId)).join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex gap-2">
                            {event.status !== "completed" && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleStatusChange(event, "completed")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Complete
                              </Button>
                            )}
                            
                            {event.status === "scheduled" && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                onClick={() => handleStatusChange(event, "in-progress")}
                              >
                                Start
                              </Button>
                            )}
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

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