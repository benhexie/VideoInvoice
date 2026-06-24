"use client";

import { motion } from "framer-motion";
import { Check, X, Crown } from "lucide-react";
import GradientText from "@/components/ui/GradientText";
import AppStoreBadge from "@/components/ui/AppStoreBadge";
import { siteConfig } from "@/lib/metadata";

const TABLE_ROWS = [
  { feature: "Invoice Templates", free: "3 standard", pro: "All 9 (incl. Premium, Elegant, Bold...)" },
  { feature: "Invoice Creation", free: "Up to 5 / month", pro: "Unlimited" },
  { feature: "PDF Export", free: false, pro: "Unlimited" },
  { feature: "Custom Branding", free: false, pro: "Logo, colors & signature" },
  { feature: "Price List Upload", free: false, pro: true },
  { feature: "Prompt-to-Edit AI", free: true, pro: true },
];

export default function ProSection() {
  return (
    <section
      id="pro"
      className="py-28 px-4"
      style={{ background: "rgba(24,24,27,0.3)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#4F46E5" }}
          >
            Pro Plan
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Level up to{" "}
            <GradientText
              style={{
                backgroundImage: "linear-gradient(135deg, #7C3AED, #D4AF37)",
              }}
            >
              Pro
            </GradientText>
          </h2>
          <p
            className="mt-5 text-lg max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.42)" }}
          >
            Everything you need to run your contracting business like a
            professional.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Comparison table */}
          <motion.div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div
              className="grid grid-cols-3 px-5 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{
                background: "#27272A",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              <span>Feature</span>
              <span className="text-center">Free</span>
              <span className="text-center" style={{ color: "#818CF8" }}>
                Pro
              </span>
            </div>

            {TABLE_ROWS.map(({ feature, free, pro }, i) => (
              <div
                key={feature}
                className="grid grid-cols-3 items-center px-5 py-4 text-sm"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  background: i % 2 === 0 ? "rgba(24,24,27,0.6)" : "#18181B",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.7)" }}>
                  {feature}
                </span>
                <span className="text-center">
                  {free === false ? (
                    <X size={14} color="rgba(255,255,255,0.2)" className="mx-auto" />
                  ) : free === true ? (
                    <Check size={14} color="#10B981" className="mx-auto" />
                  ) : (
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
                      {free}
                    </span>
                  )}
                </span>
                <span className="text-center">
                  {pro === true ? (
                    <Check size={14} color="#818CF8" className="mx-auto" />
                  ) : (
                    <span style={{ color: "#818CF8", fontSize: 12, fontWeight: 600 }}>
                      {pro}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Pro card */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Gradient border wrapper */}
            <div
              className="rounded-2xl p-px"
              style={{ background: "linear-gradient(135deg, #7C3AED, #D4AF37)" }}
            >
              <div
                className="rounded-2xl p-8 flex flex-col items-center text-center"
                style={{ background: "#0F0F12" }}
              >
                {/* Crown */}
                <div
                  className="flex items-center justify-center rounded-2xl mb-5"
                  style={{
                    width: 64,
                    height: 64,
                    background: "rgba(124,58,237,0.15)",
                  }}
                >
                  <Crown size={32} color="#D4AF37" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-1">
                  VideoInvoice Pro
                </h3>
                <p
                  className="text-sm mb-8"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Monthly or annual billing. Cancel anytime.
                </p>

                {/* Bullets */}
                <ul className="w-full space-y-3 mb-8 text-left">
                  {[
                    "Unlimited invoices — never hit a limit",
                    "All 9 templates including Studio, Noir & Luxe",
                    "Unlimited PDF exports with your branding",
                    "Custom logo, colors, and signature",
                    "Upload your price list — AI uses your exact rates",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <Check
                        size={16}
                        color="#10B981"
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span style={{ color: "rgba(255,255,255,0.65)" }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={siteConfig.appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-3 h-12 px-5 rounded-xl font-medium text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #D4AF37)" }}
                  aria-label="Download VideoInvoice on the App Store"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" aria-hidden="true">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="currentColor" />
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[10px] opacity-80">Download on the</div>
                    <div className="text-base font-semibold -mt-0.5">App Store</div>
                  </div>
                </a>

                <p
                  className="text-xs mt-4"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  Free to download · Upgrade to Pro inside the app
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
