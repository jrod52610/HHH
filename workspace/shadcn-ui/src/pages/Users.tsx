import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, Phone, UserPlus } from "lucide-react";
import { User } from "@/lib/types";
import { getUsers, deleteUser } from "@/lib/data";
import { UserForm } from "@/components/users/user-form";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendInvitationSMS } from "@/lib/twilio-service";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRole, setInviteRole] = useState("staff");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = () => {
    setUsers(getUsers());
  };
  
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsUserFormOpen(true);
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserFormOpen(true);
  };
  
  const handleDeleteConfirm = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      loadUsers();
    }
  };
  
  const handleUserSaved = () => {
    setIsUserFormOpen(false);
    setSelectedUser(null);
    loadUsers();
  };
  
  // Function to format phone number
  const formatPhoneNumber = (input: string) => {
    // Remove non-digit characters
    const cleaned = input.replace(/\D/g, '');
    
    // Format with international code if needed
    if (cleaned.length > 0) {
      if (!input.startsWith('+')) {
        return '+' + cleaned;
      }
    }
    
    return input;
  };

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvitePhone(formatPhoneNumber(e.target.value));
  };

  const handleSendInvite = async () => {
    if (!invitePhone.trim() || invitePhone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSendingInvite(true);
    
    try {
      // Send invitation SMS using Twilio service
      const success = await sendInvitationSMS(
        invitePhone, 
        currentUser?.name || 'TaskFlow Admin', 
        inviteRole
      );
      
      if (success) {
        toast.success(`Invitation sent to ${invitePhone}`);
        setInvitePhone("");
        setIsInviteDialogOpen(false);
      } else {
        toast.error("Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("An error occurred while sending the invitation");
    } finally {
      setIsSendingInvite(false);
    }
  };
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Admin</Badge>;
      case "manager":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Manager</Badge>;
      case "staff":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Staff</Badge>;
      case "guest":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Guest</Badge>;
      default:
        return null;
    }
  };

  return (
    <AppShell>
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Users</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Phone className="h-4 w-4" />
              Invite
            </Button>
            <Button
              onClick={handleCreateUser}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {user.phone}
                        </p>
                      </div>
                    </div>
                    <div>{getRoleBadge(user.role)}</div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    {currentUser?.id !== user.id && currentUser?.role === 'admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteConfirm(user)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <UserForm
          user={selectedUser}
          open={isUserFormOpen}
          onOpenChange={setIsUserFormOpen}
          onSave={handleUserSaved}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the user{" "}
                <strong>{userToDelete?.name}</strong>? This action cannot be
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
                onClick={handleDeleteUser}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite Dialog */}
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
              <DialogDescription>
                Send an invitation SMS to add a new user to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1234567890"
                  value={invitePhone}
                  onChange={handlePhoneChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  {currentUser?.role === 'admin' && <option value="admin">Admin</option>}
                  <option value="guest">Guest</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSendInvite} 
                disabled={!invitePhone.trim() || invitePhone.length < 10 || isSendingInvite}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {isSendingInvite ? 'Sending...' : 'Send SMS Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}