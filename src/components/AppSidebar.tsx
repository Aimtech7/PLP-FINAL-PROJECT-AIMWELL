import { useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Heart,
  Apple,
  Users,
  CreditCard,
  Settings,
  Shield,
  Award,
  FolderKanban,
  UserCog,
  Sparkles,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { useAdmin } from '@/hooks/useAdmin';

const mainItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'AI Summary', url: '/ai-summary', icon: Sparkles },
  { title: 'Education', url: '/education', icon: BookOpen },
  { title: 'Health Hub', url: '/health', icon: Heart },
  { title: 'Nutrition', url: '/nutrition', icon: Apple },
  { title: 'Community', url: '/community', icon: Users },
  { title: 'Certificates', url: '/certificates', icon: Award },
];

const accountItems = [
  { title: 'Subscription', url: '/subscription', icon: CreditCard },
  { title: 'Settings', url: '/settings', icon: Settings },
  { title: 'Course Management', url: '/course-management', icon: FolderKanban, adminOnly: true },
  { title: 'Admin', url: '/admin', icon: Shield, adminOnly: true },
  { title: 'Manage Admins', url: '/admin/manage', icon: UserCog, superAdminOnly: true },
];

export function AppSidebar() {
  const location = useLocation();
  const { isAdmin, isSuperAdmin } = useAdmin();

  const isActive = (path: string) => location.pathname === path;
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50";

  // Filter account items based on admin status
  const filteredAccountItems = accountItems.filter(item => {
    if (item.superAdminOnly) return isSuperAdmin;
    if (item.adminOnly) return isAdmin;
    return true;
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-2">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">AIMWELL</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredAccountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}