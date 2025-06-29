import React from 'react';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';
import { MenuItem } from './types';

interface NavigationSectionProps {
  menuItems: MenuItem[];
  activeView: string;
  onViewChange: (view: string) => void;
}

export const NavigationSection: React.FC<NavigationSectionProps> = ({
  menuItems,
  activeView,
  onViewChange
}) => {
  return (
    <SidebarMenu>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.label}
              className="w-full justify-start"
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onViewChange(item.id);
                }}
                className="flex items-center gap-2 w-full"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};