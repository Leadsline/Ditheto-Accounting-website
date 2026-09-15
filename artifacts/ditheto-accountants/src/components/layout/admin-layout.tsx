import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, CalendarClock, Megaphone, LogOut, Bell, UserRoundCog, Settings } from "lucide-react";
import { useUser, useClerk } from "@clerk/react";
import { useRole } from "@/hooks/use-role";
import logo from "@assets/logo_1789318782052.png";

export function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClerk>{children}</AdminLayoutClerk>;
}

function AdminLayoutClerk({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { role, isFullAccess, isMarketingOnly } = useRole();
  
  return <AdminLayoutContent 
    user={user} 
    role={role}
    isFullAccess={isFullAccess}
    isMarketingOnly={isMarketingOnly}
    signOut={() => signOut({ redirectUrl: import.meta.env.BASE_URL })} 
  >
    {children}
  </AdminLayoutContent>;
}

function AdminLayoutContent({ 
  children, 
  user, 
  role,
  isFullAccess,
  isMarketingOnly,
  signOut 
}: { 
  children: ReactNode, 
  user: any, 
  role: string,
  isFullAccess: boolean,
  isMarketingOnly: boolean,
  signOut: () => void 
}) {
  const [location] = useLocation();

  const allNavItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/clients", label: "Client Database", icon: Users },
    { path: "/admin/reminders", label: "Reminders", icon: CalendarClock },
    { path: "/admin/campaigns", label: "Marketing / Posters", icon: Megaphone },
    { path: "/admin/team", label: "Team & Organogram", icon: UserRoundCog },
    { path: "/admin/settings/integrations", label: "Integrations", icon: Settings },
  ];
  const navItems = isMarketingOnly
    ? allNavItems.filter((item) => item.path === "/admin/campaigns")
    : allNavItems;
  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    ceo: "CEO — Full Access",
    senior_manager: "Senior Manager — Full Access",
    marketing_staff: "Staff Team — Marketing",
    staff: "Staff Team — Marketing",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-white flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="p-4 border-b border-white/10 h-20 flex items-center justify-center bg-white">
          <img src={logo} alt="Ditheto" className="h-10 object-contain" />
        </div>
        
        <div className="px-4 py-6 font-semibold text-xs uppercase tracking-wider text-gray-400">
          Admin Portal
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isCurrent = location === item.path || (item.path === "/admin/clients" && location.startsWith("/admin/clients")) || (item.path === "/admin/settings/integrations" && location.startsWith("/admin/settings"));
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  isCurrent ? "bg-primary text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isCurrent ? "text-white" : "text-gray-400"}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors w-full cursor-pointer">
            <LogOut className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-heading font-bold text-secondary">
            {navItems.find(i => location.startsWith(i.path))?.label || "Admin"}
          </h2>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-secondary transition-colors cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase">
                {user?.firstName?.[0] || 'U'}
                {user?.lastName?.[0] || ''}
              </div>
              <div className="text-sm">
                <p className="font-bold text-secondary">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-gray-500 text-xs">
                  {roleLabels[role] ?? (isFullAccess ? "Full Access" : "Staff Team")}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}