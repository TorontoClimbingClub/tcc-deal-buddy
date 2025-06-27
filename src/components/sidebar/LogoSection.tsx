import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useSidebar } from '@/components/ui/aceternity-sidebar';

export const LogoSection: React.FC = () => {
  const { open, isMobile } = useSidebar();
  
  return (
    <div className="flex items-center gap-3 px-2 py-3">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
        <Search className="h-4 w-4 text-white" />
      </div>
      <motion.div
        animate={{
          opacity: (open || isMobile) ? 1 : 0,
          display: (open || isMobile) ? "block" : "none",
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
  );
};