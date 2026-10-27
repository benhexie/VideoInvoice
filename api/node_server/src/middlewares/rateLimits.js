const rateLimit = require("express-rate-limit");
const { markInvoiceRejected } = require("../services/invoices");

const MINUTE = 60 * 1000;

/**
 * Builds a limiter keyed by the authenticated Firebase UID. Must run after
 * validateAuth so req.user is populated. Keying by UID (not IP) means users
 * behind the same carrier NAT don't share a bucket, and one account can't
 * dodge limits by switching networks.
 */
function perUserLimiter({ windowMs, limit, message, onLimit }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user.uid,
    handler: async (req, res, next, options) => {
      if (onLimit) await onLimit(req);
      res.status(options.statusCode).json({ error: message, code: "rate_limited" });
    },
  });
}

// Coarse per-IP ceiling across the whole API — stops floods before they reach
// token verification or Firestore.
const apiLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down.", code: "rate_limited" },
});

// Each generation is a Gemini call with video, so this is the expensive one.
const GENERATE_LIMIT_MESSAGE = "You're creating invoices too quickly. Please wait a few minutes and try again.";
const generateLimiter = perUserLimiter({
  windowMs: 60 * MINUTE,
  limit: 15,
  message: GENERATE_LIMIT_MESSAGE,
  // The app writes a "processing" stub before calling us; flip it to an error
  // so it doesn't spin forever in the Invoices tab.
  onLimit: (req) => markInvoiceRejected(req.user.uid, req.body.invoice_id, GENERATE_LIMIT_MESSAGE),
});

const editLimiter = perUserLimiter({
  windowMs: 10 * MINUTE,
  limit: 30,
  message: "Too many AI edits in a short time. Please wait a few minutes and try again.",
});

// PDF rendering is CPU-heavy on the WeasyPrint service.
const exportLimiter = perUserLimiter({
  windowMs: 10 * MINUTE,
  limit: 30,
  message: "Too many PDF exports in a short time. Please wait a few minutes and try again.",
});

const previewLimiter = perUserLimiter({
  windowMs: 10 * MINUTE,
  limit: 120,
  message: "Too many preview requests. Please wait a moment and try again.",
});

// Template previews are unauthenticated, so they're limited per IP.
const templatePreviewLimiter = rateLimit({
  windowMs: 10 * MINUTE,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many preview requests. Please wait a moment and try again.", code: "rate_limited" },
});

module.exports = {
  apiLimiter,
  generateLimiter,
  editLimiter,
  exportLimiter,
  previewLimiter,
  templatePreviewLimiter,
};
