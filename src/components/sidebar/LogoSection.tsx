import React from 'react';
import { Search, Pin, PinOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useSidebar } from '@/components/ui/aceternity-sidebar';
import { Button } from '@/components/ui/button';

export const LogoSection: React.FC = () => {
  const { open, isMobile, pinned, setPinned, setOpen } = useSidebar();
  
  const handleTogglePin = () => {
    setPinned(!pinned);
    // If pinning, ensure sidebar is open
    if (!pinned) {
      setOpen(true);
    }
  };
  
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Search className="h-4 w-4 text-white" />
        </div>
        <motion.div
          animate={{
            opacity: (open || isMobile || pinned) ? 1 : 0,
            display: (open || isMobile || pinned) ? "block" : "none",
          }}
          className="whitespace-nowrap hidden md:block md:inline"
        >
          <h2 className="text-lg font-semibold text-gray-900">TCC Deal Buddy</h2>
          <p className="text-sm text-gray-500">Price Intelligence</p>
        </motion.div>
        {/* Mobile-specific logo text that's always visible */}
        <div className="md:hidden">
          <h2 className="text-lg font-semibold text-gray-900">TCC Deal Buddy</h2>
          <p className="text-sm text-gray-500">Price Intelligence</p>
        </div>
      </div>
      
      {/* Pin Button - Only visible on desktop when sidebar is open */}
      <motion.div
        animate={{
          opacity: (open || pinned) && !isMobile ? 1 : 0,
          display: (open || pinned) && !isMobile ? "block" : "none",
        }}
        className="hidden md:block"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTogglePin}
          className="h-6 w-6 p-0 hover:bg-gray-100"
          title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
        >
          {pinned ? (
            <PinOff className="h-3 w-3 text-gray-600" />
          ) : (
            <Pin className="h-3 w-3 text-gray-600" />
          )}
        </Button>
      </motion.div>
    </div>
  );
};