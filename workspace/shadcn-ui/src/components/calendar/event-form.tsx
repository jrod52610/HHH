import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Event, EventType, User, EventStatus } from "@/lib/types";
import { getUsers, getEventTypes, saveEvent } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";

interface EventFormProps {
  event: Partial<Event> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function EventForm({ event, open, onOpenChange, onSave }: EventFormProps) {
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);

  // Load data
  useEffect(() => {
    setEventTypes(getEventTypes());
    setUsers(getUsers());
  }, []);

  // Set form data when event changes
  useEffect(() => {
    if (event) {
      setFormData(event);
      setStartDate(event.startTime ? new Date(event.startTime) : undefined);
      setEndDate(event.endTime ? new Date(event.endTime) : undefined);
      setAssignedUsers(event.assignedTo || []);
    } else {
      resetForm();
    }
  }, [event]);

  const resetForm = () => {
    setFormData({});
    setStartDate(undefined);
    setEndDate(undefined);
    setAssignedUsers([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleUserToggle = (userId: string) => {
    setAssignedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !startDate || !endDate || !formData.eventTypeId) {
      alert("Please fill in all required fields");
      return;
    }
    
    const eventToSave: Event = {
      ...(formData as Event),
      startTime: startDate,
      endTime: endDate,
      assignedTo: assignedUsers,
      status: formData.status || "scheduled",
      id: formData.id || Math.random().toString(36).substr(2, 9),
    };
    
    saveEvent(eventToSave);
    onSave();
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event?.id ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time*</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Select
                  value={startDate ? format(startDate, "HH:mm") : undefined}
                  onValueChange={(value) => {
                    if (!startDate) return;
                    const [hours, minutes] = value.split(':').map(Number);
                    const newDate = new Date(startDate);
                    newDate.setHours(hours, minutes);
                    setStartDate(newDate);
                  }}
                >
                  <SelectTrigger className="w-[110px]">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <>
                        <SelectItem key={`${hour}:00`} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {hour.toString().padStart(2, '0')}:00
                        </SelectItem>
                        <SelectItem key={`${hour}:30`} value={`${hour.toString().padStart(2, '0')}:30`}>
                          {hour.toString().padStart(2, '0')}:30
                        </SelectItem>
                      </>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time*</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Select
                  value={endDate ? format(endDate, "HH:mm") : undefined}
                  onValueChange={(value) => {
                    if (!endDate) return;
                    const [hours, minutes] = value.split(':').map(Number);
                    const newDate = new Date(endDate);
                    newDate.setHours(hours, minutes);
                    setEndDate(newDate);
                  }}
                >
                  <SelectTrigger className="w-[110px]">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <>
                        <SelectItem key={`${hour}:00`} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {hour.toString().padStart(2, '0')}:00
                        </SelectItem>
                        <SelectItem key={`${hour}:30`} value={`${hour.toString().padStart(2, '0')}:30`}>
                          {hour.toString().padStart(2, '0')}:30
                        </SelectItem>
                      </>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type*</Label>
            <Select 
              value={formData.eventTypeId} 
              onValueChange={(value) => handleSelectChange('eventTypeId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: type.color }}
                      />
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status || 'scheduled'} 
              onValueChange={(value) => handleSelectChange('status', value as EventStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assigned To</Label>
            <div className="border rounded-md p-3 space-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`user-${user.id}`}
                    checked={assignedUsers.includes(user.id)}
                    onCheckedChange={() => handleUserToggle(user.id)}
                  />
                  <Label htmlFor={`user-${user.id}`} className="flex items-center cursor-pointer">
                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mr-2">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    {user.name} ({user.role})
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}