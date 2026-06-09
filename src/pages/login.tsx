import { LoginForm } from "../components/auth/login-form";

export function LoginPage() {
  return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[480px] bg-white rounded-2xl border border-slate-200 shadow-regular-md p-8 relative">
        {/* Logo top-left */}
        <div className="absolute top-6 left-6">
          <div className="w-8 h-8 rounded-[8px] bg-blue-500 grid place-items-center text-white font-bold text-sm shadow-regular-sm">
            G
          </div>
        </div>

        {/* Close button top-right */}
        <button className="absolute top-6 right-6 w-8 h-8 grid place-items-center rounded-[8px] text-slate-400 hover:text-slate-600 hover:bg-slate-50">
          <i className="ri-close-line text-xl" />
        </button>

        {/* Content */}
        <div className="mt-12 flex flex-col items-center">
          {/* Avatar icon */}
          <div className="w-14 h-14 rounded-full bg-blue-50 grid place-items-center mb-5">
            <i className="ri-user-3-fill text-2xl text-blue-500" />
          </div>

          <h1 className="font-display font-semibold text-xl tracking-tight">Sign in to your account</h1>
          <p className="text-sm text-slate-400 mt-1 mb-6">Enter your details to login.</p>

          <LoginForm />
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-6">All rights reserved © 2025 Glide</p>
    </div>
  );
}
