import os
from flask import Flask, request, Response, jsonify
import weasyprint

app = Flask(__name__)

# CSS injected into every PDF — handles all the print-layout concerns that
# Puppeteer required hacks for. Cascades after the template's own @page rules.
PRINT_CSS = """
@page {
    size: A4;
    margin: 15mm 0 15mm 0;
    @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-family: sans-serif;
        font-size: 9px;
        color: #94a3b8;
        padding-bottom: 4mm;
    }
}
@page :first {
    margin-top: 0;
}
.page {
    max-width: 100% !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    margin: 0 !important;
}
thead th {
    padding-top: 18px !important;
}
/* Flex gap is unreliable in WeasyPrint; use margin-right on the avatar instead */
.company-avatar, .masthead-monogram, .company-monogram, .company-logo-wrap {
    margin-right: 16px !important;
    flex-shrink: 0 !important;
}
/* WeasyPrint writes flex children to the PDF text stream out of visual order.
   Convert flex wrappers that only do alignment to block + margin/text-align
   so the PDF text layer matches the reading order. */
.totals-section {
    display: block !important;
    text-align: right !important;
}
.totals-box, .totals-outer, .totals-block {
    display: inline-block !important;
    text-align: left !important;
    min-width: 280px;
}
.totals-section, .totals-box, .dark-totals, .totals-outer,
.totals-grand, .totals-block,
.signature-section, .terms-section, .footer, .footer-banner {
    break-inside: avoid !important;
}
"""


@app.post("/generate")
def generate_pdf():
    data = request.get_json(silent=True)
    if not data or not data.get("html"):
        return jsonify({"error": "html is required"}), 400

    html = data["html"]
    html = html.replace("</head>", f"<style>{PRINT_CSS}</style></head>", 1)

    try:
        pdf_bytes = weasyprint.HTML(string=html).write_pdf()
    except Exception as e:
        app.logger.error("WeasyPrint error: %s", e)
        return jsonify({"error": str(e)}), 500

    return Response(pdf_bytes, mimetype="application/pdf")


@app.get("/health")
def health():
    return jsonify({"status": "healthy", "service": "pdf_engine"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
