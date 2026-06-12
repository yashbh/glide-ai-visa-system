import { useAuth } from "../../hooks/use-auth";
import type { Conversation } from "../../types";

interface SidebarProps {
  currentView: string;
  activeConversationId: string | null;
  conversations: Conversation[];
  onNavigate: (view: string) => void;
  onOpenConversation: (id: string, title: string) => void;
  onDeleteConversation: (id: string) => void;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { id: "home", icon: "ri-add-line", label: "New Chat", className: "text-blue-500" },
  { id: "travelers", icon: "ri-group-line", label: "Travelers" },
  { id: "documents", icon: "ri-folder-3-line", label: "Documents" },
  { id: "dashboard", icon: "ri-dashboard-line", label: "Dashboard" },
  { id: "tracking", icon: "ri-map-pin-line", label: "Tracking" },
  { id: "library", icon: "ri-book-open-line", label: "Library" },
];

export function Sidebar({ currentView, activeConversationId, conversations, onNavigate, onOpenConversation, onDeleteConversation, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();

  return (
    <aside className="w-[272px] h-full bg-white flex flex-col py-5 px-3.5 pb-3.5 gap-4 min-h-0">
      {/* Top: logo + close (mobile) */}
      <div className="flex items-center justify-between px-1.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-blue-500 grid place-items-center text-white font-bold text-lg shadow-regular-sm">
            G
          </div>
          <span className="font-display font-semibold text-lg">Glide</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 text-[22px] bg-transparent border-none cursor-pointer grid place-items-center md:hidden"
        >
          <i className="ri-close-line" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-3 h-10 px-3 rounded-[8px] border-none w-full text-left cursor-pointer text-sm font-medium tracking-[-0.006em] transition-colors ${
              currentView === item.id && !(currentView === "home" && activeConversationId)
                ? "bg-slate-50 text-slate-950"
                : `bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950 ${item.className || ""}`
            }`}
          >
            <i className={`${item.icon} text-xl`} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px bg-slate-200 mx-1.5" />

      {/* Recent chats */}
      <div className="flex flex-col gap-0.5 flex-1 min-h-0 overflow-y-auto">
        <span className="text-xs font-medium text-slate-400 tracking-[0.02em] px-3 pt-2 pb-0.5">
          RECENT
        </span>
        {conversations.length === 0 && (
          <p className="text-xs text-slate-400 px-3 py-2">No conversations yet</p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`group flex items-center gap-2 h-9 px-3 rounded-[8px] cursor-pointer text-sm leading-5 transition-colors ${
              activeConversationId === conv.id
                ? "bg-slate-50 text-slate-950 font-medium"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
            onClick={() => onOpenConversation(conv.id, conv.title)}
          >
            <i className="ri-message-3-line text-base flex-none" />
            <span className="truncate flex-1">{conv.title}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
              className="hidden group-hover:grid w-6 h-6 place-items-center rounded-[6px] border-none bg-transparent text-slate-400 hover:text-red-500 hover:bg-red-50 text-sm cursor-pointer"
            >
              <i className="ri-delete-bin-line" />
            </button>
          </div>
        ))}
      </div>

      {/* User */}
      <div className="mt-auto flex items-center gap-2.5 py-2.5 px-2 border-t border-slate-200">
        <div className="w-8 h-8 rounded-full bg-slate-200 grid place-items-center text-sm font-medium text-slate-600">
          {user?.email?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium leading-[18px] truncate">{user?.email?.split("@")[0] || "User"}</div>
          <div className="text-xs leading-4 text-slate-400 truncate">{user?.email || ""}</div>
        </div>
        <button onClick={signOut} className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer bg-transparent border-none">
          <i className="ri-logout-box-r-line" />
        </button>
      </div>
    </aside>
  );
}
