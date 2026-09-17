const admin = require("firebase-admin");

// Mirrors the deletion order in app/app/privacy-security.tsx's handleDeleteAccount:
// Storage files, then Firestore invoices (+ their media), then the Auth user,
// then the remaining Firestore user docs.
async function deleteStorageFolder(path) {
  const bucket = admin.storage().bucket();
  const [files] = await bucket.getFiles({ prefix: `${path}/` });
  await Promise.all(files.map((file) => file.delete().catch(() => {})));
}

async function deleteAuthAndData(uid) {
  await deleteStorageFolder(`logos/${uid}`);
  await deleteStorageFolder(`signatures/${uid}`);
  await deleteStorageFolder(`quotes/${uid}`);
  await deleteStorageFolder(`price_lists/${uid}`);

  const db = admin.firestore();
  const invoicesSnap = await db.collection("invoices").where("user_id", "==", uid).get();
  await Promise.all(
    invoicesSnap.docs.map(async (doc) => {
      const mediaUrl = doc.data().media_url;
      if (mediaUrl) {
        try {
          const bucket = admin.storage().bucket();
          const path = decodeURIComponent(new URL(mediaUrl).pathname.split("/o/")[1]?.split("?")[0] || "");
          if (path) await bucket.file(path).delete();
        } catch {}
      }
      await doc.ref.delete();
    }),
  );

  await admin.auth().deleteUser(uid);

  try {
    await db.collection("users").doc(uid).collection("settings").doc("invoice").delete();
  } catch {}
  try {
    await db.collection("users").doc(uid).delete();
  } catch {}
}

// Verifies the email/password pair against Firebase Auth itself (the same
// credentials check the mobile app performs) via the Identity Toolkit REST
// API. The Admin SDK has no password-verification call of its own, and
// FIREBASE_WEB_API_KEY is a public project identifier, not a secret.
async function verifyPassword(email, password) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) throw new Error("FIREBASE_WEB_API_KEY is not configured on the server.");

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: false }),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, uid: null };
  }
  return { ok: true, uid: data.localId };
}

async function deleteAccount(req, res) {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const { ok, uid } = await verifyPassword(email.trim(), password);
    if (!ok) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    await deleteAuthAndData(uid);
    return res.json({ success: true });
  } catch (err) {
    console.error("Account deletion failed:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
}

module.exports = { deleteAccount };
