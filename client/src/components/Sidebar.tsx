import { useState } from "react";
import { 
  Plus, MessageSquare, Trash2, Loader2,
  Home, Settings, ChevronLeft, ChevronRight, LogOut, FileText
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
    { id: "documents", label: "Documents", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside 
      className={cn(
        "h-full flex flex-col bg-black text-slate-300 border-r border-white/8 transition-all duration-300 relative select-none shrink-0",
        isCollapsed ? "w-16" : "w-60 xl:w-64"
      )}
    >
      
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black font-serif font-bold text-xs shrink-0">
            C
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-xs font-serif font-semibold tracking-tight text-white truncate">Curalink</div>
              <div className="text-[9px] text-slate-500 font-medium tracking-wider uppercase">Enterprise</div>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-full border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-all duration-200"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center py-2 border-b border-white/8">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="p-1 rounded-full border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-all"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
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
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium tracking-wide transition-all duration-200 relative",
                  isActive 
                    ? "bg-[#2563EB] text-white shadow-sm" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>

              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-full bg-[#0a0a0a] border border-white/10 text-[10px] font-semibold text-white shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}

        {/* Collapsible Recent Research (Only shown when activeTab is chat) */}
        {!isCollapsed && activeTab === "chat" && (
          <div className="pt-3 border-t border-white/8 mt-3 space-y-1.5">
            <div className="flex items-center justify-between px-2.5 text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
              <span>Recent Research</span>
              <button 
                onClick={onNew}
                className="p-1 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                title="New Research"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
              {loading && (
                <div className="flex items-center justify-center py-3 text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </div>
              )}
              {!loading && items.length === 0 && (
                <div className="px-2.5 py-3 text-[10px] text-slate-500 italic font-normal">
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
                      "group w-full flex items-start justify-between gap-1.5 rounded-xl px-2.5 py-2 text-left transition-all border",
                      isSelected 
                        ? "bg-[#121212] border-white/10 text-white font-medium" 
                        : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    )}
                  >
                    <div className="min-w-0 flex-1 flex items-start gap-2">
                      <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-50" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs">
                          {c.disease || c.patientName || "Untitled Research"}
                        </div>
                        <div className="truncate text-[9px] text-slate-500 font-normal">
                          {c.lastMessage || `${c.messageCount} searches`}
                        </div>
                      </div>
                    </div>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c.conversationId);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-red-400 cursor-pointer shrink-0"
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

      {/* Sidebar Footer with Profile & Sign Out */}
      <div className="border-t border-white/8 px-3 py-2.5 bg-[#0a0a0a]">
        <div className={cn(
          "flex items-center gap-2",
          isCollapsed ? "flex-col justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-full bg-[#18181b] border border-white/10 flex items-center justify-center text-[9px] font-bold text-white uppercase shrink-0">
              {initials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-white truncate">{userName}</div>
                <div className="text-[9px] text-slate-500 truncate font-normal">Mount Sinai Hospital</div>
              </div>
            )}
          </div>
          {!isCollapsed ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 hover:border-white/20 bg-transparent text-[9px] font-medium text-slate-400 hover:text-white transition-all duration-200 shrink-0 cursor-pointer"
            >
              <LogOut className="h-2.5 w-2.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all duration-200 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

    </aside>
  );
}
