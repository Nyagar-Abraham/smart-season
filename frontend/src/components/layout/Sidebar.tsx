import { Link, useLocation } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  Map as MapIcon,
  LogOut,
  Bell,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

interface SidebarProps {
  role: 'admin' | 'field_agent';
}

export function Sidebar({ role }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const adminLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
    { label: 'Fields', icon: MapIcon, to: '/fields' },
  ];

  const agentLinks = [
    { label: 'My Fields', icon: LayoutDashboard, to: '/' },
    { label: 'Updates Log', icon: Bell, to: '/updates' },
  ];

  const links = role === 'admin' ? adminLinks : agentLinks;

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        className="lg:hidden fixed top-4 left-4 z-50 p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transition-transform duration-300 transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 ">
            <div className="flex items-center gap-2">
              <img src="/smart-season-logo.webp" alt="SmartSeason Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-green-900">SmartSeason</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.to
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-50">
            <div className="flex items-center gap-3 px-3 py-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                {getInitials(user?.fullName || null)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 line-clamp-1">{user?.fullName || 'User'}</span>
                <span className="text-xs text-gray-500 capitalize">{user?.role.replace('_', ' ') || role.replace('_', ' ')}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-3"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
