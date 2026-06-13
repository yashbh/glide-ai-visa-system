import { useState, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { ChatHomePage } from "../../pages/chat-home";
import { ChatPage } from "../../pages/chat";
import { DocumentsPage } from "../../pages/documents";
import { DashboardPage } from "../../pages/dashboard";
import { TrackingPage } from "../../pages/tracking";
import { TravelersPage } from "../../pages/travelers";
import { useConversations } from "../../hooks/use-conversations";
import { useTravelers } from "../../hooks/use-travelers";
import { useAuth } from "../../hooks/use-auth";

export function AppShell() {
  const { user } = useAuth();
  const [view, setView] = useState("home");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [chatCountry, setChatCountry] = useState<string>("germany");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const { conversations, refresh: refreshConversations, deleteConversation } = useConversations();
  const { travelers, addTraveler, updateTraveler, deleteTraveler } = useTravelers(user?.id || "");

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
    setMobileMenuOpen(false);
  }, []);

  function navigate(v: string) {
    if (v === "home") {
      setActiveConversationId(null);
    }
    setView(v);
    setMobileMenuOpen(false);
  }

  function handleMenuToggle() {
    // On mobile: open overlay. On desktop: toggle sidebar collapse.
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setMobileMenuOpen(true);
    } else {
      setDesktopSidebarOpen((prev) => !prev);
    }
  }

  const showTopbar = view === "home";
  const chatTitle = conversations.find((c) => c.id === activeConversationId)?.title || `Travel to ${chatCountry.charAt(0).toUpperCase() + chatCountry.slice(1)}`;

  async function handleDeleteActive() {
    if (!activeConversationId) return;
    await deleteConversation(activeConversationId);
    setActiveConversationId(null);
    setView("home");
  }

  const travelerList = travelers.map((t) => ({ name: t.name, relationship: t.relationship }));

  return (
    <div className="h-screen flex bg-white text-slate-950 overflow-hidden">
      {/* Mobile sidebar overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar (overlay) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[272px] transform transition-transform duration-200 ease-out md:hidden
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar
          currentView={view}
          activeConversationId={activeConversationId}
          conversations={conversations}
          onNavigate={navigate}
          onOpenConversation={openConversation}
          onDeleteConversation={async (id) => {
            await deleteConversation(id);
            if (activeConversationId === id) {
              setActiveConversationId(null);
              setView("home");
            }
          }}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Desktop sidebar (inline, collapsible) */}
      <div className={`hidden md:block transition-all duration-200 ease-out overflow-hidden ${desktopSidebarOpen ? "w-[272px]" : "w-0"}`}>
        <Sidebar
          currentView={view}
          activeConversationId={activeConversationId}
          conversations={conversations}
          onNavigate={navigate}
          onOpenConversation={openConversation}
          onDeleteConversation={async (id) => {
            await deleteConversation(id);
            if (activeConversationId === id) {
              setActiveConversationId(null);
              setView("home");
            }
          }}
          onClose={() => setDesktopSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 md:m-2 md:ml-0 md:rounded-2xl bg-slate-50 md:border md:border-slate-200 overflow-hidden">
        {showTopbar && <Topbar title="New chat" onMenuToggle={handleMenuToggle} />}
        {view === "home" && <ChatHomePage onStartChat={startNewChat} />}
        {view === "chat" && activeConversationId && (
          <ChatPage
            key={activeConversationId}
            conversationId={activeConversationId}
            country={chatCountry}
            title={chatTitle}
            isNew={!conversations.some((c) => c.id === activeConversationId)}
            existingTravelers={travelerList}
            onConversationCreated={refreshConversations}
            onTravelersAdded={async (newTravelers) => {
              for (const t of newTravelers) {
                await addTraveler(t.name, t.relationship);
              }
            }}
            onDelete={handleDeleteActive}
            onMenuToggle={handleMenuToggle}
          />
        )}
        {view === "documents" && <DocumentsPage onMenuToggle={handleMenuToggle} />}
        {view === "travelers" && (
          <TravelersPage
            travelers={travelers}
            onAdd={addTraveler}
            onUpdate={updateTraveler}
            onDelete={deleteTraveler}
            onMenuToggle={handleMenuToggle}
          />
        )}
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
