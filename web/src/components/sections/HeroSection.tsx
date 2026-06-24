"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { siteConfig } from "@/lib/metadata";
import GridBackground from "@/components/ui/GridBackground";
import GradientText from "@/components/ui/GradientText";
import AppStoreBadge from "@/components/ui/AppStoreBadge";
import PlayStoreBadge from "@/components/ui/PlayStoreBadge";
import AnimatedAppMockup from "@/components/ui/AnimatedAppMockup";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-4 overflow-hidden">
      <GridBackground />

      {/* Indigo radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[700px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% -5%, rgba(79,70,229,0.35) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Left: copy */}
        <div className="flex-1 text-center lg:text-left">
          {/* Headline */}
          <motion.h1
            className="text-5xl sm:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05]"
            {...fadeUp(0.1)}
          >
            Point. Talk.
            <br />
            <GradientText>Get Paid.</GradientText>
          </motion.h1>

          <motion.p
            className="mt-4 text-xl font-medium"
            style={{ color: "rgba(255,255,255,0.55)" }}
            {...fadeUp(0.22)}
          >
            The AI Estimator for Contractors.
          </motion.p>

          <motion.p
            className="mt-6 text-base leading-relaxed max-w-lg"
            style={{ color: "rgba(255,255,255,0.38)" }}
            {...fadeUp(0.34)}
          >
            Record a job site walkthrough, describe the work, and
            VideoInvoice&apos;s AI generates a professional itemized invoice —
            ready to send as a PDF in seconds. No typing. No guesswork.
          </motion.p>

          {/* Store badges */}
          <motion.div
            className="mt-10 flex flex-wrap gap-3 justify-center lg:justify-start"
            {...fadeUp(0.46)}
          >
            <AppStoreBadge href={siteConfig.appStoreUrl} size="md" />
            <PlayStoreBadge href={siteConfig.playStoreUrl} size="md" />
          </motion.div>

          {/* Secondary CTA */}
          <motion.div
            className="mt-5 flex justify-center lg:justify-start"
            {...fadeUp(0.56)}
          >
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all"
              style={{
                border: "1px solid rgba(255,255,255,0.14)",
                color: "rgba(255,255,255,0.55)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "white";
                el.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "rgba(255,255,255,0.55)";
                el.style.background = "";
              }}
            >
              See how it works
              <ArrowDown size={14} />
            </a>
          </motion.div>

          {/* Trust signal */}
          <motion.p
            className="mt-7 text-sm"
            style={{ color: "rgba(255,255,255,0.22)" }}
            {...fadeUp(0.66)}
          >
            ✦ Free to download &nbsp;·&nbsp; No credit card required
          </motion.p>
        </div>

        {/* Right: animated phone mockup */}
        <motion.div
          className="flex-shrink-0 flex justify-center"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatedAppMockup />
        </motion.div>
      </div>
    </section>
  );
}
