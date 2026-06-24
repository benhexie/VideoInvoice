import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://videoinvoice.app"),
  title: {
    default: "VideoInvoice — AI Invoice Generator for Contractors",
    template: "%s | VideoInvoice",
  },
  description:
    "Record a job site video and get a professional itemized invoice in seconds. The AI-powered invoicing app built for plumbers, electricians, landscapers, and general contractors.",
  keywords: [
    "invoice app for contractors",
    "AI invoice generator",
    "field contractor invoicing",
    "video to invoice",
    "plumber invoice app",
    "electrician invoice app",
    "landscaper invoice app",
    "construction invoice app",
    "mobile invoicing app",
    "contractor estimate app",
  ],
  openGraph: {
    type: "website",
    url: "https://videoinvoice.app",
    title: "VideoInvoice — AI Invoice Generator for Contractors",
    description:
      "Point your camera at a job site, describe the work, and get a professional invoice in seconds.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VideoInvoice — AI Invoice Generator for Contractors",
      },
    ],
    siteName: "VideoInvoice",
  },
  twitter: {
    card: "summary_large_image",
    title: "VideoInvoice — AI Invoice Generator for Contractors",
    description:
      "Point your camera at a job site, describe the work, and get a professional invoice in seconds.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: "https://videoinvoice.app",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "VideoInvoice",
  applicationCategory: "BusinessApplication",
  operatingSystem: "iOS",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "200",
  },
  description:
    "AI-powered invoicing app for field contractors. Record a video of the job site and get a professional itemized invoice in seconds.",
  url: "https://videoinvoice.app",
  author: {
    "@type": "Organization",
    name: "VideoInvoice",
    url: "https://videoinvoice.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
