export type User = {
  id: string;
  name: string;
  phone: string; // Changed from email to phone for SMS-based auth
  role: "admin" | "manager" | "staff" | "guest";
  avatar?: string;
};

export type Permission = {
  id: string;
  name: string;
  description: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export type UserPermission = {
  userId: string;
  permissionId: string;
};

export type EventCategory = "cleaning" | "maintenance" | "general" | "meeting";

export type EventType = {
  id: string;
  name: string;
  category: EventCategory;
  color: string;
};

export type EventStatus = "scheduled" | "in-progress" | "completed" | "cancelled";

export type Event = {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  eventTypeId: string;
  status: EventStatus;
  createdBy: string;
  assignedTo: string[];
  location?: string;
  recurrence?: {
    pattern: "daily" | "weekly" | "monthly" | "custom";
    interval: number;
    endDate?: Date;
  };
};