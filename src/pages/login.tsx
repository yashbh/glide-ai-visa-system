import { LoginForm } from "../components/auth/login-form";

export function LoginPage() {
  return (
    <div className="h-screen grid grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col justify-center items-center px-10">
        <LoginForm />
      </div>

      {/* Right: branded panel */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-14 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-[120px] -bottom-[120px] w-[380px] h-[380px] rounded-full bg-white/[0.06]" />

        <div>
          <blockquote className="font-display font-medium text-[28px] leading-10 tracking-tight max-w-[460px]">
            "Glide handled my Schengen application in 20 minutes — I spent more time picking my hotel."
          </blockquote>
          <p className="text-[15px] leading-[22px] opacity-80 mt-4">
            James B. — Germany Tourist Visa, 2026
          </p>
        </div>

        <div className="flex gap-5">
          <div className="flex items-center gap-2 text-[13px] opacity-90">
            <i className="ri-shield-check-line text-lg" />
            Bank-grade encryption
          </div>
          <div className="flex items-center gap-2 text-[13px] opacity-90">
            <i className="ri-time-line text-lg" />
            90% faster prep
          </div>
          <div className="flex items-center gap-2 text-[13px] opacity-90">
            <i className="ri-check-double-line text-lg" />
            98% approval rate
          </div>
        </div>
      </div>
    </div>
  );
}
