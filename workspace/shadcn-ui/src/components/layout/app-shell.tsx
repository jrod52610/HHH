import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <Calendar className="h-6 w-6" />
          <h1 className="text-xl font-bold">TaskFlow</h1>
        </div>
        
        {/* Navigation links */}
        <nav className="flex-1 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-white hover:bg-slate-800" 
            onClick={() => navigate('/')}
          >
            <Calendar className="h-5 w-5" />
            <span>Calendar</span>
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-white hover:bg-slate-800" 
            onClick={() => navigate('/tasks')}
          >
            <Clock className="h-5 w-5" />
            <span>Tasks</span>
          </Button>
          
          {currentUser?.role === 'admin' || currentUser?.role === 'manager' ? (
            <>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 text-white hover:bg-slate-800" 
                onClick={() => navigate('/users')}
              >
                <Users className="h-5 w-5" />
                <span>Users</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 text-white hover:bg-slate-800" 
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Button>
            </>
          ) : null}
        </nav>
        
        {/* User info and logout */}
        <div className="border-t border-slate-700 pt-4 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{currentUser?.name}</p>
              <p className="text-sm text-slate-400 capitalize">{currentUser?.role}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-white hover:bg-slate-800" 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}