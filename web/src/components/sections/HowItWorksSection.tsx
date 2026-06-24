"use client";

import { motion } from "framer-motion";
import { Video, Sparkles, FileText, ArrowRight } from "lucide-react";
import StepCard from "@/components/ui/StepCard";

const STEPS = [
  {
    number: "01",
    Icon: Video,
    title: "Record the job site",
    description:
      "Point your camera at the job site and narrate the work needed. Take a quick walkthrough — it takes less than a minute.",
  },
  {
    number: "02",
    Icon: Sparkles,
    title: "We build your invoice",
    description:
      "Our AI reads your video, audio, or documents and automatically generates a fully itemized, professional invoice draft.",
  },
  {
    number: "03",
    Icon: FileText,
    title: "Send and get paid",
    description:
      "Review line items, apply your template and branding, then send a polished PDF via email, SMS, or WhatsApp — in one tap.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 px-4">
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
            How it works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            From job site to invoice
            <br />
            in 3 steps
          </h2>
          <p
            className="mt-5 text-lg max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.42)" }}
          >
            No more paperwork at 9 PM. Point, talk, and your invoice is ready
            before you leave the driveway.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {STEPS.map((step, i) => (
            <div key={step.number} className="relative">
              <StepCard {...step} delay={i * 0.15} />
              {/* Arrow between cards (desktop) */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:flex absolute top-1/2 -right-4 z-10 items-center justify-center"
                  style={{ transform: "translateY(-50%)" }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{
                      background: "#18181B",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <ArrowRight size={14} color="rgba(255,255,255,0.4)" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
