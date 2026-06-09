import { useState, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { ChatHomePage } from "../../pages/chat-home";
import { ChatPage } from "../../pages/chat";
import { DocumentsPage } from "../../pages/documents";
import { DashboardPage } from "../../pages/dashboard";
import { TrackingPage } from "../../pages/tracking";
import { useConversations } from "../../hooks/use-conversations";

export function AppShell() {
  const [view, setView] = useState("home");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [chatCountry, setChatCountry] = useState<string>("germany");
  const { conversations, refresh: refreshConversations } = useConversations();

  const startNewChat = useCallback((country: string) => {
    const newId = crypto.randomUUID();
    setActiveConversationId(newId);
    setChatCountry(country);
    setView("chat");
  }, []);

  const openConversation = useCallback((conversationId: string, title: string) => {
    setActiveConversationId(conversationId);
    const country = title.toLowerCase().includes("france") ? "france" : "germany";
    setChatCountry(country);
    setView("chat");
  }, []);

  function navigate(v: string) {
    if (v === "home") {
      setActiveConversationId(null);
    }
    setView(v);
  }

  const showTopbar = view === "home" || view === "chat";
  const topbarTitle = view === "chat"
    ? conversations.find((c) => c.id === activeConversationId)?.title || `Travel to ${chatCountry.charAt(0).toUpperCase() + chatCountry.slice(1)}`
    : "New chat";

  return (
    <div className="h-screen grid grid-cols-[272px_1fr] bg-white text-slate-950 overflow-hidden">
      <Sidebar
        currentView={view}
        activeConversationId={activeConversationId}
        conversations={conversations}
        onNavigate={navigate}
        onOpenConversation={openConversation}
      />
      <main className="flex flex-col min-w-0 min-h-0">
        {showTopbar && <Topbar title={topbarTitle} />}
        {view === "home" && <ChatHomePage onStartChat={startNewChat} />}
        {view === "chat" && activeConversationId && (
          <ChatPage
            key={activeConversationId}
            conversationId={activeConversationId}
            country={chatCountry}
            isNew={!conversations.some((c) => c.id === activeConversationId)}
            onConversationCreated={refreshConversations}
          />
        )}
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
