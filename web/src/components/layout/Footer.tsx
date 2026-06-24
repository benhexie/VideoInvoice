import Image from "next/image";
import AppStoreBadge from "@/components/ui/AppStoreBadge";
import PlayStoreBadge from "@/components/ui/PlayStoreBadge";
import { siteConfig } from "@/lib/metadata";

const PRODUCT_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "Pro", href: "#pro" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  return (
    <footer
      className="pt-16 pb-8 px-4"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#09090B" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Image
              src="/logos/white-1.svg"
              alt="VideoInvoice"
              width={148}
              height={20}
              className="h-5 w-auto mb-4"
            />
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Invoices at the speed of thought. AI-powered invoicing built for
              field contractors everywhere.
            </p>

            {/* Social icons */}
            <div className="flex gap-4 mt-5">
              <a
                href="https://twitter.com/videoinvoice"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="VideoInvoice on X (Twitter)"
                className="footer-link"
              >
                <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/videoinvoice"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="VideoInvoice on Instagram"
                className="footer-link"
              >
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Product
            </p>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="footer-link text-sm">
                    {label}
                  </a>
                </li>
              ))}
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="footer-link text-sm">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Download */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Get the App
            </p>
            <div className="flex flex-col gap-3">
              <AppStoreBadge href={siteConfig.appStoreUrl} size="sm" />
              <PlayStoreBadge href={siteConfig.playStoreUrl} size="sm" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-8 text-xs"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.22)",
          }}
        >
          <span>© {new Date().getFullYear()} VideoInvoice. All rights reserved.</span>
          <span>Built for contractors, by contractors.</span>
        </div>
      </div>
    </footer>
  );
}
