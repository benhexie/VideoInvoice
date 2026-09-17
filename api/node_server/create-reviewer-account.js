// One-off script: creates a pre-verified demo account for App Store / Google Play
// reviewers, so they can sign in with email+password without going through
// Google/Apple OAuth. Run once with: node create-reviewer-account.js
require("dotenv").config();
const crypto = require("crypto");
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

const EMAIL = "reviewer@videoinvoice.app";
// UID of the reviewer account created previously under a placeholder email,
// so re-running this script updates it in place instead of creating a duplicate.
const KNOWN_UID = "7oMLItVpZpVlIcCUcatQfK6W4FI3";
const PASSWORD = crypto.randomBytes(9).toString("base64").replace(/[+/=]/g, "x") + "!1";

async function main() {
  let user;
  try {
    user = await admin.auth().getUser(KNOWN_UID);
    await admin.auth().updateUser(user.uid, {
      email: EMAIL,
      password: PASSWORD,
      emailVerified: true,
      displayName: "App Reviewer",
    });
    console.log(`Updated existing auth user ${user.uid}`);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      user = await admin.auth().createUser({
        email: EMAIL,
        password: PASSWORD,
        emailVerified: true,
        displayName: "App Reviewer",
      });
      console.log(`Created auth user ${user.uid}`);
    } else if (err.code === "auth/email-already-exists") {
      user = await admin.auth().getUserByEmail(EMAIL);
      await admin.auth().updateUser(user.uid, {
        password: PASSWORD,
        emailVerified: true,
      });
      console.log(`User already existed, reset password for ${user.uid}`);
    } else {
      throw err;
    }
  }

  await admin.firestore().collection("users").doc(user.uid).set(
    {
      name: "App Reviewer",
      hasCompletedOnboarding: true,
      hasSeenTutorial: true,
    },
    { merge: true },
  );

  console.log("\nReviewer account ready:");
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
