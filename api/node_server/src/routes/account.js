const express = require("express");
const rateLimit = require("express-rate-limit");
const { deleteAccount } = require("../controllers/accountController");
const router = express.Router();

// This endpoint checks a password, so it's rate-limited per IP to blunt
// brute-force guessing against the web account-deletion page.
const deleteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});

/**
 * @route POST /api/account/delete
 * @description Verifies email/password against Firebase Auth, then permanently
 * deletes the user's Storage files, Firestore data, and Auth account. Used by
 * the web account-deletion page (App Store / Play Store account-deletion requirement).
 */
router.post("/delete", deleteLimiter, deleteAccount);

module.exports = router;
