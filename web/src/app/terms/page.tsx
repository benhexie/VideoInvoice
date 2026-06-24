import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for VideoInvoice — the rules and conditions governing use of our app and website.",
};

const LAST_UPDATED = "June 24, 2026";

export default function TermsOfService() {
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
        <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
        <p className="text-sm mb-12" style={{ color: "rgba(255,255,255,0.35)" }}>Last updated: {LAST_UPDATED}</p>

        <div className="prose-legal">
          <Section title="1. Acceptance of Terms">
            <p>By downloading, installing, or using the VideoInvoice mobile application or website at videoinvoice.app (collectively, the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, do not use the Service. These Terms constitute a legally binding agreement between you and VideoInvoice (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;).</p>
          </Section>

          <Section title="2. Description of Service">
            <p>VideoInvoice is an AI-powered invoicing application designed for field contractors. The Service allows users to record job site walkthroughs, submit audio or documents, and receive automatically generated professional invoice drafts. The Service is available on iOS and Android devices.</p>
          </Section>

          <Section title="3. Accounts">
            <ul>
              <li>You must create an account to use the Service. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.</li>
              <li>You must be at least 16 years old to create an account.</li>
              <li>You agree to provide accurate, current, and complete information during registration and to update it as necessary.</li>
              <li>You must notify us immediately at <a href="mailto:support@videoinvoice.app">support@videoinvoice.app</a> if you suspect unauthorized access to your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </Section>

          <Section title="4. Free Plan and Pro Subscription">
            <SubSection title="4.1 Free Plan">
              <p>VideoInvoice offers a free tier that includes access to three invoice templates and a limited number of AI-generated invoices per month. Free plan features may change at our discretion with reasonable notice.</p>
            </SubSection>
            <SubSection title="4.2 Pro Subscription">
              <p>The Pro subscription unlocks all nine invoice templates, unlimited AI invoice generation, advanced customization, and additional features as described in the app. Pro subscriptions are offered as monthly or annual plans.</p>
            </SubSection>
            <SubSection title="4.3 Billing and Renewal">
              <p>Pro subscriptions are billed through the Apple App Store or Google Play Store using your associated payment method. Subscriptions automatically renew at the end of each billing period unless cancelled at least 24 hours before the renewal date. We do not process payments directly and do not store payment card information.</p>
            </SubSection>
            <SubSection title="4.4 Refunds">
              <p>All purchases and refund requests are handled by Apple or Google in accordance with their respective policies. We do not issue refunds directly.</p>
            </SubSection>
            <SubSection title="4.5 Price Changes">
              <p>We reserve the right to change subscription pricing with at least 30 days&rsquo; notice. Continued use of the Pro subscription after a price change constitutes acceptance of the new pricing.</p>
            </SubSection>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Create fraudulent, false, or misleading invoices.</li>
              <li>Violate any applicable local, state, national, or international law or regulation.</li>
              <li>Upload or process media containing illegal content or content that infringes third-party intellectual property rights.</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure.</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
              <li>Use automated scripts to access the Service in a manner that could overload or impair its operation.</li>
              <li>Resell, sublicense, or commercially exploit the Service without our written consent.</li>
            </ul>
          </Section>

          <Section title="6. Your Content">
            <p>You retain ownership of all content you submit to the Service, including job site recordings, documents, and invoice data (&ldquo;Your Content&rdquo;). By submitting Your Content, you grant us a limited, non-exclusive, royalty-free license to process, store, and use it solely to provide the Service to you.</p>
            <p>You represent and warrant that you have the right to submit Your Content and that it does not violate the rights of any third party. You are solely responsible for the accuracy and completeness of invoices generated using the Service.</p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>The Service, including its software, design, branding, and AI technology, is owned by VideoInvoice and protected by copyright, trademark, and other intellectual property laws. These Terms do not grant you any right, title, or interest in the Service beyond the limited license to use it as described herein.</p>
          </Section>

          <Section title="8. AI-Generated Content">
            <p>Invoice drafts generated by the Service are produced automatically based on the media and information you provide. You are responsible for reviewing all AI-generated content for accuracy before sending invoices to clients. We make no warranty that generated invoices will be error-free, complete, or suitable for any particular purpose. Always verify line items, quantities, and totals before sending.</p>
          </Section>

          <Section title="9. Disclaimers">
            <p>THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.</p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, VIDEOINVOICE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE, INCLUDING LOSS OF PROFITS, LOSS OF DATA, OR BUSINESS INTERRUPTION, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE MONTHS PRECEDING THE CLAIM.</p>
          </Section>

          <Section title="11. Indemnification">
            <p>You agree to indemnify and hold harmless VideoInvoice and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, Your Content, or your violation of these Terms.</p>
          </Section>

          <Section title="12. Termination">
            <p>You may stop using the Service and delete your account at any time. We may suspend or terminate your access to the Service at any time, with or without notice, for conduct that we reasonably believe violates these Terms or is harmful to other users, us, or third parties. Upon termination, your right to use the Service ceases immediately.</p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>We reserve the right to modify these Terms at any time. We will notify you of material changes by posting an in-app notice or sending an email to your registered address. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.</p>
          </Section>

          <Section title="14. Governing Law">
            <p>These Terms are governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved exclusively in the state or federal courts located in Delaware.</p>
          </Section>

          <Section title="15. Contact Us">
            <p>If you have questions about these Terms, please contact us at:</p>
            <p><strong>VideoInvoice</strong><br />Email: <a href="mailto:legal@videoinvoice.app">legal@videoinvoice.app</a></p>
          </Section>
        </div>

        <div className="mt-16 pt-8 border-t flex gap-6 text-sm" style={{ borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
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
