import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 bg-card border-b border-[#1f2937] flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-muted hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden md:flex items-center gap-2 bg-[#0B1220] px-4 py-2 rounded-full border border-[#1f2937] focus-within:border-primary/50 transition-colors w-96">
          <Search className="w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search runs, cases, or tools..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-muted"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted hover:text-white transition-colors rounded-full hover:bg-[#0B1220]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
