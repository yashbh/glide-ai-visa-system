import { useAuth } from "./hooks/use-auth";
import { LoginPage } from "./pages/login";
import { AppShell } from "./components/layout/app-shell";

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen grid place-items-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AppShell />;
}
