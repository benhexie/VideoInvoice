"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/metadata";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "Pro", href: "#pro" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={
        scrolled
          ? {
              backdropFilter: "blur(16px)",
              background: "rgba(9,9,11,0.85)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }
          : {}
      }
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" aria-label="VideoInvoice home">
          <Image
            src="/logos/white-1.svg"
            alt="VideoInvoice"
            width={168}
            height={22}
            priority
            className="h-6 w-auto"
          />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.55)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "white")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,0.55)")
              }
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href={siteConfig.appStoreUrl}
          className="text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-all active:scale-95"
          style={{ background: "#4F46E5" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#4338CA")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#4F46E5")
          }
        >
          Download Free
        </a>
      </nav>
    </header>
  );
}
