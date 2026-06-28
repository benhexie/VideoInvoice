# VideoInvoice Store Screenshot Design Guide

This guide defines what to design and how to export screenshots for Apple App Store and Google Play. It maps to six core screens and aligns with VideoInvoice's in-app look and feel.

References

- iOS screenshots (source captures)
  - 1_Hero.png
  - 2_Capture.png
  - 3_Invoices.png
  - 4_Detail.png
  - 5_Preview.png
  - 6_Settings.png

Note

- The "Feature Graphic.png" is not part of this screenshot brief.

## Objectives

- Communicate value instantly with concise, contractor-focused headlines.
- Maintain UI authenticity (true UI, minimal staging).
- Keep brand tone confident, direct, and professional.
- Ensure platform compliance and high readability on small thumbnails.

## Visual Style

- Color palette
  - Primary indigo from app UI: #4F46E5 and #6366F1
  - Light indigo: #818CF8
  - Dark backgrounds: #09090B, #18181B, #27272A
  - Light backgrounds: #FAFAFA, #FFFFFF, #F4F4F5
  - Accents used sparingly: #10B981 (paid/success), #F59E0B (warning), #EF4444 (unpaid)
- Typography
  - Use system type for platform consistency: iOS (SF Pro), Android (Roboto).
  - Heading weight 700/600; subhead 500/400.
- Layout
  - Keep overlays to ≤30% of vertical space.
  - 16px base spacing scale; align text blocks to a simple top/left grid.
- Backgrounds and frames
  - Do not round corners or add drop shadows to the device screenshot itself.
  - Optional: thin device frame for Google Play; for Apple, plain screenshots are recommended.
  - Dark-mode screenshots preferred — they photograph better at thumbnail scale and reinforce the app's premium feel.
- Accessibility
  - Minimum headline size at 6.7‑inch canvas: 60–72 px; subhead 36–44 px.
  - Text over imagery requires ≥4.5:1 contrast; add a subtle gradient if needed.

## Copy and Composition (per screen)

Keep headlines to 2 lines, punchy, and benefits‑first. Suggested lines are below; adjust phrasing for fit while preserving meaning.

1. Hero (1_Hero.png)
   - Headline: Point. Talk. Get Paid.
   - Subhead: The AI estimator built for contractors
   - Key features to highlight (use minimal icons or checkmarks):
     - Record a video — get a full itemized quote
     - Edit with natural language ("bump labor by 15%")
     - Export a professional PDF in one tap
   - Visual cue: A striking split showing a camera viewfinder on one side and a polished invoice PDF on the other, connected by a spark / AI flash icon, to instantly convey the capture → invoice transformation.

2. Capture (2_Capture.png)
   - Headline: Your job site is your estimate
   - Subhead: Video, voice, text, or document — your call
   - Visual cue: Show the camera live viewfinder with the record button active. Keep the input-mode toggle (Video / Text / Document) visible at the bottom to communicate multi-modal flexibility.

3. Invoices (3_Invoices.png)
   - Headline: Every quote, tracked and ready
   - Subhead: Filter by payment status in one tap
   - Visual cue: Display the invoice list with the filter chips (All / Unpaid / Partial / Paid) visible. Highlight a mix of payment-status badges — green "Paid", amber "Partial", red "Unpaid" — to show the built-in payment tracking.

4. Detail (4_Detail.png)
   - Headline: Edit with AI or your fingertips
   - Subhead: Adjust line items by tap or plain English
   - Visual cue: Show the invoice detail view with a few line items visible and the prompt-to-edit chat bar open at the bottom with an example command such as "Add $150 disposal fee". If possible, show one line item mid-edit (highlighted row) to reinforce dual-mode editing.

5. Preview (5_Preview.png)
   - Headline: A PDF your clients will respect
   - Subhead: Six polished templates, your branding
   - Visual cue: Center the full-screen invoice PDF preview (WebView). Keep the contractor logo, business name, and a clear line-item table visible. If multiple template thumbnails are shown in a picker overlay, keep them visible to communicate variety.

6. Settings (6_Settings.png)
   - Headline: Brand every invoice as your own
   - Subhead: Logo, signature, template, and currency — done
   - Visual cue: Show the business settings form with a company logo, signature pad preview, and the template picker grid. Keep the Crown/Pro badge visible if premium templates are displayed.

General overlay guidance

- Place headlines top‑left or top‑center; avoid notches and status bars.
- Use white text over dark UI regions; for light-mode screens use #09090B text with a soft white shadow or stroke if needed.
- Keep icons minimal; rely on the app UI to "sell" the features.
- Prefer the indigo accent (#4F46E5) for any decorative elements or underlines — it is the strongest brand signal.

## Platform Requirements

Apple App Store (phones, portrait)

- Provide 6.7‑inch and 5.5‑inch sets.
  - 6.7″: 1290 × 2796 px PNG
  - 5.5″: 1242 × 2208 px PNG
- Up to 10 screenshots; plan 6 core screens.
- No rounded corners; do not add extra status bars.
- Avoid claims like "best/only" or competitive comparisons.

Google Play (phones, portrait)

- Use 9:16 aspect; recommended 1080 × 1920 px PNG/JPG (no transparency needed).
- 4–8 screenshots; plan 6.
- Keep critical text in the central safe area; avoid edges where thumbnails crop.
- Device frames allowed. If used, keep consistent across all images.

Safe areas for overlays (portrait)

- Top: leave ~120 px (on 1290×2796) free of text to avoid notch/status.
- Bottom: leave ~160 px for gesture bar region.
- Sides: keep 72–96 px padding for large‑screen cropping.

## Dos and Don'ts

- Do
  - Use real UI and current color tokens listed above.
  - Keep headline copy consistent across iOS and Android, with minor line‑break adjustments.
  - Ensure readable type when downscaled; test at ~320 px wide thumbnail.
  - Use dark-mode UI where possible — the dark surface (#09090B) frames content cleanly.
- Don't
  - Don't overprint text on busy regions like the camera viewfinder; use a darkened gradient strip.
  - Don't add fake invoice totals implying guaranteed outcomes. Feature‑focused only.
  - Don't warp or tilt device screens.
  - Don't show the paywall/subscription sheet — feature capability, not pricing.

## Export Deliverables

Folder structure

```
store-screenshots/
  ios/
    67/
      01-hero-1290x2796.png
      02-capture-1290x2796.png
      03-invoices-1290x2796.png
      04-detail-1290x2796.png
      05-preview-1290x2796.png
      06-settings-1290x2796.png
    55/
      01-hero-1242x2208.png
      02-capture-1242x2208.png
      03-invoices-1242x2208.png
      04-detail-1242x2208.png
      05-preview-1242x2208.png
      06-settings-1242x2208.png
  play/
    phone-portrait/
      01-hero-1080x1920.png
      02-capture-1080x1920.png
      03-invoices-1080x1920.png
      04-detail-1080x1920.png
      05-preview-1080x1920.png
      06-settings-1080x1920.png
```

File format and metadata

- PNG preferred for crisp UI; RGB color; ≤ 20 MB per image.
- Consistent naming and ordering as above (01..06) to preserve narrative.
- Provide the working source (Figma file or layered PSD/Sketch) with text editable.

## Review Checklist

- Headlines are punchy, ≤2 lines, and readable at thumbnail size.
- Overlay placement avoids notch and bottom gesture regions.
- Colors and typography match app UI (indigo #4F46E5, dark backgrounds).
- Same composition rhythm across all six images.
- iOS: two device sizes covered; Google Play: 1080×1920 covered.
- No misleading claims or non‑UI graphics obscuring the product.
- Dark-mode variants used consistently; no mixed light/dark across the set.

## Optional Variants

- Localization: keep space for ~15–20% longer text for future locales.
- A/B lines (pick one per platform if needed):
  - Hero: "Point. Talk. Get Paid." / "Invoice from the job site, not your desk"
  - Capture: "Your job site is your estimate" / "Record a walkthrough, get a quote"
  - Invoices: "Every quote, tracked and ready" / "All your invoices, one clean list"
  - Detail: "Edit with AI or your fingertips" / "Fix any line item in seconds"
  - Preview: "A PDF your clients will respect" / "Professional invoices, six templates"
  - Settings: "Brand every invoice as your own" / "Your logo. Your rates. Your template."

If anything in the UI changes during the design phase, preserve the hierarchy (headline, subhead, clear UI) and keep the export specs intact.
