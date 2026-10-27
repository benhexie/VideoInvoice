const admin = require("firebase-admin");

const firebaseReady = () => admin.apps.length > 0 && !!admin.app().options.credential;

/**
 * Marks the app-created "processing" stub as failed with a user-facing reason.
 * Older app builds ignore the API response, so without this a rejected request
 * would leave the invoice spinning forever. No-op unless the stub exists,
 * belongs to this user, and is still processing.
 */
async function markInvoiceRejected(uid, invoiceId, message) {
  if (!invoiceId || typeof invoiceId !== "string" || !firebaseReady()) return;
  try {
    const ref = admin.firestore().collection("invoices").doc(invoiceId);
    const snap = await ref.get();
    if (!snap.exists) return;
    const data = snap.data();
    if (data.user_id !== uid || data.status !== "processing") return;
    await ref.update({
      status: "error",
      line_items: [{ id: "rejected", description: message, quantity: 1, unit_price: 0 }],
    });
  } catch (e) {
    console.error(`Failed to mark invoice ${invoiceId} as rejected:`, e.message);
  }
}

module.exports = { firebaseReady, markInvoiceRejected };
