"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StepCardProps {
  number: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export default function StepCard({
  number,
  Icon,
  title,
  description,
  delay = 0,
}: StepCardProps) {
  return (
    <motion.div
      className="relative rounded-2xl p-8 flex flex-col"
      style={{
        background: "rgba(24,24,27,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Decorative number */}
      <span
        className="absolute top-4 right-6 font-bold select-none pointer-events-none"
        style={{ fontSize: 72, color: "rgba(255,255,255,0.03)", lineHeight: 1 }}
      >
        {number}
      </span>

      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-xl mb-5"
        style={{
          width: 52,
          height: 52,
          background: "rgba(79,70,229,0.15)",
        }}
      >
        <Icon size={24} color="#818CF8" />
      </div>

      {/* Number badge */}
      <span
        className="text-xs font-semibold tracking-widest uppercase mb-2"
        style={{ color: "#4F46E5" }}
      >
        Step {number}
      </span>

      <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
        {description}
      </p>
    </motion.div>
  );
}
