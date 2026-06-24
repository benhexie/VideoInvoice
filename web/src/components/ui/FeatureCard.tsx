"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureCard({
  Icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      className="rounded-2xl p-6 group cursor-default"
      style={{
        background: "rgba(24,24,27,0.5)",
        border: "1px solid rgba(255,255,255,0.06)",
        transition: "border-color 0.2s, background 0.2s",
      }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <div
        className="flex items-center justify-center rounded-xl mb-5"
        style={{
          width: 44,
          height: 44,
          background: "rgba(79,70,229,0.12)",
        }}
      >
        <Icon size={20} color="#818CF8" />
      </div>
      <h3 className="text-white text-base font-semibold mb-2">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>
        {description}
      </p>
    </motion.div>
  );
}
