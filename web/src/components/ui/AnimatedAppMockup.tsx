"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Video, Check, Sparkles } from "lucide-react";
import Image from "next/image";

type Phase = "record" | "processing" | "invoice";

const CYCLE: { state: Phase; duration: number }[] = [
  { state: "record", duration: 3000 },
  { state: "processing", duration: 2200 },
  { state: "invoice", duration: 3500 },
];

export default function AnimatedAppMockup() {
  const [phase, setPhase] = useState<Phase>("record");

  useEffect(() => {
    let idx = 0;
    let timer: ReturnType<typeof setTimeout>;

    const run = () => {
      idx = (idx + 1) % CYCLE.length;
      setPhase(CYCLE[idx].state);
      timer = setTimeout(run, CYCLE[idx].duration);
    };

    timer = setTimeout(run, CYCLE[0].duration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative mx-auto animate-float" style={{ width: 280 }}>
      {/* Indigo glow behind phone */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          inset: "-20px",
          background: "radial-gradient(ellipse, rgba(79,70,229,0.35) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Phone frame */}
      <div
        className="relative overflow-hidden shadow-2xl"
        style={{
          width: 280,
          height: 560,
          borderRadius: 44,
          border: "8px solid rgba(255,255,255,0.1)",
          background: "#09090B",
        }}
      >
        {/* Dynamic Island */}
        <div
          className="absolute top-0 inset-x-0 z-20 flex items-center justify-center"
          style={{ height: 36 }}
        >
          <div
            className="bg-black rounded-full"
            style={{ width: 100, height: 26 }}
          />
        </div>

        {/* Screen content */}
        <AnimatePresence mode="wait">
          {phase === "record" && <RecordPhase key="record" />}
          {phase === "processing" && <ProcessingPhase key="processing" />}
          {phase === "invoice" && <InvoicePhase key="invoice" />}
        </AnimatePresence>
      </div>

      {/* Floating chip: Invoice Ready */}
      <motion.div
        className="absolute flex items-center gap-1.5 rounded-xl text-xs font-semibold px-3 py-2 animate-float-slow"
        style={{
          top: 64,
          right: -52,
          background: "rgba(16,185,129,0.15)",
          border: "1px solid rgba(16,185,129,0.3)",
          color: "#10B981",
          boxShadow: "0 4px 20px rgba(16,185,129,0.15)",
        }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <Check size={11} strokeWidth={3} />
        Invoice Ready
      </motion.div>

      {/* Floating chip: Total */}
      <motion.div
        className="absolute flex items-center gap-1.5 rounded-xl text-xs font-semibold px-3 py-2 animate-float"
        style={{
          bottom: 90,
          left: -56,
          animationDelay: "1.5s",
          background: "#18181B",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
      >
        Total: $2,450
      </motion.div>
    </div>
  );
}

function JobSiteScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Ken Burns: slow zoom-in + gentle pan */}
      <motion.div
        className="absolute"
        style={{ inset: "-8%" }}
        animate={{
          scale: [1, 1.08, 1],
          x: [-6, 8, -6],
          y: [0, -6, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/job-site.jpg"
          alt="Leaking pipe at a plumbing job site"
          fill
          sizes="280px"
          className="object-cover object-center"
          priority
        />
      </motion.div>

      {/* Dark tone-map: desaturate slightly and darken for camera feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(10,8,6,0.28)", mixBlendMode: "multiply" }}
      />

      {/* Lens vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.72) 100%)",
        }}
      />

      {/* Bottom gradient so camera controls stay readable */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "28%",
          background: "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

function RecordPhase() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{ background: "#0c0a08" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden" style={{ paddingTop: 36 }}>

        {/* ── Job site scene ── */}
        <JobSiteScene />

        {/* Camera grid lines */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.12 }}>
          <div className="absolute inset-y-0" style={{ left: "33.33%", borderLeft: "1px solid white" }} />
          <div className="absolute inset-y-0" style={{ left: "66.66%", borderLeft: "1px solid white" }} />
          <div className="absolute inset-x-0" style={{ top: "33.33%", borderTop: "1px solid white" }} />
          <div className="absolute inset-x-0" style={{ top: "66.66%", borderTop: "1px solid white" }} />
        </div>

        {/* Scan line */}
        <motion.div
          className="absolute inset-x-0 pointer-events-none"
          style={{
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(79,70,229,0.7) 30%, rgba(129,140,248,0.9) 50%, rgba(79,70,229,0.7) 70%, transparent)",
            boxShadow: "0 0 12px 2px rgba(79,70,229,0.4)",
          }}
          initial={{ top: "36px" }}
          animate={{ top: ["36px", "100%", "36px"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 0.4 }}
        />

        {/* AI detection box — around the pipe cluster */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            top: "30%",
            left: "18%",
            width: "46%",
            height: "32%",
            border: "1px solid rgba(79,70,229,0.85)",
            borderRadius: 4,
            boxShadow: "inset 0 0 12px rgba(79,70,229,0.1), 0 0 8px rgba(79,70,229,0.25)",
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Corner accents */}
          {[
            { top: -1, left: -1, borderTop: "2px solid #4F46E5", borderLeft: "2px solid #4F46E5" },
            { top: -1, right: -1, borderTop: "2px solid #4F46E5", borderRight: "2px solid #4F46E5" },
            { bottom: -1, left: -1, borderBottom: "2px solid #4F46E5", borderLeft: "2px solid #4F46E5" },
            { bottom: -1, right: -1, borderBottom: "2px solid #4F46E5", borderRight: "2px solid #4F46E5" },
          ].map((s, i) => (
            <div key={i} className="absolute w-2.5 h-2.5" style={s} />
          ))}

          {/* Detection label */}
          <div
            className="absolute -top-5 left-0 flex items-center gap-1 px-1.5 py-0.5 rounded-sm"
            style={{ background: "#4F46E5", whiteSpace: "nowrap" }}
          >
            <div className="w-1 h-1 rounded-full bg-white animate-glow-pulse" />
            <span className="text-white font-mono" style={{ fontSize: 7, letterSpacing: "0.04em" }}>
              PIPE SYSTEM · 94%
            </span>
          </div>
        </motion.div>

        {/* Second smaller detection box — water damage stain */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            top: "52%",
            right: "14%",
            width: "22%",
            height: "14%",
            border: "1px solid rgba(245,158,11,0.75)",
            borderRadius: 3,
          }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          <div
            className="absolute -top-5 left-0 px-1.5 py-0.5 rounded-sm"
            style={{ background: "#B45309", whiteSpace: "nowrap" }}
          >
            <span className="text-white font-mono" style={{ fontSize: 7 }}>MOISTURE</span>
          </div>
        </motion.div>

        {/* Corner brackets */}
        {[
          { top: 50, left: 20 },
          { top: 50, right: 20 },
          { bottom: 20, left: 20 },
          { bottom: 20, right: 20 },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-5 h-5"
            style={{
              ...pos,
              borderTop: i < 2 ? "1.5px solid rgba(255,255,255,0.5)" : undefined,
              borderBottom: i >= 2 ? "1.5px solid rgba(255,255,255,0.5)" : undefined,
              borderLeft: i % 2 === 0 ? "1.5px solid rgba(255,255,255,0.5)" : undefined,
              borderRight: i % 2 === 1 ? "1.5px solid rgba(255,255,255,0.5)" : undefined,
            }}
          />
        ))}

        {/* Recording badge */}
        <div className="absolute left-0 right-0 flex justify-center" style={{ top: 44 }}>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-glow-pulse" />
            <span className="text-white font-medium" style={{ fontSize: 10 }}>REC</span>
          </div>
        </div>

        {/* Exposure indicator top-right */}
        <div
          className="absolute right-4 flex flex-col items-center gap-1"
          style={{ top: 52, fontSize: 8, color: "rgba(255,255,255,0.45)", fontFamily: "monospace" }}
        >
          <span>1/60</span>
          <span>f2.4</span>
          <span>ISO 800</span>
        </div>
      </div>

      {/* Bottom controls */}
      <div
        className="flex items-center justify-between px-8 py-5"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      >
        <div className="w-8 h-8" />
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 56, height: 56, border: "4px solid white" }}
        >
          <div className="w-8 h-8 rounded-full bg-red-500 animate-glow-pulse" />
        </div>
        <Video size={18} style={{ color: "rgba(255,255,255,0.5)" }} />
      </div>
    </motion.div>
  );
}

function ProcessingPhase() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6"
      style={{ background: "#09090B", paddingTop: 36 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: 64,
          height: 64,
          background: "rgba(79,70,229,0.2)",
        }}
      >
        <Sparkles size={30} color="#4F46E5" className="animate-glow-pulse" />
      </div>
      <div className="text-center">
        <p className="text-white font-semibold text-base">Analysing footage</p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Generating your invoice...
        </p>
      </div>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 8, height: 8, background: "#4F46E5" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function InvoicePhase() {
  const items = [
    { name: "Labor (6 hrs)", amount: "$840" },
    { name: "Materials", amount: "$1,200" },
    { name: "Disposal fee", amount: "$280" },
    { name: "Travel", amount: "$130" },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{ background: "#F8F8F8", paddingTop: 36 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Invoice header */}
      <div className="px-5 py-4" style={{ background: "#4F46E5" }}>
        <p
          className="text-xs uppercase tracking-wider"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          Invoice #1042
        </p>
        <p className="text-white font-bold text-base mt-0.5">
          Acme Plumbing LLC
        </p>
      </div>

      {/* Line items */}
      <div className="flex-1 px-4 py-3 space-y-1 overflow-hidden">
        <p className="text-xs font-semibold mb-2" style={{ color: "#6B7280" }}>
          Line Items
        </p>
        {items.map((item, i) => (
          <motion.div
            key={item.name}
            className="flex justify-between items-center py-2"
            style={{ borderBottom: "1px solid #F3F4F6" }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
          >
            <span className="text-xs" style={{ color: "#6B7280" }}>
              {item.name}
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: "#111827" }}
            >
              {item.amount}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Total + CTA */}
      <div
        className="px-4 py-3"
        style={{ borderTop: "1px solid #E5E7EB", background: "white" }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs" style={{ color: "#6B7280" }}>
            Total
          </span>
          <span className="font-bold text-lg" style={{ color: "#4F46E5" }}>
            $2,450
          </span>
        </div>
        <div
          className="flex items-center justify-center py-2 rounded-lg"
          style={{ background: "#4F46E5" }}
        >
          <span className="text-white text-xs font-semibold">Send Invoice</span>
        </div>
      </div>
    </motion.div>
  );
}
