"use client";

import { motion } from "framer-motion";
import { Video, Mic, FileUp, MessageSquare, Palette, Download } from "lucide-react";
import FeatureCard from "@/components/ui/FeatureCard";

const FEATURES = [
  {
    Icon: Video,
    title: "Video-to-Invoice AI",
    description:
      "Point your camera at any job site. Our AI extracts materials, labor, and fees from your walkthrough — automatically.",
  },
  {
    Icon: Mic,
    title: "Voice Dictation",
    description:
      "Driving to the next job? Dictate the work hands-free and get a complete invoice waiting when you arrive.",
  },
  {
    Icon: FileUp,
    title: "Document Upload",
    description:
      "Upload a client's scope-of-work PDF, handwritten note, or spreadsheet — AI structures it into a clean invoice instantly.",
  },
  {
    Icon: MessageSquare,
    title: "Prompt-to-Edit",
    description:
      "Say \"bump all labor by 15%\" or \"add a $150 disposal fee\" and the AI updates your invoice in real time.",
  },
  {
    Icon: Palette,
    title: "9 Professional Templates",
    description:
      "Modern, Classic, Minimalist (free) plus Premium, Elegant, Bold, Studio, Noir, and Luxe. All fully customizable.",
  },
  {
    Icon: Download,
    title: "One-Tap PDF Export",
    description:
      "Generate a pixel-perfect branded PDF and send via email, SMS, or WhatsApp directly from the native share sheet.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
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
            Features
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Everything you need to
            <br />
            invoice faster
          </h2>
          <p
            className="mt-5 text-lg max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.42)" }}
          >
            Multi-modal AI input, custom templates, PDF export, and payment
            tracking — all in one app.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ Icon, title, description }, i) => (
            <FeatureCard
              key={title}
              Icon={Icon}
              title={title}
              description={description}
              delay={i * 0.07}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
