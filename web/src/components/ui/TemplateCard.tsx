"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";

interface TemplateCardProps {
  id: string;
  name: string;
  color: string;
  isPro: boolean;
  delay?: number;
}

export default function TemplateCard({
  id,
  name,
  color,
  isPro,
  delay = 0,
}: TemplateCardProps) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden flex-shrink-0 group"
      style={{
        width: "100%",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "#18181B",
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Mini invoice preview */}
      <div
        className="relative overflow-hidden"
        style={{ height: 180, background: "#F9F9F9" }}
      >
        <TemplatePreview id={id} color={color} />

        {/* Pro overlay */}
        {isPro && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-semibold"
              style={{ background: "linear-gradient(135deg,#7C3AED,#D4AF37)" }}
            >
              <Crown size={12} />
              Unlock with Pro
            </div>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: "#27272A" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="rounded-full"
            style={{ width: 10, height: 10, background: color }}
          />
          <span className="text-white text-sm font-medium">{name}</span>
        </div>
        {isPro ? (
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
  );
}

function TemplatePreview({ id, color }: { id: string; color: string }) {
  if (id === "modern") {
    return (
      <div className="absolute inset-0 p-3">
        <div className="rounded-lg overflow-hidden h-full" style={{ border: "1px solid #E5E7EB" }}>
          <div className="px-3 py-2" style={{ background: color }}>
            <div className="h-2.5 rounded w-16 bg-white/50 mb-1" />
            <div className="h-1.5 rounded w-10 bg-white/30" />
          </div>
          <div className="p-3 space-y-1.5">
            {[90, 70, 80, 60].map((w, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-1.5 rounded bg-gray-200" style={{ width: `${w * 0.5}%` }} />
                <div className="h-1.5 rounded bg-gray-300" style={{ width: "18%" }} />
              </div>
            ))}
          </div>
          <div className="mx-3 mt-1 rounded px-2 py-1.5 flex justify-between" style={{ background: color }}>
            <div className="h-1.5 rounded w-8 bg-white/50" />
            <div className="h-1.5 rounded w-12 bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (id === "classic") {
    return (
      <div className="absolute inset-0 p-3">
        <div className="h-full flex flex-col" style={{ borderTop: `3px solid ${color}`, paddingTop: 6 }}>
          <div className="flex justify-between mb-2">
            <div>
              <div className="h-2 rounded w-16 bg-gray-800 mb-1" />
              <div className="h-1.5 rounded w-10 bg-gray-400" />
            </div>
            <div className="text-right">
              <div className="h-1.5 rounded w-12 bg-gray-300 mb-1 ml-auto" />
              <div className="h-1.5 rounded w-8 bg-gray-200 ml-auto" />
            </div>
          </div>
          <div className="flex-1 border rounded overflow-hidden" style={{ borderColor: "#E5E7EB" }}>
            <div className="grid grid-cols-2 gap-px" style={{ background: "#E5E7EB" }}>
              {[80, 60, 75, 65, 70, 55].map((w, i) => (
                <div key={i} className="bg-white px-1.5 py-1">
                  <div className="h-1.5 rounded bg-gray-200" style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end mt-1.5">
            <div className="h-1.5 rounded w-16" style={{ background: color, opacity: 0.7 }} />
          </div>
        </div>
      </div>
    );
  }

  if (id === "minimal") {
    return (
      <div className="absolute inset-0 p-5">
        <div className="h-2 rounded w-12 bg-gray-800 mb-3" />
        <div className="h-1 rounded w-20 bg-gray-300 mb-1" />
        <div className="h-1 rounded w-16 bg-gray-200 mb-4" />
        <div className="space-y-2">
          {[85, 70, 75, 60].map((w, i) => (
            <div key={i} className="flex justify-between items-center" style={{ borderBottom: "0.5px solid #E5E7EB", paddingBottom: 4 }}>
              <div className="h-1 rounded bg-gray-300" style={{ width: `${w * 0.45}%` }} />
              <div className="h-1 rounded" style={{ width: "15%", background: color, opacity: 0.7 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "premium") {
    return (
      <div className="absolute inset-0">
        <div className="px-4 py-3" style={{ background: "#1E1B4B" }}>
          <div className="h-2.5 rounded w-16 bg-white/60 mb-1" />
          <div className="h-1 rounded w-10 bg-white/25" />
        </div>
        <div className="h-px mx-0" style={{ background: color }} />
        <div className="p-3 space-y-1.5" style={{ background: "#F9F7FF" }}>
          {[85, 65, 75].map((w, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-1.5 rounded bg-gray-200" style={{ width: `${w * 0.5}%` }} />
              <div className="h-1.5 rounded bg-gray-300" style={{ width: "18%" }} />
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 inset-x-0 mx-3 mb-2 rounded py-1.5 flex justify-between px-2" style={{ background: "#1E1B4B" }}>
          <div className="h-1.5 rounded w-8 bg-white/40" />
          <div className="h-1.5 rounded w-14" style={{ background: color }} />
        </div>
      </div>
    );
  }

  if (id === "elegant") {
    return (
      <div className="absolute inset-0 p-3 flex flex-col items-center" style={{ background: "#FFFDF5" }}>
        <div className="w-full h-px mb-2" style={{ background: color }} />
        <div className="h-2 rounded w-14 bg-gray-700 mb-0.5" />
        <div className="h-1 rounded w-10 bg-gray-400 mb-2" />
        <div className="w-full h-px mb-3" style={{ background: color }} />
        <div className="w-full space-y-1.5">
          {[80, 65, 70].map((w, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-1 rounded bg-gray-200" style={{ width: `${w * 0.5}%` }} />
              <div className="h-1 rounded" style={{ width: "18%", background: color, opacity: 0.6 }} />
            </div>
          ))}
        </div>
        <div className="w-full h-px mt-auto" style={{ background: color, opacity: 0.4 }} />
      </div>
    );
  }

  if (id === "bold") {
    return (
      <div className="absolute inset-0">
        <div className="w-full py-4 flex items-center justify-center" style={{ background: color }}>
          <div className="h-3 rounded w-20 bg-white/70" />
          <div className="absolute top-2 right-3 font-bold text-3xl select-none" style={{ color: "rgba(255,255,255,0.15)" }}>
            INV
          </div>
        </div>
        <div className="p-3 space-y-1.5">
          {[80, 65, 70, 55].map((w, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-1.5 rounded bg-gray-200" style={{ width: `${w * 0.5}%` }} />
              <div className="h-1.5 rounded bg-gray-300" style={{ width: "18%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "studio") {
    return (
      <div className="absolute inset-0 flex">
        <div className="w-1/3 flex flex-col p-2" style={{ background: color }}>
          <div className="h-2 rounded w-8 bg-white/50 mb-1.5" />
          <div className="h-1 rounded w-6 bg-white/30 mb-3" />
          <div className="space-y-1.5 mt-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-1 rounded bg-white/25" style={{ width: `${60 + i * 10}%` }} />
            ))}
          </div>
        </div>
        <div className="flex-1 p-2.5">
          <div className="h-1.5 rounded w-12 bg-gray-700 mb-2" />
          <div className="space-y-1.5">
            {[75, 60, 70, 55].map((w, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-1 rounded bg-gray-200" style={{ width: `${w * 0.55}%` }} />
                <div className="h-1 rounded bg-gray-300" style={{ width: "20%" }} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <div className="h-1.5 rounded w-14" style={{ background: color, opacity: 0.8 }} />
          </div>
        </div>
      </div>
    );
  }

  if (id === "noir") {
    return (
      <div className="absolute inset-0 p-3" style={{ background: "#0F0F0F" }}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="h-2 rounded w-14 bg-white/60 mb-1" />
            <div className="h-1 rounded w-10 bg-white/25" />
          </div>
          <div className="h-4 rounded-sm w-px" style={{ background: color }} />
        </div>
        <div className="space-y-1.5">
          {[80, 65, 70, 55].map((w, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-1 rounded bg-white/15" style={{ width: `${w * 0.5}%` }} />
              <div className="h-1 rounded" style={{ width: "18%", background: color, opacity: 0.7 }} />
            </div>
          ))}
        </div>
        <div className="mt-3 h-px" style={{ background: color, opacity: 0.5 }} />
        <div className="mt-1.5 flex justify-between">
          <div className="h-1.5 rounded w-8 bg-white/30" />
          <div className="h-1.5 rounded w-12" style={{ background: color }} />
        </div>
      </div>
    );
  }

  // luxe
  return (
    <div className="absolute inset-0 p-3" style={{ background: "#FDF8EE" }}>
      <div className="flex justify-between items-center mb-3" style={{ borderBottom: `1px solid ${color}`, paddingBottom: 6 }}>
        <div>
          <div className="h-2 rounded w-14 bg-gray-700 mb-1" />
          <div className="h-1 rounded w-10 bg-gray-400" />
        </div>
        <div className="h-4 w-4 rounded-full" style={{ background: color, opacity: 0.6 }} />
      </div>
      <div className="space-y-1.5">
        {[80, 65, 70].map((w, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-1 rounded bg-yellow-900/20" style={{ width: `${w * 0.5}%` }} />
            <div className="h-1 rounded" style={{ width: "18%", background: color, opacity: 0.6 }} />
          </div>
        ))}
      </div>
      <div className="mt-3 py-1.5 px-2 rounded flex justify-between" style={{ background: color, opacity: 0.9 }}>
        <div className="h-1.5 rounded w-8 bg-white/50" />
        <div className="h-1.5 rounded w-12 bg-white" />
      </div>
    </div>
  );
}
