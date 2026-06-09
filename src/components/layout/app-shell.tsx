import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { ChatHomePage } from "../../pages/chat-home";
import { ChatPage } from "../../pages/chat";
import { DocumentsPage } from "../../pages/documents";
import { DashboardPage } from "../../pages/dashboard";
import { TrackingPage } from "../../pages/tracking";

const VIEW_TITLES: Record<string, string> = {
  home: "New chat",
  chat: "Travel to Germany",
  documents: "Documents",
  dashboard: "Dashboard",
  tracking: "Tracking",
  library: "Library",
};

export function AppShell() {
  const [view, setView] = useState("home");
  const [chatCountry, setChatCountry] = useState<string | null>(null);

  function startChat(country: string) {
    setChatCountry(country);
    setView("chat");
  }

  function navigate(v: string) {
    if (v === "home") {
      setChatCountry(null);
    }
    setView(v);
  }

  const showTopbar = view === "home" || view === "chat";

  return (
    <div className="h-screen grid grid-cols-[272px_1fr] bg-white text-slate-950 overflow-hidden">
      <Sidebar currentView={view} onNavigate={navigate} />
      <main className="flex flex-col min-w-0 min-h-0">
        {showTopbar && <Topbar title={VIEW_TITLES[view] || "Glide"} />}
        {view === "home" && <ChatHomePage onStartChat={startChat} />}
        {view === "chat" && <ChatPage country={chatCountry || "germany"} />}
        {view === "documents" && <DocumentsPage />}
        {view === "dashboard" && <DashboardPage />}
        {view === "tracking" && <TrackingPage />}
        {view === "library" && (
          <div className="flex-1 grid place-items-center">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 grid place-items-center text-[26px] mx-auto mb-3">
                <i className="ri-book-open-fill" />
              </div>
              <h1 className="font-display font-medium text-2xl">Library</h1>
              <p className="text-[15px] text-slate-600 mt-1">Visa guides and templates — coming soon.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
