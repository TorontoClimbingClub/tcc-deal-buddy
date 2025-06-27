import React from 'react';
import { SidebarLink } from '@/components/ui/aceternity-sidebar';
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
    <div className="flex flex-col gap-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        
        return (
          <SidebarLink
            key={item.id}
            link={{
              label: item.label,
              href: `#${item.id}`,
              icon: (
                <Icon className={`h-5 w-5 ${
                  isActive ? 'text-blue-600' : 'text-gray-600 group-hover/sidebar:text-blue-600'
                }`} />
              )
            }}
            className={`${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'} rounded-lg px-2`}
            onClick={(e) => {
              e.preventDefault();
              onViewChange(item.id);
            }}
          />
        );
      })}
    </div>
  );
};