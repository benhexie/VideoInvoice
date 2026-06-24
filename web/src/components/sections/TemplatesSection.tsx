"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";

const SAMPLES = [
  { id: "modern", name: "Modern", color: "#4F46E5", isPro: false },
  { id: "elegant", name: "Elegant", color: "#D4AF37", isPro: true },
  { id: "noir", name: "Noir", color: "#00C2CB", isPro: true },
];

export default function TemplatesSection() {
  return (
    <section id="templates" className="py-28 px-4 overflow-hidden">
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
            Templates
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Professional invoices,
            <br />
            your style
          </h2>
          <p
            className="mt-5 text-lg max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.42)" }}
          >
            Choose from 9 templates — 3 free, 6 with Pro. Every one is
            fully customizable with your logo, brand color, and signature.
          </p>
        </motion.div>

        {/* Template sample cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {SAMPLES.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              className="flex flex-col items-center group"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Invoice preview card */}
              <div
                className="w-full relative rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)`,
                }}
              >
                <InvoicePreview id={tpl.id} color={tpl.color} />

                {/* Pro blur overlay */}
                {tpl.isPro && (
                  <a
                    href="#download"
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                  >
                    <div
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold"
                      style={{ background: "linear-gradient(135deg,#7C3AED,#D4AF37)" }}
                    >
                      <Crown size={14} />
                      Unlock with Pro
                    </div>
                  </a>
                )}
              </div>

              {/* Label */}
              <div className="flex items-center gap-3 mt-4">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: tpl.color }} />
                <span className="text-white font-medium text-sm">{tpl.name}</span>
                {tpl.isPro ? (
                  <span
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "linear-gradient(135deg,#7C3AED,#D4AF37)", color: "white" }}
                  >
                    <Crown size={9} /> Pro
                  </span>
                ) : (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}
                  >
                    Free
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA footnote */}
        <motion.p
          className="text-center mt-12 text-sm"
          style={{ color: "rgba(255,255,255,0.3)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          6 more templates available with Pro — Studio, Luxe, Bold, Premium, Classic &amp; Minimalist
        </motion.p>
      </div>
    </section>
  );
}

/* ─── Full-detail invoice renders ─── */

function InvoicePreview({ id, color }: { id: string; color: string }) {
  if (id === "modern") return <ModernInvoice color={color} />;
  if (id === "elegant") return <ElegantInvoice color={color} />;
  return <NoirInvoice color={color} />;
}

const ITEMS = [
  { desc: "Emergency pipe repair (4 hrs)", qty: "4", rate: "$120", total: "$480.00" },
  { desc: "PVC fittings & materials", qty: "—", rate: "—", total: "$220.00" },
  { desc: "Moisture barrier installation", qty: "1", rate: "$340", total: "$340.00" },
  { desc: "Service call fee", qty: "1", rate: "$90", total: "$90.00" },
];

function ModernInvoice({ color }: { color: string }) {
  return (
    <div style={{ background: "#ffffff", fontFamily: "system-ui, sans-serif", fontSize: 11 }}>
      {/* Header */}
      <div style={{ background: color, padding: "20px 24px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Smith Plumbing Co.</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 10 }}>Austin, TX 78701 · (512) 555-0142</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>Invoice</div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>#INV-1042</div>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid #F3F4F6" }}>
        <div>
          <div style={{ color: "#9CA3AF", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Bill To</div>
          <div style={{ color: "#111827", fontWeight: 600, fontSize: 11 }}>Riverside Properties LLC</div>
          <div style={{ color: "#6B7280", fontSize: 10 }}>123 Oak Street, Austin TX 78702</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#9CA3AF", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Date</div>
          <div style={{ color: "#374151", fontSize: 10 }}>Jun 24, 2026</div>
          <div style={{ color: "#9CA3AF", fontSize: 9, marginTop: 4 }}>Due: Jul 8, 2026</div>
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: "flex", padding: "8px 24px", background: "#F9FAFB", borderBottom: "1px solid #F3F4F6" }}>
        {["Description", "Qty", "Rate", "Amount"].map((h, i) => (
          <div key={h} style={{ flex: i === 0 ? 2 : 1, color: "#9CA3AF", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: i > 0 ? "right" : "left" }}>{h}</div>
        ))}
      </div>

      {/* Line items */}
      {ITEMS.map((item, i) => (
        <div key={i} style={{ display: "flex", padding: "9px 24px", borderBottom: "1px solid #F9FAFB", alignItems: "center" }}>
          <div style={{ flex: 2, color: "#374151", fontSize: 10 }}>{item.desc}</div>
          <div style={{ flex: 1, color: "#6B7280", fontSize: 10, textAlign: "right" }}>{item.qty}</div>
          <div style={{ flex: 1, color: "#6B7280", fontSize: 10, textAlign: "right" }}>{item.rate}</div>
          <div style={{ flex: 1, color: "#111827", fontWeight: 600, fontSize: 10, textAlign: "right" }}>{item.total}</div>
        </div>
      ))}

      {/* Totals */}
      <div style={{ padding: "12px 24px 16px", background: "#F9FAFB" }}>
        {[["Subtotal", "$1,130.00"], ["Tax (8.25%)", "$93.23"]].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "flex-end", gap: 32, marginBottom: 4 }}>
            <span style={{ color: "#9CA3AF", fontSize: 10 }}>{label}</span>
            <span style={{ color: "#374151", fontSize: 10, minWidth: 64, textAlign: "right" }}>{val}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 32, marginTop: 8, paddingTop: 8, borderTop: `2px solid ${color}` }}>
          <span style={{ color: "#111827", fontWeight: 700, fontSize: 12 }}>Total</span>
          <span style={{ color, fontWeight: 700, fontSize: 14, minWidth: 64, textAlign: "right" }}>$1,223.23</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 24px", borderTop: "1px solid #F3F4F6" }}>
        <div style={{ color: "#D1D5DB", fontSize: 9 }}>Thank you for your business. Payment due within 14 days.</div>
      </div>
    </div>
  );
}

function ElegantInvoice({ color }: { color: string }) {
  return (
    <div style={{ background: "#FFFDF5", fontFamily: "Georgia, serif", fontSize: 11 }}>
      {/* Gold top line */}
      <div style={{ height: 3, background: color }} />

      {/* Header */}
      <div style={{ padding: "20px 24px 12px", borderBottom: `1px solid ${color}44`, textAlign: "center" }}>
        <div style={{ color: "#1C1C1C", fontWeight: 700, fontSize: 16, letterSpacing: "0.05em", marginBottom: 2 }}>SMITH PLUMBING CO.</div>
        <div style={{ color: "#9C8A6A", fontSize: 9, letterSpacing: "0.1em" }}>AUSTIN, TEXAS · (512) 555-0142</div>
        <div style={{ height: 1, background: `${color}55`, margin: "12px 0 0" }} />
      </div>

      {/* Invoice meta */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", borderBottom: `1px solid ${color}33` }}>
        <div>
          <div style={{ color: "#9C8A6A", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Invoiced To</div>
          <div style={{ color: "#2C2C2C", fontSize: 11, fontWeight: 700 }}>Riverside Properties LLC</div>
          <div style={{ color: "#7A6E5E", fontSize: 10 }}>123 Oak Street, Austin TX</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#9C8A6A", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Invoice No.</div>
          <div style={{ color: "#2C2C2C", fontSize: 12, fontWeight: 700 }}>#INV-1042</div>
          <div style={{ color: "#9C8A6A", fontSize: 9, marginTop: 4 }}>Jun 24, 2026</div>
        </div>
      </div>

      {/* Line items header */}
      <div style={{ display: "flex", padding: "8px 24px 6px", borderBottom: `1px solid ${color}44` }}>
        {["Service", "Amount"].map((h, i) => (
          <div key={h} style={{ flex: i === 0 ? 3 : 1, color: "#9C8A6A", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: i === 0 ? "left" : "right" }}>{h}</div>
        ))}
      </div>

      {/* Items */}
      {ITEMS.map((item, i) => (
        <div key={i} style={{ display: "flex", padding: "8px 24px", borderBottom: `1px solid ${color}22`, alignItems: "center" }}>
          <div style={{ flex: 3, color: "#3D3228", fontSize: 10 }}>{item.desc}</div>
          <div style={{ flex: 1, color: "#5C4E3A", fontSize: 10, fontWeight: 600, textAlign: "right" }}>{item.total}</div>
        </div>
      ))}

      {/* Totals */}
      <div style={{ padding: "12px 24px 20px" }}>
        {[["Subtotal", "$1,130.00"], ["Tax (8.25%)", "$93.23"]].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, padding: "0 0 4px", borderBottom: `1px dotted ${color}44` }}>
            <span style={{ color: "#9C8A6A", fontSize: 10 }}>{label}</span>
            <span style={{ color: "#5C4E3A", fontSize: 10 }}>{val}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${color}` }}>
          <span style={{ color: "#1C1C1C", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em" }}>TOTAL DUE</span>
          <span style={{ color, fontWeight: 700, fontSize: 14 }}>$1,223.23</span>
        </div>
      </div>

      {/* Bottom line */}
      <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ padding: "8px 24px", textAlign: "center" }}>
        <div style={{ color: "#C4B49A", fontSize: 9, letterSpacing: "0.06em" }}>Thank you · Payment due within 14 days</div>
      </div>
    </div>
  );
}

function NoirInvoice({ color }: { color: string }) {
  return (
    <div style={{ background: "#0C0C0C", fontFamily: "system-ui, sans-serif", fontSize: 11 }}>
      {/* Top accent */}
      <div style={{ height: 2, background: color }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", marginBottom: 3 }}>SMITH PLUMBING CO.</div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9 }}>Austin, TX · (512) 555-0142</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em" }}>Invoice</div>
          <div style={{ color, fontWeight: 700, fontSize: 15 }}>#1042</div>
        </div>
      </div>

      {/* Bill-to / date */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <div style={{ color: color, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Billed To</div>
          <div style={{ color: "#F9F9F9", fontSize: 11, fontWeight: 600 }}>Riverside Properties LLC</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}>123 Oak Street, Austin TX</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: color, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Date</div>
          <div style={{ color: "#F9F9F9", fontSize: 10 }}>Jun 24, 2026</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, marginTop: 3 }}>Due: Jul 8, 2026</div>
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: "flex", padding: "8px 24px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {["Description", "Qty", "Amount"].map((h, i) => (
          <div key={h} style={{ flex: i === 0 ? 3 : 1, color: color, fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: i > 0 ? "right" : "left" }}>{h}</div>
        ))}
      </div>

      {/* Items */}
      {ITEMS.map((item, i) => (
        <div key={i} style={{ display: "flex", padding: "9px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
          <div style={{ flex: 3, color: "rgba(255,255,255,0.75)", fontSize: 10 }}>{item.desc}</div>
          <div style={{ flex: 1, color: "rgba(255,255,255,0.35)", fontSize: 10, textAlign: "right" }}>{item.qty}</div>
          <div style={{ flex: 1, color: "#FFFFFF", fontWeight: 600, fontSize: 10, textAlign: "right" }}>{item.total}</div>
        </div>
      ))}

      {/* Totals */}
      <div style={{ padding: "12px 24px 18px" }}>
        {[["Subtotal", "$1,130.00"], ["Tax (8.25%)", "$93.23"]].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "flex-end", gap: 32, marginBottom: 4 }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{label}</span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, minWidth: 64, textAlign: "right" }}>{val}</span>
          </div>
        ))}
        <div style={{ height: 1, background: color, opacity: 0.4, margin: "10px 0" }} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 32 }}>
          <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 11 }}>Total</span>
          <span style={{ color, fontWeight: 700, fontSize: 15, minWidth: 64, textAlign: "right" }}>$1,223.23</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 24px 14px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>Payment due within 14 days · Thank you for your business</div>
      </div>
    </div>
  );
}
