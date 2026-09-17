import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import DeleteAccountForm from "./DeleteAccountForm";

export const metadata: Metadata = {
  title: "Delete Account",
  description: "Permanently delete your VideoInvoice account and all associated data.",
};

export default function DeleteAccountPage() {
  return (
    <div style={{ background: "#09090B", minHeight: "100vh", color: "white" }}>
      <header className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Link href="/" className="inline-block">
          <Image src="/logos/white-1.svg" alt="VideoInvoice" width={140} height={20} className="h-5 w-auto" />
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#EF4444" }}>
          Account
        </p>
        <h1 className="text-4xl font-bold mb-3">Delete Account</h1>
        <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.75 }}>
          This permanently deletes your VideoInvoice account, including your invoices, uploaded
          media, logo, signature, and any saved settings. This cannot be undone.
        </p>

        <DeleteAccountForm />

        <p className="mt-10 text-sm" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.75 }}>
          You can also delete your account from within the app: open the VideoInvoice app and go
          to Settings → Privacy &amp; Security → Delete Account.
        </p>

        <div
          className="mt-10 pt-8 border-t flex gap-6 text-sm"
          style={{ borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}
        >
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/" className="hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
