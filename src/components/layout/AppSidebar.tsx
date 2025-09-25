import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  FileText,
  MessageSquare,
  Download,
  Settings,
  HelpCircle,
  Building2,
} from 'lucide-react';

const mainNavItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    url: '/projects',
    icon: FolderOpen,
  },
  {
    title: 'Clients',
    url: '/clients',
    icon: Building2,
  },
  {
    title: 'Checklists',
    url: '/checklists',
    icon: CheckSquare,
  },
  {
    title: 'Notes',
    url: '/notes',
    icon: FileText,
  },
];

const toolsNavItems = [
  {
    title: 'Chatbot',
    url: '/chatbot',
    icon: MessageSquare,
  },
  {
    title: 'Exports',
    url: '/exports',
    icon: Download,
  },
];

const systemNavItems = [
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
  {
    title: 'Help',
    url: '/help',
    icon: HelpCircle,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path)
      ? 'bg-primary text-primary-foreground font-medium'
      : 'hover:bg-accent hover:text-accent-foreground';

  return (
    <Sidebar className={`${collapsed ? 'w-14' : 'w-64'} border-r transition-all duration-200`}>
      <SidebarHeader className="border-b px-6 py-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-complie-accent to-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-lg text-complie-primary">COMPLIE</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-r from-complie-accent to-black rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">C</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          {systemNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} className={getNavCls(item.url)}>
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}