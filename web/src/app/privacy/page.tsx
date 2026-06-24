import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for VideoInvoice — how we collect, use, and protect your data.",
};

const LAST_UPDATED = "June 24, 2026";

export default function PrivacyPolicy() {
  return (
    <div style={{ background: "#09090B", minHeight: "100vh", color: "white" }}>
      {/* Minimal nav */}
      <header className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Link href="/" className="inline-block">
          <Image src="/logos/white-1.svg" alt="VideoInvoice" width={140} height={20} className="h-5 w-auto" />
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4F46E5" }}>Legal</p>
        <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-sm mb-12" style={{ color: "rgba(255,255,255,0.35)" }}>Last updated: {LAST_UPDATED}</p>

        <div className="prose-legal">
          <Section title="1. Introduction">
            <p>VideoInvoice (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the VideoInvoice mobile application and website at videoinvoice.app (collectively, the &ldquo;Service&rdquo;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read it carefully. If you disagree with its terms, please discontinue use of the Service immediately.</p>
          </Section>

          <Section title="2. Information We Collect">
            <SubSection title="2.1 Information You Provide">
              <ul>
                <li><strong>Account information</strong> — name, email address, and password when you create an account.</li>
                <li><strong>Business information</strong> — company name, logo, address, and other details you add to your profile for use in invoices.</li>
                <li><strong>Payment information</strong> — subscription billing is handled entirely by Apple (App Store) or Google (Google Play). We do not store your payment card details.</li>
                <li><strong>Support communications</strong> — messages you send us via email or in-app support.</li>
              </ul>
            </SubSection>
            <SubSection title="2.2 Media You Submit for Processing">
              <p>To generate invoices, you may submit:</p>
              <ul>
                <li><strong>Video and audio recordings</strong> of job sites.</li>
                <li><strong>Photos</strong> of job sites or documents.</li>
                <li><strong>Documents</strong> such as quotes, receipts, or existing invoices.</li>
              </ul>
              <p>This media is transmitted to our AI processing infrastructure solely to generate your invoice. We do not use your recordings to train AI models. Submitted media is retained only as long as necessary to complete processing, after which it is deleted from our servers.</p>
            </SubSection>
            <SubSection title="2.3 Automatically Collected Information">
              <ul>
                <li><strong>Device information</strong> — device type, operating system, and app version.</li>
                <li><strong>Usage data</strong> — features used, screens viewed, and interactions within the app.</li>
                <li><strong>Crash reports</strong> — diagnostic data when the app encounters an error.</li>
                <li><strong>IP address</strong> — used for security and fraud prevention.</li>
              </ul>
            </SubSection>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve the Service.</li>
              <li>Process your job site media and generate invoice drafts.</li>
              <li>Manage your account and subscription.</li>
              <li>Send transactional emails (invoice confirmations, account notifications).</li>
              <li>Respond to your support requests.</li>
              <li>Detect and prevent fraud or abuse.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p>We do not sell your personal information to third parties. We do not use your invoices, business data, or job site recordings for advertising purposes.</p>
          </Section>

          <Section title="4. Sharing of Information">
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Service providers</strong> — third-party vendors who help us operate the Service (cloud hosting, analytics, customer support tools). These parties process data only on our behalf and under confidentiality obligations.</li>
              <li><strong>AI processing services</strong> — media you submit is processed by our AI infrastructure to generate invoice content. This processing is governed by appropriate data processing agreements.</li>
              <li><strong>Legal requirements</strong> — we may disclose information if required to do so by law or in response to valid requests by public authorities.</li>
              <li><strong>Business transfers</strong> — in connection with a merger, acquisition, or sale of assets, your information may be transferred as a business asset. We will notify you before your data is transferred and becomes subject to a different privacy policy.</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p>We retain your account data for as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data at any time (see Section 8). Job site media submitted for processing is deleted from our servers within 24 hours of invoice generation. Generated invoice data is retained in your account until you delete it.</p>
          </Section>

          <Section title="6. Security">
            <p>We implement industry-standard measures to protect your information, including encryption in transit (TLS) and at rest. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </Section>

          <Section title="7. Children's Privacy">
            <p>The Service is not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us and we will delete it promptly.</p>
          </Section>

          <Section title="8. Your Rights and Choices">
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and personal data.</li>
              <li>Object to or restrict certain processing activities.</li>
              <li>Data portability — receive your data in a structured format.</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href="mailto:privacy@videoinvoice.app">privacy@videoinvoice.app</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="9. Third-Party Links">
            <p>The Service may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties. We encourage you to review their privacy policies.</p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy in the app and updating the &ldquo;Last updated&rdquo; date above. Your continued use of the Service after changes are posted constitutes your acceptance of the revised policy.</p>
          </Section>

          <Section title="11. Contact Us">
            <p>If you have questions or concerns about this Privacy Policy, please contact us at:</p>
            <p><strong>VideoInvoice</strong><br />Email: <a href="mailto:privacy@videoinvoice.app">privacy@videoinvoice.app</a></p>
          </Section>
        </div>

        <div className="mt-16 pt-8 border-t flex gap-6 text-sm" style={{ borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-white transition-colors">← Back to home</Link>
        </div>
      </main>

      <style>{`
        .prose-legal p { color: rgba(255,255,255,0.6); line-height: 1.75; margin-bottom: 1rem; font-size: 0.9375rem; }
        .prose-legal ul { color: rgba(255,255,255,0.6); line-height: 1.75; margin-bottom: 1rem; padding-left: 1.5rem; list-style: disc; font-size: 0.9375rem; }
        .prose-legal li { margin-bottom: 0.4rem; }
        .prose-legal strong { color: rgba(255,255,255,0.85); font-weight: 600; }
        .prose-legal a { color: #818CF8; text-decoration: underline; text-underline-offset: 3px; }
        .prose-legal a:hover { color: white; }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-medium mb-2" style={{ color: "rgba(255,255,255,0.8)" }}>{title}</h3>
      {children}
    </div>
  );
}
