import { ShieldCheck } from "lucide-react";

export default function CyberSignature({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark";

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all border ${
        isDark
          ? "bg-slate-900/80 text-slate-300 border-slate-700 hover:border-[#E6A500]/50"
          : "bg-white/90 text-slate-700 border-slate-200 shadow-sm hover:border-[#082B67]/30"
      }`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-[#E6A500] shrink-0" />
      <span>
        Designed & Engineered by <strong className="font-bold text-[#E6A500]">Dharun</strong> — Technical Cybersecurity Expert & Lead Systems Developer
      </span>
    </div>
  );
}
