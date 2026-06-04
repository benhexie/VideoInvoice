const express = require("express");
const { validateAuth } = require("../middlewares/auth");
const {
  generateQuote,
  editQuote,
  previewInvoice,
  previewTemplate,
  exportInvoice,
} = require("../controllers/quotesController");
const router = express.Router();

/**
 * @route POST /api/quotes/generate
 * @description Generates a new invoice from multi-modal inputs.
 */
router.post("/generate", validateAuth, generateQuote);

/**
 * @route POST /api/quotes/edit
 * @description Applies natural language "Prompt-to-Edit" commands to an existing invoice.
 */
router.post("/edit", validateAuth, editQuote);

/**
 * @route POST /api/quotes/template-preview/:name
 * @description Returns a rendered HTML preview of a template with sample invoice data.
 */
router.post("/template-preview/:name", previewTemplate);

/**
 * @route POST /api/quotes/:id/preview
 * @description Previews an invoice with customizable template data. Returns HTML.
 */
router.post("/:id/preview", validateAuth, previewInvoice);

/**
 * @route POST /api/quotes/:id/export
 * @description Exports an invoice as a PDF using headless Chrome. Returns application/pdf.
 */
router.post("/:id/export", validateAuth, exportInvoice);

module.exports = router;
