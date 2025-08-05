import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventType, EventCategory } from "@/lib/types";
import { getEventTypes, saveEventType, deleteEventType, EVENT_CATEGORIES } from "@/lib/data";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EventTypeFormData {
  id?: string;
  name: string;
  category: EventCategory;
  color: string;
}

export default function SettingsPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [formData, setFormData] = useState<EventTypeFormData>({
    name: '',
    category: 'general',
    color: '#3b82f6',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventTypeToDelete, setEventTypeToDelete] = useState<EventType | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = () => {
    setEventTypes(getEventTypes());
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'general',
      color: '#3b82f6',
    });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleEditEventType = (eventType: EventType) => {
    setFormData({
      id: eventType.id,
      name: eventType.name,
      category: eventType.category,
      color: eventType.color,
    });
    setIsEditing(true);
  };

  const handleDeleteConfirm = (eventType: EventType) => {
    setEventTypeToDelete(eventType);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteEventType = () => {
    if (eventTypeToDelete) {
      deleteEventType(eventTypeToDelete.id);
      setIsDeleteDialogOpen(false);
      setEventTypeToDelete(null);
      loadEventTypes();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.color) {
      alert('Please fill in all required fields');
      return;
    }
    
    saveEventType(formData as EventType);
    loadEventTypes();
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <AppShell>
      <div className="p-6 h-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="event-types">
          <TabsList className="mb-4">
            <TabsTrigger value="event-types">Event Types</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="event-types">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>{isEditing ? 'Edit Event Type' : 'Add Event Type'}</CardTitle>
                    <CardDescription>
                      {isEditing 
                        ? 'Update the details of this event type' 
                        : 'Create a new type of event for the calendar'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => handleSelectChange('category', value as EventCategory)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {EVENT_CATEGORIES.map(category => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="color"
                            name="color"
                            type="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            className="w-12 h-9 p-1"
                          />
                          <Input
                            value={formData.color}
                            onChange={(e) => handleSelectChange('color', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2">
                        {isEditing && (
                          <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
                        )}
                        <Button type="submit">
                          {isEditing ? 'Update' : 'Add'} Event Type
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Types</CardTitle>
                    <CardDescription>
                      Manage all event types used in your calendar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {eventTypes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No event types defined yet
                        </div>
                      ) : (
                        eventTypes.map(eventType => (
                          <div 
                            key={eventType.id} 
                            className="flex items-center justify-between p-3 border rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: eventType.color }}
                              />
                              <div>
                                <div className="font-medium">{eventType.name}</div>
                                <div className="text-sm text-muted-foreground capitalize">
                                  {eventType.category}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditEventType(eventType)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteConfirm(eventType)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>
                  View and manage permissions for different user roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Feature</th>
                        <th className="text-center py-3 px-4">Admin</th>
                        <th className="text-center py-3 px-4">Manager</th>
                        <th className="text-center py-3 px-4">Staff</th>
                        <th className="text-center py-3 px-4">Guest</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">View Calendar</td>
                        <td className="text-center py-3 px-4"><Check className="h-4 w-4 inline text-green-600" /></td>
                        <td className="text-center py-3 px-4"><Check className="h-4 w-4 inline text-green-600" /></td>
                        <td className="text-center py-3 px-4"><Check className="h-4 w-4 inline text-green-600" /></td>
                        <td className="text-center py-3 px-4"><Check className="h-4 w-4 inline text-green-600" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Create Events</td>
                        <td className="text-center py-3 px-4"><Check className="h-4 w-4 inline text-green-600" /></td>
                        <td className="text-center py-3 px-4"><Check className="h-4 w-4 inline text-green-600" /></td>
                        <td className="text-center py-3 px-4"><Check className="h-4 w-4 inline text-green-600" /></td>
                        <td className="text-center py-3 px-4"><X className="h-4 w-4 inline text-red-600" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Manage Users</td>
                        <td className="text-center py-3 px-4"><Check className="h-4 w-4 inline text-green-600" /></td>
                        <td className="text-center py-3 px-4"><Check className="h-4 w-4 inline text-green-600" /></td>
                        <td className="text-center py-3 px-4"><X className="h-4 w-4 inline text-red-600" /></td>
                        <td className="text-center py-3 px-4"><X className="h-4 w-4 inline text-red-600" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Manage Event Types</td>
                        <td className="text-center py-3 px-4"><Check className="h-4 w-4 inline text-green-600" /></td>
                        <td className="text-center py-3 px-4"><Check className="h-4 w-4 inline text-green-600" /></td>
                        <td className="text-center py-3 px-4"><X className="h-4 w-4 inline text-red-600" /></td>
                        <td className="text-center py-3 px-4"><X className="h-4 w-4 inline text-red-600" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Manage Settings</td>
                        <td className="text-center py-3 px-4"><Check className="h-4 w-4 inline text-green-600" /></td>
                        <td className="text-center py-3 px-4"><X className="h-4 w-4 inline text-red-600" /></td>
                        <td className="text-center py-3 px-4"><X className="h-4 w-4 inline text-red-600" /></td>
                        <td className="text-center py-3 px-4"><X className="h-4 w-4 inline text-red-600" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the event type{" "}
                <strong>{eventTypeToDelete?.name}</strong>? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteEventType}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}