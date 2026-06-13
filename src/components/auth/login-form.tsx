import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";

export function LoginForm() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = isSignUp
      ? await signUp(email, password, fullName.trim() || undefined)
      : await signIn(email, password);

    if (result) {
      setError(result);
    }
    setLoading(false);
  }

  return (
    <div className="w-full">
      {/* Form */}
      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Yash Bhati"
                required
                className="w-full h-10 pl-10 pr-3 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
              />
            </div>
          </div>
        )}

        <div className="mb-3">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Email Address<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@alignui.com"
              required
              className="w-full h-10 pl-10 pr-3 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Password<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <i className="ri-lock-2-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full h-10 pl-10 pr-10 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <i className="ri-eye-line text-lg" />
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-3">{error}</p>
        )}

        {/* Keep me logged in + Forgot */}
        <div className="flex items-center justify-between mb-5">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500/20" />
            Keep me logged in
          </label>
          <button type="button" className="text-sm text-slate-400 hover:text-blue-500">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-[10px] bg-blue-500 text-white text-sm font-medium shadow-regular-sm hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : isSignUp ? "Sign up" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
          className="text-blue-500 font-medium cursor-pointer underline"
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}
