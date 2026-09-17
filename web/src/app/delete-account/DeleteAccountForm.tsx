"use client";

import { useState, FormEvent } from "react";

const API_BASE_URL = "https://videoinvoice.up.railway.app";

type Status = "idle" | "submitting" | "success" | "error";

export default function DeleteAccountForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirmed || status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/account/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMessage("Could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        className="rounded-lg p-6 text-sm"
        style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#86EFAC" }}
      >
        Your account and all associated data have been permanently deleted.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="block text-sm mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoCapitalize="none"
          autoCorrect="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md px-4 py-3 text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md px-4 py-3 text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
        />
        <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Only works for accounts that sign in with email and password. If you signed up with
          Google or Apple, please delete your account from within the app instead.
        </p>
      </div>

      <label className="flex items-start gap-3 mt-2 text-sm cursor-pointer" style={{ color: "rgba(255,255,255,0.7)" }}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1"
        />
        I understand this permanently deletes my account and cannot be undone.
      </label>

      {status === "error" && (
        <div
          className="rounded-md px-4 py-3 text-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#FCA5A5" }}
        >
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!confirmed || status === "submitting"}
        className="mt-2 rounded-md px-4 py-3 text-sm font-semibold transition-opacity"
        style={{
          background: "#EF4444",
          color: "white",
          opacity: !confirmed || status === "submitting" ? 0.5 : 1,
          cursor: !confirmed || status === "submitting" ? "not-allowed" : "pointer",
        }}
      >
        {status === "submitting" ? "Deleting…" : "Delete My Account"}
      </button>
    </form>
  );
}
