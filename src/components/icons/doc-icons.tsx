interface IconProps {
  className?: string;
  size?: number;
}

export function PassportIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="passport-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A5F" />
          <stop offset="100%" stopColor="#0F2440" />
        </linearGradient>
        <linearGradient id="passport-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D77A" />
          <stop offset="100%" stopColor="#C9A83E" />
        </linearGradient>
      </defs>
      <rect x="8" y="4" width="48" height="56" rx="4" fill="url(#passport-bg)" />
      <rect x="8" y="4" width="48" height="56" rx="4" stroke="#0D1B2A" strokeWidth="1" />
      <circle cx="32" cy="28" r="10" stroke="url(#passport-gold)" strokeWidth="2" fill="none" />
      <circle cx="32" cy="28" r="7" stroke="url(#passport-gold)" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="32" cy="25" r="3.5" fill="url(#passport-gold)" opacity="0.8" />
      <path d="M26 34c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="url(#passport-gold)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <text x="32" y="48" textAnchor="middle" fontFamily="serif" fontSize="5" fill="#F5D77A" letterSpacing="2">PASSPORT</text>
      <path d="M20 52h24" stroke="#F5D77A" strokeWidth="0.5" opacity="0.4" />
      <rect x="10" y="6" width="44" height="2" rx="1" fill="#F5D77A" opacity="0.15" />
    </svg>
  );
}

export function CoverLetterIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="cl-paper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <linearGradient id="cl-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect x="10" y="6" width="44" height="52" rx="3" fill="url(#cl-paper)" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="10" y="6" width="44" height="10" rx="3" fill="url(#cl-accent)" />
      <rect x="15" y="9" width="16" height="2" rx="1" fill="white" opacity="0.9" />
      <rect x="15" y="13" width="10" height="1.5" rx="0.75" fill="white" opacity="0.5" />
      <rect x="15" y="22" width="28" height="2" rx="1" fill="#94A3B8" />
      <rect x="15" y="27" width="34" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="15" y="31" width="34" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="15" y="35" width="28" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="15" y="39" width="34" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="15" y="43" width="20" height="1.5" rx="0.75" fill="#CBD5E1" />
      <path d="M15 50 Q20 47 25 50" stroke="#1D4ED8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="38" y="48" width="12" height="6" rx="1" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="0.8" />
      <path d="M41 51l1.5 1.5L46 49.5" stroke="#3B82F6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PassportPhotoIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="pp-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DBEAFE" />
          <stop offset="100%" stopColor="#BFDBFE" />
        </linearGradient>
        <linearGradient id="pp-skin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <rect x="10" y="6" width="44" height="52" rx="3" fill="url(#pp-bg)" stroke="#93C5FD" strokeWidth="1" />
      <circle cx="32" cy="26" r="9" fill="url(#pp-skin)" />
      <circle cx="32" cy="23" r="5" fill="#FDE68A" />
      <path d="M22 44c0-5.52 4.48-10 10-10s10 4.48 10 10" fill="#60A5FA" />
      {/* Crop marks */}
      <path d="M12 14V8h6" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M52 14V8h-6" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 50v6h6" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M52 50v6h-6" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
      {/* Size label */}
      <rect x="20" y="51" width="24" height="4" rx="2" fill="white" opacity="0.8" />
      <text x="32" y="54.5" textAnchor="middle" fontSize="3.5" fill="#64748B" fontFamily="sans-serif">35 × 45 mm</text>
    </svg>
  );
}

export function BankStatementIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="bs-paper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="bs-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect x="10" y="6" width="44" height="52" rx="3" fill="url(#bs-paper)" stroke="#CBD5E1" strokeWidth="1" />
      {/* Bank logo area */}
      <rect x="15" y="10" width="8" height="8" rx="2" fill="url(#bs-green)" />
      <path d="M19 12l3 2h-6l3-2z" fill="white" />
      <path d="M17 14v2.5M19 14v2.5M21 14v2.5" stroke="white" strokeWidth="0.6" />
      <rect x="26" y="11" width="18" height="2" rx="1" fill="#334155" />
      <rect x="26" y="15" width="12" height="1.5" rx="0.75" fill="#94A3B8" />
      {/* Statement rows */}
      <path d="M15 22h34" stroke="#E2E8F0" strokeWidth="0.8" />
      <rect x="15" y="25" width="14" height="1.5" rx="0.75" fill="#64748B" />
      <rect x="40" y="25" width="9" height="1.5" rx="0.75" fill="#10B981" />
      <path d="M15 30h34" stroke="#E2E8F0" strokeWidth="0.5" />
      <rect x="15" y="32" width="16" height="1.5" rx="0.75" fill="#64748B" />
      <rect x="40" y="32" width="7" height="1.5" rx="0.75" fill="#EF4444" />
      <path d="M15 37h34" stroke="#E2E8F0" strokeWidth="0.5" />
      <rect x="15" y="39" width="12" height="1.5" rx="0.75" fill="#64748B" />
      <rect x="40" y="39" width="9" height="1.5" rx="0.75" fill="#10B981" />
      <path d="M15 44h34" stroke="#E2E8F0" strokeWidth="0.5" />
      {/* Balance box */}
      <rect x="15" y="48" width="34" height="7" rx="2" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="0.8" />
      <text x="19" y="53" fontSize="3.5" fill="#64748B" fontFamily="sans-serif">Balance</text>
      <text x="49" y="53" textAnchor="end" fontSize="4" fill="#059669" fontWeight="bold" fontFamily="sans-serif">$12,450</text>
    </svg>
  );
}

export function FlightBookingIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="fb-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DBEAFE" />
          <stop offset="100%" stopColor="#EFF6FF" />
        </linearGradient>
        <linearGradient id="fb-ticket" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
      </defs>
      <rect x="6" y="14" width="52" height="36" rx="4" fill="url(#fb-ticket)" stroke="#CBD5E1" strokeWidth="1" />
      {/* Perforation line */}
      <path d="M44 14v36" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 2" />
      {/* Airline header */}
      <rect x="10" y="18" width="30" height="3" rx="1.5" fill="#3B82F6" opacity="0.2" />
      <circle cx="13" cy="19.5" r="2" fill="#3B82F6" />
      {/* Route */}
      <text x="13" y="29" fontSize="5" fill="#1E293B" fontWeight="bold" fontFamily="sans-serif">DEL</text>
      <text x="30" y="29" fontSize="5" fill="#1E293B" fontWeight="bold" fontFamily="sans-serif">FRA</text>
      {/* Plane icon between cities */}
      <path d="M22 27l5-1.5 0 3z" fill="#3B82F6" />
      <path d="M20 27h8" stroke="#93C5FD" strokeWidth="0.8" strokeDasharray="1 1" />
      {/* Details */}
      <text x="13" y="35" fontSize="3" fill="#64748B" fontFamily="sans-serif">14 Jul 2025</text>
      <text x="13" y="40" fontSize="3" fill="#64748B" fontFamily="sans-serif">Gate B12</text>
      <rect x="13" y="42" width="24" height="4" rx="1" fill="#F1F5F9" />
      <text x="14" y="45" fontSize="3" fill="#64748B" fontFamily="sans-serif">AI-142 · Economy</text>
      {/* QR code area */}
      <rect x="46" y="20" width="10" height="10" rx="1" fill="#1E293B" opacity="0.1" />
      <rect x="47" y="21" width="2" height="2" fill="#1E293B" opacity="0.7" />
      <rect x="50" y="21" width="2" height="2" fill="#1E293B" opacity="0.7" />
      <rect x="53" y="21" width="2" height="2" fill="#1E293B" opacity="0.7" />
      <rect x="47" y="24" width="2" height="2" fill="#1E293B" opacity="0.7" />
      <rect x="53" y="24" width="2" height="2" fill="#1E293B" opacity="0.7" />
      <rect x="47" y="27" width="2" height="2" fill="#1E293B" opacity="0.7" />
      <rect x="50" y="27" width="2" height="2" fill="#1E293B" opacity="0.7" />
      <rect x="53" y="27" width="2" height="2" fill="#1E293B" opacity="0.7" />
      {/* Barcode */}
      <rect x="46" y="34" width="1" height="10" fill="#1E293B" opacity="0.6" />
      <rect x="48" y="34" width="0.8" height="10" fill="#1E293B" opacity="0.6" />
      <rect x="50" y="34" width="1.2" height="10" fill="#1E293B" opacity="0.6" />
      <rect x="52" y="34" width="0.6" height="10" fill="#1E293B" opacity="0.6" />
      <rect x="54" y="34" width="1" height="10" fill="#1E293B" opacity="0.6" />
    </svg>
  );
}

export function HotelBookingIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="hb-building" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="hb-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      {/* Building */}
      <rect x="14" y="18" width="36" height="40" rx="2" fill="url(#hb-building)" stroke="#CBD5E1" strokeWidth="1" />
      {/* Roof / header */}
      <rect x="14" y="18" width="36" height="8" rx="2" fill="url(#hb-accent)" />
      <text x="32" y="24" textAnchor="middle" fontSize="4.5" fill="white" fontWeight="bold" fontFamily="sans-serif">HOTEL</text>
      {/* Windows */}
      <rect x="18" y="30" width="6" height="5" rx="1" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.5" />
      <rect x="29" y="30" width="6" height="5" rx="1" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="0.5" />
      <rect x="40" y="30" width="6" height="5" rx="1" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.5" />
      <rect x="18" y="39" width="6" height="5" rx="1" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="0.5" />
      <rect x="29" y="39" width="6" height="5" rx="1" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.5" />
      <rect x="40" y="39" width="6" height="5" rx="1" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="0.5" />
      {/* Door */}
      <rect x="28" y="49" width="8" height="9" rx="1" fill="#7C3AED" />
      <circle cx="34" cy="54" r="0.8" fill="#FDE68A" />
      {/* Stars */}
      <circle cx="26" cy="12" r="1.5" fill="#FBBF24" />
      <circle cx="30" cy="12" r="1.5" fill="#FBBF24" />
      <circle cx="34" cy="12" r="1.5" fill="#FBBF24" />
      <circle cx="38" cy="12" r="1.5" fill="#FBBF24" />
    </svg>
  );
}

export function TravelInsuranceIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="ti-shield" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="ti-shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Shield */}
      <path
        d="M32 6L12 14v14c0 14.4 9.6 27.2 20 30 10.4-2.8 20-15.6 20-30V14L32 6z"
        fill="url(#ti-shield)"
      />
      <path
        d="M32 6L12 14v14c0 14.4 9.6 27.2 20 30 10.4-2.8 20-15.6 20-30V14L32 6z"
        fill="url(#ti-shine)"
      />
      <path
        d="M32 6L12 14v14c0 14.4 9.6 27.2 20 30 10.4-2.8 20-15.6 20-30V14L32 6z"
        stroke="#047857" strokeWidth="1.5" fill="none"
      />
      {/* Medical cross */}
      <rect x="28" y="22" width="8" height="20" rx="2" fill="white" />
      <rect x="22" y="28" width="20" height="8" rx="2" fill="white" />
      {/* Heart */}
      <path d="M32 44l-1-1c-3-3-5-5-5-7.5a3 3 0 013-3c1.2 0 2.2.7 3 1.6.8-.9 1.8-1.6 3-1.6a3 3 0 013 3c0 2.5-2 4.5-5 7.5l-1 1z" fill="#EF4444" opacity="0.6" />
    </svg>
  );
}

export function ItineraryIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="it-paper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
      </defs>
      <rect x="10" y="6" width="44" height="52" rx="3" fill="url(#it-paper)" stroke="#CBD5E1" strokeWidth="1" />
      {/* Header */}
      <rect x="15" y="10" width="20" height="3" rx="1.5" fill="#1E293B" />
      <rect x="15" y="15" width="12" height="1.5" rx="0.75" fill="#94A3B8" />
      {/* Timeline */}
      <circle cx="20" cy="24" r="3" fill="#3B82F6" />
      <text x="20" y="25.5" textAnchor="middle" fontSize="3" fill="white" fontWeight="bold">1</text>
      <path d="M20 27v4" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="2 1.5" />
      <circle cx="20" cy="35" r="3" fill="#8B5CF6" />
      <text x="20" y="36.5" textAnchor="middle" fontSize="3" fill="white" fontWeight="bold">2</text>
      <path d="M20 38v4" stroke="#C4B5FD" strokeWidth="1.5" strokeDasharray="2 1.5" />
      <circle cx="20" cy="46" r="3" fill="#F59E0B" />
      <text x="20" y="47.5" textAnchor="middle" fontSize="3" fill="white" fontWeight="bold">3</text>
      {/* Content lines */}
      <rect x="27" y="22" width="20" height="2" rx="1" fill="#334155" />
      <rect x="27" y="26" width="14" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="27" y="33" width="18" height="2" rx="1" fill="#334155" />
      <rect x="27" y="37" width="12" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="27" y="44" width="16" height="2" rx="1" fill="#334155" />
      <rect x="27" y="48" width="14" height="1.5" rx="0.75" fill="#CBD5E1" />
    </svg>
  );
}

export function SalarySlipIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="ss-paper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="ss-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <rect x="10" y="6" width="44" height="52" rx="3" fill="url(#ss-paper)" stroke="#CBD5E1" strokeWidth="1" />
      {/* Header */}
      <rect x="10" y="6" width="44" height="10" rx="3" fill="url(#ss-accent)" />
      <text x="32" y="13" textAnchor="middle" fontSize="4.5" fill="white" fontWeight="bold" fontFamily="sans-serif">PAYSLIP</text>
      {/* Table */}
      <path d="M15 22h34" stroke="#E2E8F0" strokeWidth="0.8" />
      <text x="16" y="20" fontSize="3" fill="#64748B" fontFamily="sans-serif">Description</text>
      <text x="49" y="20" textAnchor="end" fontSize="3" fill="#64748B" fontFamily="sans-serif">Amount</text>
      <text x="16" y="27" fontSize="3.5" fill="#334155" fontFamily="sans-serif">Basic Salary</text>
      <text x="49" y="27" textAnchor="end" fontSize="3.5" fill="#059669" fontFamily="sans-serif">+50,000</text>
      <path d="M15 30h34" stroke="#F1F5F9" strokeWidth="0.5" />
      <text x="16" y="35" fontSize="3.5" fill="#334155" fontFamily="sans-serif">HRA</text>
      <text x="49" y="35" textAnchor="end" fontSize="3.5" fill="#059669" fontFamily="sans-serif">+20,000</text>
      <path d="M15 38h34" stroke="#F1F5F9" strokeWidth="0.5" />
      <text x="16" y="43" fontSize="3.5" fill="#334155" fontFamily="sans-serif">Tax Deducted</text>
      <text x="49" y="43" textAnchor="end" fontSize="3.5" fill="#EF4444" fontFamily="sans-serif">-8,500</text>
      <path d="M15 46h34" stroke="#E2E8F0" strokeWidth="0.8" />
      {/* Net pay */}
      <rect x="15" y="48" width="34" height="7" rx="2" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.8" />
      <text x="16" y="53" fontSize="3.5" fill="#92400E" fontWeight="bold" fontFamily="sans-serif">Net Pay</text>
      <text x="49" y="53" textAnchor="end" fontSize="4" fill="#D97706" fontWeight="bold" fontFamily="sans-serif">₹61,500</text>
    </svg>
  );
}

export function EmploymentLetterIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="el-paper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="el-stamp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
      </defs>
      <rect x="10" y="6" width="44" height="52" rx="3" fill="url(#el-paper)" stroke="#CBD5E1" strokeWidth="1" />
      {/* Letterhead */}
      <rect x="15" y="10" width="6" height="6" rx="1.5" fill="#1E40AF" />
      <text x="18" y="14.5" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">C</text>
      <rect x="24" y="11" width="16" height="2" rx="1" fill="#1E293B" />
      <rect x="24" y="14.5" width="10" height="1.5" rx="0.75" fill="#94A3B8" />
      {/* Content lines */}
      <rect x="15" y="22" width="34" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="15" y="26" width="34" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="15" y="30" width="28" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="15" y="34" width="34" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="15" y="38" width="18" height="1.5" rx="0.75" fill="#CBD5E1" />
      {/* Signature */}
      <path d="M15 47 Q20 44 24 47 Q28 50 32 46" stroke="#1E293B" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Official stamp */}
      <circle cx="44" cy="46" r="7" stroke="url(#el-stamp)" strokeWidth="1.5" fill="none" />
      <circle cx="44" cy="46" r="5" stroke="url(#el-stamp)" strokeWidth="0.8" fill="none" />
      <text x="44" y="47.5" textAnchor="middle" fontSize="3.5" fill="#DC2626" fontWeight="bold">✓</text>
    </svg>
  );
}

export function ITRIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="itr-paper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="itr-bar1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="itr-bar2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="itr-bar3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect x="10" y="6" width="44" height="52" rx="3" fill="url(#itr-paper)" stroke="#CBD5E1" strokeWidth="1" />
      {/* Header */}
      <rect x="15" y="10" width="22" height="3" rx="1.5" fill="#1E293B" />
      <rect x="15" y="15" width="14" height="1.5" rx="0.75" fill="#94A3B8" />
      {/* Chart area */}
      <path d="M15 50h34" stroke="#E2E8F0" strokeWidth="0.8" />
      {/* Bars */}
      <rect x="19" y="36" width="6" height="14" rx="1" fill="url(#itr-bar1)" />
      <rect x="29" y="30" width="6" height="20" rx="1" fill="url(#itr-bar2)" />
      <rect x="39" y="24" width="6" height="26" rx="1" fill="url(#itr-bar3)" />
      {/* Labels */}
      <text x="22" y="54" textAnchor="middle" fontSize="3" fill="#64748B">FY22</text>
      <text x="32" y="54" textAnchor="middle" fontSize="3" fill="#64748B">FY23</text>
      <text x="42" y="54" textAnchor="middle" fontSize="3" fill="#64748B">FY24</text>
      {/* Trend arrow */}
      <path d="M20 34l12-8 12-4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M42 21l2 1-1 2" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function NOCIcon({ className = "", size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="noc-paper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="noc-badge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Document with fold */}
      <path d="M10 9a3 3 0 013-3h28l13 13v35a3 3 0 01-3 3H13a3 3 0 01-3-3V9z" fill="url(#noc-paper)" stroke="#CBD5E1" strokeWidth="1" />
      <path d="M41 6v10a3 3 0 003 3h10" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
      {/* Content lines */}
      <rect x="16" y="24" width="22" height="2" rx="1" fill="#334155" />
      <rect x="16" y="29" width="30" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="16" y="33" width="30" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="16" y="37" width="24" height="1.5" rx="0.75" fill="#CBD5E1" />
      {/* Approved badge */}
      <circle cx="38" cy="48" r="8" fill="url(#noc-badge)" />
      <path d="M34 48l2.5 2.5L41 45" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const DOC_ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  "Passport": PassportIcon,
  "Passport Photo": PassportPhotoIcon,
  "Bank Statement": BankStatementIcon,
  "Salary Slip": SalarySlipIcon,
  "ITR": ITRIcon,
  "Travel Insurance": TravelInsuranceIcon,
  "Flight Booking": FlightBookingIcon,
  "Hotel Booking": HotelBookingIcon,
  "Employment Letter": EmploymentLetterIcon,
  "Leave Approval": EmploymentLetterIcon,
  "Cover Letter": CoverLetterIcon,
  "Travel Itinerary": ItineraryIcon,
  "No Objection Certificate": NOCIcon,
};

export function getDocIcon(docType: string): React.ComponentType<IconProps> {
  return DOC_ICON_MAP[docType] || CoverLetterIcon;
}
