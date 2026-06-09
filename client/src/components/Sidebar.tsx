import { useEffect, useState } from "react";
import { 
  Plus, MessageSquare, Trash2, Activity, Loader2,
  Home, Settings, ChevronLeft, ChevronRight, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  items: any[];
  loading: boolean;
  onLogout: () => void;
  onDelete: (id: string) => void;
  refreshKey: number;
}

export function Sidebar({ 
  activeTab, onTabChange, activeId, onSelect, onNew, items, loading, onLogout, onDelete, refreshKey 
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useUser();
  const userName = user?.fullName || "Dr. Sarah Jenkins";

  const initials = userName
    ? userName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "SJ";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "chat", label: "Research Workspace", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside 
      className={cn(
        "h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.3)] pulse-cyan-glow">
            <Activity className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in min-w-0">
              <div className="text-sm font-bold tracking-tight text-white font-display truncate">Curalink</div>
              <div className="text-[10px] text-cyan-400 font-light mt-0.5 uppercase tracking-widest">Medical AI</div>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-lg border border-sidebar-border hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-white transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center py-2 border-b border-sidebar-border">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 rounded-lg border border-sidebar-border hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-white transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => {
                  onTabChange(item.id);
                }}
                className={cn(
                  "w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all select-none relative",
                  isActive 
                    ? "bg-primary text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)]" 
                    : "text-slate-400 hover:bg-sidebar-accent hover:text-slate-200"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {isActive && (
                  <div className="absolute left-0 top-1/4 w-1 h-1/2 bg-cyan-400 rounded-r-md" />
                )}
              </button>

              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold text-white shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all pointer-events-none z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}

        {/* Collapsible Recent Research (Only shown when activeTab is chat) */}
        {!isCollapsed && activeTab === "chat" && (
          <div className="pt-4 border-t border-sidebar-border mt-4 space-y-2">
            <div className="flex items-center justify-between px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>Recent Research</span>
              <button 
                onClick={onNew}
                className="p-1 rounded hover:bg-sidebar-accent text-slate-400 hover:text-white transition-colors"
                title="New Research"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
              {loading && (
                <div className="flex items-center justify-center py-4 text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </div>
              )}
              {!loading && items.length === 0 && (
                <div className="px-3 py-4 text-[10px] text-slate-500 italic font-light">
                  No saved reports
                </div>
              )}

              {items.map((c) => {
                const isSelected = activeId === c.conversationId;
                return (
                  <button
                    key={c.conversationId}
                    onClick={() => onSelect(c.conversationId)}
                    className={cn(
                      "group w-full flex items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-all border border-transparent",
                      isSelected 
                        ? "bg-slate-900 border-slate-800 text-cyan-400 font-medium" 
                        : "text-slate-400 hover:bg-slate-950/60 hover:text-slate-200"
                    )}
                  >
                    <div className="min-w-0 flex-1 flex items-start gap-2">
                      <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-60 text-slate-455" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs">
                          {c.disease || c.patientName || "Untitled Research"}
                        </div>
                        <div className="truncate text-[9px] text-slate-500 mt-0.5 font-light">
                          {c.lastMessage || `${c.messageCount} searches`}
                        </div>
                      </div>
                    </div>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c.conversationId);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-950/50 hover:text-red-400 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer with Sign Out */}
      <div className="border-t border-sidebar-border px-4 py-3 flex flex-col gap-2 bg-slate-950/40">
        <div className={cn(
          "flex items-center gap-2",
          isCollapsed ? "flex-col justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
              {initials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-slate-200 truncate">{userName}</div>
                <div className="text-[9px] text-slate-500 mt-0.5 truncate font-light">Mount Sinai Hospital</div>
              </div>
            )}
          </div>
          {!isCollapsed ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-[10px] font-semibold text-red-400 hover:text-red-300 transition-all duration-200 shrink-0 cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all duration-200 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

    </aside>
  );
}
