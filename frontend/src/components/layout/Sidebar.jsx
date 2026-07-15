import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ClipboardCheck, 
  Workflow, 
  Search, 
  Wrench, 
  TerminalSquare, 
  Settings 
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chat', label: 'Live Chat', icon: MessageSquare },
  { path: '/evaluation', label: 'Evaluation', icon: ClipboardCheck },
  { path: '/graph', label: 'Execution Graph', icon: Workflow },
  { path: '/retrieval', label: 'Retrieval Viewer', icon: Search },
  { path: '/tool', label: 'Tool Inspector', icon: Wrench },
  { path: '/prompts', label: 'Prompt Inspector', icon: TerminalSquare },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#0B1220] border-r border-[#1f2937] flex flex-col hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
          <Workflow className="text-primary w-8 h-8" />
          ASRE
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-muted hover:bg-card hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-[#1f2937]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            U
          </div>
          <div className="flex flex-col text-sm">
            <span className="text-white font-medium">User</span>
            <span className="text-muted text-xs">Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
