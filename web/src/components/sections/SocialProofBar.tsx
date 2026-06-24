"use client";

import { motion } from "framer-motion";
import { Star, Users, Zap } from "lucide-react";

const stats = [
  {
    Icon: Star,
    value: "4.9 / 5",
    label: "App Store rating",
    extra: (
      <span className="flex" aria-label="5 stars">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />
        ))}
      </span>
    ),
  },
  {
    Icon: Users,
    value: "10,000+",
    label: "Contractors trust VideoInvoice",
  },
  {
    Icon: Zap,
    value: "< 30 sec",
    label: "Average invoice generation time",
  },
];

export default function SocialProofBar() {
  return (
    <section
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(24,24,27,0.4)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
          {stats.map(({ Icon, value, label, extra }, i) => (
            <motion.div
              key={label}
              className="flex flex-col items-center text-center gap-1"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} color="#4F46E5" />
                {extra && extra}
              </div>
              <span className="text-2xl font-bold text-white">{value}</span>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
