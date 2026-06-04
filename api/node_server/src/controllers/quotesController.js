const axios = require("axios");

const admin = require("firebase-admin");

/**
 * Derives a very dark shade of a hex color for use as a dark header background.
 * factor=0.18 keeps 18% of the original channel values, producing a near-black tint.
 */
function darkenHex(hex, factor = 0.18) {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return null;
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor);
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor);
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Fetches external images referenced in the HTML and replaces their src with
 * base64 data URIs so WeasyPrint doesn't need to make outbound network requests
 * (which fail for authenticated Firebase Storage URLs).
 */
async function inlineExternalImages(html) {
  const srcPattern = /(<img\b[^>]*?\ssrc=")([^"]+)(")/gi;
  const matches = [...html.matchAll(srcPattern)];

  const replacements = await Promise.all(
    matches.map(async ([full, before, url, after]) => {
      if (url.startsWith("data:")) return null;
      try {
        const resp = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
        const mime = resp.headers["content-type"]?.split(";")[0] || "image/png";
        const b64 = Buffer.from(resp.data).toString("base64");
        return [full, `${before}data:${mime};base64,${b64}${after}`];
      } catch (e) {
        console.warn(`Could not inline image ${url}:`, e.message);
        return null;
      }
    })
  );

  for (const pair of replacements) {
    if (pair) html = html.replace(pair[0], pair[1]);
  }
  return html;
}

const RUST_AI_URL = process.env.RUST_AI_URL || "http://localhost:3000/api/ai";

/**
 * Controller to generate a new invoice from multi-modal inputs.
 */
const generateQuote = async (req, res) => {
  const { media_urls, prompt, project_name } = req.body;

  if (
    (!media_urls || !Array.isArray(media_urls) || media_urls.length === 0) &&
    !prompt
  ) {
    return res
      .status(400)
      .json({ error: "Either media_urls array or a text prompt is required." });
  }

  try {
    // 1. Log the generation request (analytics, cost tracking, etc.)
    console.log(
      `User ${req.user.uid} requesting new quote generation for: ${project_name}`,
    );

    // 2. Forward request to Rust AI Microservice
    const rustPayload = {
      user_id: req.user.uid,
      invoice_id: req.body.invoice_id || null,
      media_urls: media_urls || [],
      prompt:
        prompt || "Analyze this job site video and create an itemized quote.",
      project_name: project_name || "New Project",
      currency: req.body.currency || "USD",
      price_list_url: req.body.price_list_url || null,
    };

    // Forwarding to Rust Engine
    const response = await axios.post(`${RUST_AI_URL}/process`, rustPayload, {
      timeout: 60000, // Allow up to 60s for Gemini generation & video processing
    });

    // 3. Return the Rust engine response to the client
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error calling Rust AI microservice:", error.message);
    const statusCode = error.response ? error.response.status : 500;
    const data = error.response
      ? error.response.data
      : { error: "Internal Server Error" };
    return res.status(statusCode).json(data);
  }
};

/**
 * Controller to apply natural language "Prompt-to-Edit" commands to an existing invoice.
 */
const editQuote = async (req, res) => {
  const { invoice_id, prompt } = req.body;

  if (!invoice_id || !prompt) {
    return res
      .status(400)
      .json({ error: "invoice_id and prompt are required." });
  }

  try {
    // Forwarding "Prompt-to-Edit" to Rust Engine
    const rustPayload = {
      user_id: req.user.uid,
      invoice_id,
      prompt,
    };

    const response = await axios.post(`${RUST_AI_URL}/edit`, rustPayload, {
      timeout: 30000, // Shorter timeout for edits compared to video processing
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in Prompt-to-Edit:", error.message);
    const statusCode = error.response ? error.response.status : 500;
    const data = error.response
      ? error.response.data
      : { error: "Internal Server Error" };
    return res.status(statusCode).json(data);
  }
};

/**
 * Controller to preview an invoice using a customizable template.
 * Expects custom template settings and invoice ID.
 */
const previewInvoice = async (req, res) => {
  const { id } = req.params;
  const customization = req.body;

  try {
    const db = admin.firestore();
    const docRef = db.collection("invoices").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Invoice not found." });
    }

    const invoiceData = doc.data();

    if (invoiceData.user_id !== req.user.uid) {
      return res.status(403).json({ error: "Unauthorized access to this invoice." });
    }

    const { templateName, renderData } = buildRenderData(invoiceData, customization);

    res.render(templateName, { ...renderData, locals: renderData });
  } catch (error) {
    console.error("Error previewing invoice:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const previewTemplate = async (req, res) => {
  try {
    const { name } = req.params;
    const { theme_color } = req.body || {};

    const validTemplates = ["premium", "elegant", "bold", "modern", "classic", "minimal"];
    const templateName = validTemplates.includes(name) ? name : "modern";

    const sampleLineItems = [
      { description: "Landscaping & Ground Clearing", quantity: 1, unit_price: 1200, discount: 0 },
      { description: "Concrete Pouring & Finishing", quantity: 3, unit_price: 450, discount: 0 },
      { description: "Electrical Wiring (per room)", quantity: 5, unit_price: 320, discount: 160 },
      { description: "Plumbing Installation", quantity: 2, unit_price: 680, discount: 0 },
    ];

    const subtotal = sampleLineItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price - (item.discount || 0),
      0,
    );
    const taxes = Math.round(subtotal * 0.1);
    const total = subtotal + taxes;

    const color = theme_color || "#4F46E5";

    const renderData = {
      project_name: "Home Renovation Project",
      date: "June 3, 2026",
      line_items: sampleLineItems,
      subtotal,
      taxes,
      total,
      company_name: "Acme Services Co.",
      company_address: "742 Evergreen Terrace, Springfield",
      company_phone: "+1 (555) 234-5678",
      company_email: "info@acmeservices.com",
      theme_color: color,
      theme_color_light: color + "1A",
      currency: "$",
      template: templateName,
    };

    res.render(templateName, {
      ...renderData,
      locals: renderData,
    });
  } catch (error) {
    console.error("Error previewing template:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Shared helper: maps frontend customization fields and resolves the template name.
 */
function buildRenderData(invoiceData, customization) {
  const getCurrencySymbol = (currencyCode) => {
    try {
      if (!currencyCode) return "$";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        currencyDisplay: "narrowSymbol",
      })
        .formatToParts(0)
        .find((x) => x.type === "currency").value;
    } catch (e) {
      return currencyCode || "$";
    }
  };

  const rawCurrency = customization.currency || invoiceData.currency || "USD";
  const themeColor = customization.themeColor || customization.theme_color;

  const mapped = {
    ...customization,
    currency: getCurrencySymbol(rawCurrency),
    company_name: customization.companyName || customization.company_name,
    company_address: customization.address || customization.company_address,
    company_phone: customization.phone || customization.company_phone,
    company_email: customization.email || customization.company_email,
    logo_url: customization.companyLogo || customization.company_logo || customization.logo_url,
    signature: customization.signatureUrl || customization.signature_url || customization.signature,
    show_signature: !!(customization.signatureUrl || customization.signature_url || customization.signature),
    theme_color: themeColor,
    theme_color_light: themeColor ? themeColor + "1A" : undefined,
    // Dark header shade for templates like Premium that use --dark/--dark-2.
    // Derived from the theme color so the header tint matches the chosen palette.
    dark_color: darkenHex(themeColor, 0.18) || "#1a1a2e",
    dark_color_2: darkenHex(themeColor, 0.22) || "#16213e",
  };

  const validTemplates = ["premium", "elegant", "bold", "modern", "classic", "minimal"];
  const templateName = validTemplates.includes(mapped.template) ? mapped.template : "modern";
  const renderData = { ...invoiceData, ...mapped };

  return { templateName, renderData };
}

/**
 * Controller to export an invoice as a PDF via the Python WeasyPrint microservice.
 * Returns the raw PDF binary so the client can save and share it.
 */
const exportInvoice = async (req, res) => {
  const { id } = req.params;
  const customization = req.body;

  try {
    const db = admin.firestore();
    const docRef = db.collection("invoices").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ error: "Invoice not found." });
    }

    const invoiceData = snap.data();

    if (invoiceData.user_id !== req.user.uid) {
      return res.status(403).json({ error: "Unauthorized access to this invoice." });
    }

    const { templateName, renderData } = buildRenderData(invoiceData, customization);

    // Render the EJS template to an HTML string
    let html = await new Promise((resolve, reject) => {
      req.app.render(templateName, { ...renderData, locals: renderData }, (err, str) => {
        if (err) reject(err);
        else resolve(str);
      });
    });

    // Replace external image URLs with base64 data URIs so WeasyPrint never needs
    // to make outbound requests (Firebase Storage URLs require auth and would fail).
    html = await inlineExternalImages(html);

    // Send the HTML to the Python WeasyPrint microservice and get back a PDF binary
    const pdfEngineUrl = process.env.PDF_ENGINE_URL || "http://pdf_engine:5000";
    const pdfResponse = await axios.post(
      `${pdfEngineUrl}/generate`,
      { html },
      { responseType: "arraybuffer", timeout: 60000 },
    );

    const pdfBuffer = Buffer.from(pdfResponse.data);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${id}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error exporting invoice:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  generateQuote,
  editQuote,
  previewInvoice,
  previewTemplate,
  exportInvoice,
};
