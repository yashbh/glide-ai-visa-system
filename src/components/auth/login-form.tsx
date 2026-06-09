import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";

export function LoginForm() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (result) {
      setError(result);
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-[380px]">
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 rounded-[10px] bg-blue-500 grid place-items-center text-white font-bold text-lg shadow-regular-sm">
          G
        </div>
        <span className="font-display font-semibold text-lg">Glide</span>
      </div>

      <h1 className="font-display font-medium text-[28px] leading-9 tracking-tight">
        {isSignUp ? "Create your account" : "Welcome back"}
      </h1>
      <p className="text-[15px] leading-[22px] text-slate-600 mt-1.5 mb-7">
        {isSignUp ? "Start your visa journey with Glide." : "Sign in to continue your applications."}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-950 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full h-10 px-3 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-950 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full h-10 px-3 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-[10px] bg-blue-500 text-white text-sm font-medium shadow-regular-sm hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5 text-slate-400 text-xs font-medium uppercase tracking-wide">
        <span className="flex-1 h-px bg-slate-200" />
        or
        <span className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="flex gap-2.5">
        <button className="flex-1 h-10 border border-slate-200 rounded-[10px] bg-white shadow-regular-xs flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
          <i className="ri-google-fill text-lg" />
          Google
        </button>
        <button className="flex-1 h-10 border border-slate-200 rounded-[10px] bg-white shadow-regular-xs flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
          <i className="ri-apple-fill text-lg" />
          Apple
        </button>
      </div>

      <p className="text-center text-sm text-slate-600 mt-7">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
          className="text-blue-500 font-medium cursor-pointer"
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}
