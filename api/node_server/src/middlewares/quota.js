const admin = require("firebase-admin");
const { isProUser } = require("../services/entitlements");
const { firebaseReady, markInvoiceRejected } = require("../services/invoices");

const FREE_LIFETIME_GENERATIONS = 5;
// Fair-use cap that keeps "unlimited" Pro profitable at regional prices.
const PRO_MONTHLY_GENERATIONS = 100;

const FREE_LIMIT_MESSAGE = `Free accounts are limited to ${FREE_LIFETIME_GENERATIONS} invoices. Upgrade to Pro for unlimited.`;
const PRO_LIMIT_MESSAGE = `You've reached this month's fair-use limit of ${PRO_MONTHLY_GENERATIONS} AI invoices. It resets on the 1st.`;

/**
 * For users created before server-side tracking, start the lifetime counter at
 * their existing invoice count so the free allowance isn't handed out again.
 * The app has already written this request's stub, so it's excluded.
 */
async function initialLifetimeCount(db, uid, invoiceId) {
  const snap = await db.collection("invoices").where("user_id", "==", uid).count().get();
  return Math.max(0, snap.data().count - (invoiceId ? 1 : 0));
}

/**
 * Enforces AI generation quotas server-side. Counts generations in
 * `usage/{uid}`, which only the Admin SDK writes — unlike the app's old check
 * (counting existing invoices), deleting invoices doesn't give credits back.
 * Must run after validateAuth.
 */
const enforceGenerationQuota = async (req, res, next) => {
  if (!firebaseReady()) return next();

  const uid = req.user.uid;
  const invoiceId = req.body.invoice_id;
  const db = admin.firestore();
  const usageRef = db.collection("usage").doc(uid);
  const period = new Date().toISOString().slice(0, 7); // UTC month, e.g. "2026-10"

  try {
    // null = Pro status unknown; fail open and treat as Pro.
    const isPro = (await isProUser(req.user)) !== false;

    const existing = await usageRef.get();
    const seed = existing.exists ? 0 : await initialLifetimeCount(db, uid, invoiceId);

    const rejection = await db.runTransaction(async (tx) => {
      const snap = await tx.get(usageRef);
      const usage = snap.exists ? snap.data() : { lifetime_generations: seed };
      const lifetime = usage.lifetime_generations || 0;
      const monthly = usage.period === period ? usage.period_generations || 0 : 0;

      if (!isPro && lifetime >= FREE_LIFETIME_GENERATIONS) {
        return { status: 403, code: "free_limit_reached", error: FREE_LIMIT_MESSAGE };
      }
      if (isPro && monthly >= PRO_MONTHLY_GENERATIONS) {
        return { status: 429, code: "monthly_limit_reached", error: PRO_LIMIT_MESSAGE };
      }

      tx.set(
        usageRef,
        { lifetime_generations: lifetime + 1, period, period_generations: monthly + 1, updated_at: Date.now() },
        { merge: true },
      );
      return null;
    });

    if (rejection) {
      await markInvoiceRejected(uid, invoiceId, rejection.error);
      return res.status(rejection.status).json({ error: rejection.error, code: rejection.code });
    }

    // Lets the controller hand the credit back if the AI engine rejects the job.
    req.refundGeneration = () =>
      usageRef
        .update({
          lifetime_generations: admin.firestore.FieldValue.increment(-1),
          period_generations: admin.firestore.FieldValue.increment(-1),
        })
        .catch((e) => console.error(`Failed to refund generation for ${uid}:`, e.message));

    next();
  } catch (e) {
    // Don't block generation on a Firestore hiccup; rate limits still apply.
    console.error(`Quota check failed for ${uid}:`, e.message);
    next();
  }
};

module.exports = { enforceGenerationQuota };
