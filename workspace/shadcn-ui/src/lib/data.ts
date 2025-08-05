import { User, Permission, EventType, Event, EventCategory } from './types';

// Local storage keys
export const USERS_STORAGE_KEY = 'taskflow-users';
export const PERMISSIONS_STORAGE_KEY = 'taskflow-permissions';
export const USER_PERMISSIONS_STORAGE_KEY = 'taskflow-user-permissions';
export const EVENT_TYPES_STORAGE_KEY = 'taskflow-event-types';
export const EVENTS_STORAGE_KEY = 'taskflow-events';

// Generate default users if not exist
export const getDefaultUsers = (): User[] => {
  return [
    {
      id: '1',
      name: 'Admin User',
      phone: '+1234567890',
      role: 'admin',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=admin',
    },
    {
      id: '2',
      name: 'Manager User',
      phone: '+1987654321',
      role: 'manager',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=manager',
    },
    {
      id: '3',
      name: 'Staff User',
      phone: '+1555123456',
      role: 'staff',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=staff',
    }
  ];
};

// Generate default permissions if not exist
export const getDefaultPermissions = (): Permission[] => {
  return [
    {
      id: '1',
      name: 'Calendar',
      description: 'Access to calendar features',
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
    },
    {
      id: '2',
      name: 'Tasks',
      description: 'Access to cleaning and maintenance tasks',
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
    },
    {
      id: '3',
      name: 'Users',
      description: 'Access to user management',
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
    },
  ];
};

// Generate default event types if not exist
export const getDefaultEventTypes = (): EventType[] => {
  return [
    {
      id: '1',
      name: 'Regular Cleaning',
      category: 'cleaning',
      color: '#22c55e', // Green
    },
    {
      id: '2',
      name: 'Deep Cleaning',
      category: 'cleaning',
      color: '#3b82f6', // Blue
    },
    {
      id: '3',
      name: 'Routine Maintenance',
      category: 'maintenance',
      color: '#f59e0b', // Amber
    },
    {
      id: '4',
      name: 'Emergency Repair',
      category: 'maintenance',
      color: '#ef4444', // Red
    },
    {
      id: '5',
      name: 'Team Meeting',
      category: 'meeting',
      color: '#8b5cf6', // Purple
    }
  ] as EventType[];
};

// Generate sample events if not exist
export const getSampleEvents = (): Event[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: '1',
      title: 'Office Cleaning',
      description: 'Regular weekly cleaning of the main office area',
      startTime: new Date(today.setHours(9, 0, 0, 0)),
      endTime: new Date(today.setHours(11, 0, 0, 0)),
      eventTypeId: '1',
      status: 'scheduled',
      createdBy: '1',
      assignedTo: ['3'],
      location: 'Main Office',
      recurrence: {
        pattern: 'weekly',
        interval: 1,
      },
    },
    {
      id: '2',
      title: 'HVAC Maintenance',
      description: 'Regular check of the HVAC system',
      startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
      eventTypeId: '3',
      status: 'scheduled',
      createdBy: '1',
      assignedTo: ['2', '3'],
      location: 'Mechanical Room',
    },
    {
      id: '3',
      title: 'Team Status Update',
      description: 'Weekly team meeting to discuss ongoing tasks',
      startTime: new Date(nextWeek.setHours(10, 0, 0, 0)),
      endTime: new Date(nextWeek.setHours(11, 0, 0, 0)),
      eventTypeId: '5',
      status: 'scheduled',
      createdBy: '1',
      assignedTo: ['1', '2', '3'],
      location: 'Conference Room',
      recurrence: {
        pattern: 'weekly',
        interval: 1,
      },
    }
  ];
};

// Storage helpers
export const getFromStorage = <T>(key: string, defaultData: T): T => {
  if (typeof window === 'undefined') return defaultData;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultData;
};

export const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Initialize data in local storage
export const initializeData = () => {
  // Users
  const existingUsers = getFromStorage<User[]>(USERS_STORAGE_KEY, []);
  if (existingUsers.length === 0) {
    saveToStorage(USERS_STORAGE_KEY, getDefaultUsers());
  }
  
  // Permissions
  const existingPermissions = getFromStorage<Permission[]>(PERMISSIONS_STORAGE_KEY, []);
  if (existingPermissions.length === 0) {
    saveToStorage(PERMISSIONS_STORAGE_KEY, getDefaultPermissions());
  }

  // Event Types
  const existingEventTypes = getFromStorage<EventType[]>(EVENT_TYPES_STORAGE_KEY, []);
  if (existingEventTypes.length === 0) {
    saveToStorage(EVENT_TYPES_STORAGE_KEY, getDefaultEventTypes());
  }

  // Events
  const existingEvents = getFromStorage<Event[]>(EVENTS_STORAGE_KEY, []);
  if (existingEvents.length === 0) {
    saveToStorage(EVENTS_STORAGE_KEY, getSampleEvents());
  }
};

// Data access functions
export const getUsers = (): User[] => {
  return getFromStorage<User[]>(USERS_STORAGE_KEY, []);
};

export const getPermissions = (): Permission[] => {
  return getFromStorage<Permission[]>(PERMISSIONS_STORAGE_KEY, []);
};

export const getEventTypes = (): EventType[] => {
  return getFromStorage<EventType[]>(EVENT_TYPES_STORAGE_KEY, []);
};

export const getEvents = (): Event[] => {
  const events = getFromStorage<Event[]>(EVENTS_STORAGE_KEY, []);
  return events.map(event => ({
    ...event,
    startTime: new Date(event.startTime),
    endTime: new Date(event.endTime),
    recurrence: event.recurrence
      ? {
          ...event.recurrence,
          endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined,
        }
      : undefined,
  }));
};

export const saveEvent = (event: Event): void => {
  const events = getEvents();
  const existingEventIndex = events.findIndex(e => e.id === event.id);

  if (existingEventIndex >= 0) {
    events[existingEventIndex] = event;
  } else {
    events.push({
      ...event,
      id: Math.random().toString(36).substr(2, 9), // Simple ID generation
    });
  }

  saveToStorage(EVENTS_STORAGE_KEY, events);
};

export const deleteEvent = (eventId: string): void => {
  const events = getEvents();
  const filteredEvents = events.filter(event => event.id !== eventId);
  saveToStorage(EVENTS_STORAGE_KEY, filteredEvents);
};

export const saveUser = (user: User): User => {
  const users = getUsers();
  
  if (!user.id) {
    user.id = Math.random().toString(36).substr(2, 9);
    users.push(user);
  } else {
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
  }
  
  saveToStorage(USERS_STORAGE_KEY, users);
  return user;
};

export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== userId);
  saveToStorage(USERS_STORAGE_KEY, filteredUsers);
};

export const saveEventType = (eventType: EventType): EventType => {
  const eventTypes = getEventTypes();
  
  if (!eventType.id) {
    eventType.id = Math.random().toString(36).substr(2, 9);
    eventTypes.push(eventType);
  } else {
    const index = eventTypes.findIndex(et => et.id === eventType.id);
    if (index >= 0) {
      eventTypes[index] = eventType;
    } else {
      eventTypes.push(eventType);
    }
  }
  
  saveToStorage(EVENT_TYPES_STORAGE_KEY, eventTypes);
  return eventType;
};

export const deleteEventType = (eventTypeId: string): void => {
  const eventTypes = getEventTypes();
  const filteredEventTypes = eventTypes.filter(et => et.id !== eventTypeId);
  saveToStorage(EVENT_TYPES_STORAGE_KEY, filteredEventTypes);
};

// Get event categories
export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'general', label: 'General' },
  { value: 'meeting', label: 'Meeting' },
];