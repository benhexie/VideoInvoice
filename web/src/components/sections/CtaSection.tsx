"use client";

import { motion } from "framer-motion";
import AppStoreBadge from "@/components/ui/AppStoreBadge";
import PlayStoreBadge from "@/components/ui/PlayStoreBadge";
import { siteConfig } from "@/lib/metadata";

export default function CtaSection() {
  return (
    <section
      id="download"
      className="relative py-36 px-4 overflow-hidden text-center"
      style={{ background: "#09090B" }}
    >
      {/* Large indigo glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 700,
          height: 700,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(ellipse, rgba(79,70,229,0.22) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Top grid overlay */}
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 opacity-50"
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        <motion.p
          className="text-xs font-semibold uppercase tracking-widest mb-5"
          style={{ color: "#4F46E5" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Ready to get paid faster?
        </motion.p>

        <motion.h2
          className="text-5xl sm:text-6xl font-bold text-white leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          Download VideoInvoice
          <br />
          <span style={{ color: "rgba(255,255,255,0.5)" }}>for free today.</span>
        </motion.h2>

        <motion.p
          className="mt-6 text-lg"
          style={{ color: "rgba(255,255,255,0.42)" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Join thousands of contractors who&apos;ve stopped doing paperwork at
          night. Point, talk, and get paid.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AppStoreBadge href={siteConfig.appStoreUrl} size="lg" />
          <PlayStoreBadge href={siteConfig.playStoreUrl} size="lg" />
        </motion.div>

        <motion.p
          className="mt-5 text-sm"
          style={{ color: "rgba(255,255,255,0.22)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45 }}
        >
          Free to download · No credit card required · iOS &amp; Android
        </motion.p>
      </div>
    </section>
  );
}
