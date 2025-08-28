import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * InvestmentCard
 *
 * Props
 * - title: string
 * - amount: number
 * - className?: string
 * - currencySymbol?: string         // default "₹"
 * - delta?: string                  // e.g., "+8.2% this month"
 * - deltaPositive?: boolean         // true => green, false => red
 * - showTopStrip?: boolean          // gradient strip at top
 * - fxNote?: string                 // "1 USD = ₹83.25"
 * - lastUpdated?: string            // "2 hours ago"
 * - badgeGradient?: [string,string] // ["#3b82f6", "#2563eb"]
 * - icons?: React.ReactNode         // content inside badge
 * - onClick?: () => void
 */

export default function InvestmentCard({
  title = "INR Investments",
  amount = 0,
  className = "",
  currencySymbol = "₹",
  delta,
  deltaPositive = true,
  showTopStrip = true,
  lastUpdated,
  badgeGradient = ["#3b82f6", "#2563eb"],
  icons,
  onClick,
}) {
  const amountFmt = new Intl.NumberFormat("en-IN").format(amount);
  const [badgeFrom, badgeTo] = badgeGradient;
  
  const formatAmountWithSmallDecimal = (amount) => {
    const [integerPart, decimalPart] = amount.toString().split('.');
    return (
      <>
        {integerPart}
        {decimalPart && (
          <span className="text-[18px] sm:text-[20px] font-extrabold">
            .{decimalPart}
          </span>
        )}
      </>
    );
  };


  return (
    <div
      onClick={onClick}
      className={[
        "relative overflow-hidden rounded-2xl bg-[#1A2330] text-white",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        "p-5 sm:p-6 transition-all duration-200",
        "hover:translate-y-[-1px] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_-12px_rgba(0,0,0,0.45)]",
        className,
      ].join(" ")}
      role="region"
      aria-label={`${title} card`}
    >
      {showTopStrip && (
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-300 via-blue-400 to-violet-400" />
      )}

      {/* Sheen */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          background:
            "radial-gradient(120% 60% at 0% 0%, rgba(255,255,255,.25) 0%, rgba(255,255,255,0) 60%), linear-gradient(135deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,0) 45%)",
        }}
      />

      {/* Header: left stack (fills) + right badge (fixed) */}
      <div className="relative z-[1] flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-3">

            {/* Title (wrap if needed) */}
            <h3 className="text-[13px] text-[#A8B3CF] leading-tight break-words">
              {title}
            </h3>

          </div>
        </div>

        {/* Badge (fixed size, doesn’t shrink) */}
        <div className="relative shrink-0">
          <div
            className="absolute inset-0 -m-1 rounded-full opacity-40"
            style={{ filter: "blur(14px)", background: `${badgeFrom}66` }}
          />
          <div
            className="relative h-12 w-12 rounded-2xl border border-white/10 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${badgeFrom}, ${badgeTo})` }}
            aria-hidden="true"
          >
            {icons ?? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 4h12v2H6v2h10v2H10.8c1.3 1 2.2 2.6 2.2 4.4V19h-2v-4.6C11 12 9.7 10.7 8 10.6H6V8H4V6h2z"
                  fill="#fff"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Footer meta — separate lines, aligned */}
        <div className="relative z-[1] mt-5 mb-2 space-y-1.5 text-[12px] leading-5 text-[#A8B3CF]">

            {/* Amount row — full width */}
            <div className="w-full">
              <div className="text-[28px] sm:text-[30px] font-extrabold tracking-tight leading-none">
                {currencySymbol} {formatAmountWithSmallDecimal(amountFmt)}
              </div>
            </div>
            
            {/* Delta chip row — full width */}
            {typeof delta === "string" && delta.length > 0 && (
              <div className="w-full">
                <div
                  className={[
                    "inline-flex items-center rounded-xl mt-4 px-3 py-1.5 text-[13px] border",
                    deltaPositive
                      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                      : "text-rose-400 border-rose-500/30 bg-rose-500/10",
                  ].join(" ")}
                  aria-label={`Change ${delta}`}
                  title={delta}
                >
                  {deltaPositive ? (
                    <TrendingUp className="h-4 w-4 mr-1.5" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1.5" />
                  )}
                  {delta}
                </div>
              </div>
            )}
          
        </div>

      {/* Right-bottom timestamp with refresh icon */}
      {lastUpdated && (
        <div className="absolute right-2 bottom-1 mt-8 flex items-center justify-end">
          <div className="flex items-center gap-1 text-[12px] leading-5 text-[#A8B3CF]">
            <svg
              width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"
              className="opacity-80"
            >
              <path fill="currentColor"
                d="M12 6V3L8 7l4 4V8a4 4 0 1 1-4 4H6a6 6 0 1 0 6-6z" />
            </svg>
            <span>2 hours ago</span>
          </div>
        </div>
      )}
    </div>
  );
}
