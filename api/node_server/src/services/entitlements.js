const axios = require("axios");

// Must match ENTITLEMENT_ID in app/context/SubscriptionContext.tsx.
const ENTITLEMENT_ID = "VideoInvoice Pro";

// Pro results are cached longer than free ones so a user who just purchased
// is recognised within seconds rather than minutes.
const PRO_CACHE_MS = 5 * 60 * 1000;
const FREE_CACHE_MS = 30 * 1000;
const MAX_CACHE_ENTRIES = 10000;

const cache = new Map(); // uid -> { isPro, expiresAt }
let warnedMissingKey = false;

/** Mirrors isOverrideActive() in SubscriptionContext.tsx (claim set by grant-pro.js). */
function hasActiveOverride(decodedToken) {
  const override = decodedToken.proOverride;
  if (!override?.active) return false;
  return override.expiresAt == null || override.expiresAt > Date.now();
}

async function fetchRevenueCatPro(uid, secretKey) {
  const { data } = await axios.get(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(uid)}`,
    { headers: { Authorization: `Bearer ${secretKey}` }, timeout: 5000 },
  );
  const entitlement = data?.subscriber?.entitlements?.[ENTITLEMENT_ID];
  if (!entitlement) return false;
  // expires_date is null for lifetime/non-expiring grants.
  return entitlement.expires_date == null || new Date(entitlement.expires_date).getTime() > Date.now();
}

/**
 * Resolves whether the user has Pro, server-side. The app logs into RevenueCat
 * with the Firebase UID, so the UID is the RevenueCat app_user_id.
 *
 * Returns true / false, or null when it can't be determined (no secret key
 * configured, or RevenueCat unreachable). Callers should fail open on null so
 * paying users are never blocked by an outage — rate limits still bound abuse.
 */
async function isProUser(decodedToken) {
  if (hasActiveOverride(decodedToken)) return true;

  const uid = decodedToken.uid;
  const cached = cache.get(uid);
  if (cached && cached.expiresAt > Date.now()) return cached.isPro;

  const secretKey = process.env.REVENUECAT_SECRET_KEY;
  if (!secretKey) {
    if (!warnedMissingKey) {
      console.warn("REVENUECAT_SECRET_KEY is not set — Pro status can't be verified, quotas are failing open.");
      warnedMissingKey = true;
    }
    return null;
  }

  try {
    const isPro = await fetchRevenueCatPro(uid, secretKey);
    if (cache.size >= MAX_CACHE_ENTRIES) cache.clear();
    cache.set(uid, { isPro, expiresAt: Date.now() + (isPro ? PRO_CACHE_MS : FREE_CACHE_MS) });
    return isPro;
  } catch (e) {
    console.error(`RevenueCat lookup failed for ${uid}:`, e.message);
    return null;
  }
}

module.exports = { isProUser };
