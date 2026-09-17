// Grants (or revokes) Pro access to a user, entirely bypassing RevenueCat.
// Sets a `proOverride` custom claim on the Firebase Auth user, which
// SubscriptionContext.tsx reads to force `isPro = true` client-side. Custom
// claims can only be set via the Admin SDK, so a client can never grant this
// to itself.
//
// Usage:
//   node grant-pro.js <email> --unlimited
//   node grant-pro.js <email> --days 30
//   node grant-pro.js <email> --hours 6
//   node grant-pro.js <email> --revoke
require("dotenv").config();
const admin = require("firebase-admin");

if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY
) {
  console.error("Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

function usageError(msg) {
  console.error(msg);
  console.error("\nUsage:");
  console.error("  node grant-pro.js <email> --unlimited");
  console.error("  node grant-pro.js <email> --days <N>");
  console.error("  node grant-pro.js <email> --hours <N>");
  console.error("  node grant-pro.js <email> --revoke");
  process.exit(1);
}

async function main() {
  const [, , email, ...flags] = process.argv;
  if (!email) return usageError("Missing email.");

  const user = await admin.auth().getUserByEmail(email);
  const existingClaims = user.customClaims || {};

  if (flags.includes("--revoke")) {
    const { proOverride, ...rest } = existingClaims;
    await admin.auth().setCustomUserClaims(user.uid, rest);
    console.log(`Revoked pro override for ${email} (${user.uid}).`);
    return;
  }

  let expiresAt = null; // null = unlimited
  const daysIdx = flags.indexOf("--days");
  const hoursIdx = flags.indexOf("--hours");

  if (daysIdx !== -1) {
    const days = Number(flags[daysIdx + 1]);
    if (!Number.isFinite(days) || days <= 0) return usageError("Invalid --days value.");
    expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
  } else if (hoursIdx !== -1) {
    const hours = Number(flags[hoursIdx + 1]);
    if (!Number.isFinite(hours) || hours <= 0) return usageError("Invalid --hours value.");
    expiresAt = Date.now() + hours * 60 * 60 * 1000;
  } else if (!flags.includes("--unlimited")) {
    return usageError("Specify --unlimited, --days <N>, --hours <N>, or --revoke.");
  }

  await admin.auth().setCustomUserClaims(user.uid, {
    ...existingClaims,
    proOverride: {
      active: true,
      expiresAt, // null = unlimited
      grantedAt: Date.now(),
    },
  });

  console.log(
    `Granted pro to ${email} (${user.uid}) — expires: ${
      expiresAt ? new Date(expiresAt).toISOString() : "never (unlimited)"
    }`,
  );
  console.log(
    "Note: takes effect once the user's ID token refreshes — immediately if the app is " +
      "backgrounded/foregrounded or re-opened, otherwise within ~1 hour.",
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
