import React from 'react';
import { Search, Pin, PinOff } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export const LogoSection: React.FC = () => {
  const { state, open, setOpen, isMobile, isPinned, setIsPinned } = useSidebar();
  
  // Toggle pin functionality
  const handleTogglePin = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    if (newPinnedState) {
      // When pinning, ensure sidebar is open
      setOpen(true);
    }
  };
  
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Search className="h-4 w-4 text-white" />
        </div>
        <div className={`whitespace-nowrap transition-opacity duration-150 ease-in-out ${
          state === 'expanded' ? 'opacity-100' : 'group-data-[collapsible=icon]:opacity-0'
        } hidden md:block`}>
          <h2 className="text-lg font-semibold text-gray-900">TCC Deal Buddy</h2>
          <p className="text-sm text-gray-500">Price Intelligence</p>
        </div>
        {/* Mobile-specific logo text that's always visible */}
        <div className="md:hidden">
          <h2 className="text-lg font-semibold text-gray-900">TCC Deal Buddy</h2>
          <p className="text-sm text-gray-500">Price Intelligence</p>
        </div>
      </div>
      
      {/* Toggle Button - Only visible on desktop when sidebar is expanded */}
      <div className={`transition-opacity duration-150 ease-in-out ${
        state === 'expanded' && !isMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } hidden md:block`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTogglePin}
          className={`h-6 w-6 p-0 hover:bg-gray-100 ${
            isPinned ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
          }`}
          title={isPinned ? "🔒 PINNED - Click to unpin and enable auto-close" : "📌 Click to pin sidebar open"}
        >
          {isPinned ? (
            <PinOff className="h-3 w-3" />
          ) : (
            <Pin className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
};