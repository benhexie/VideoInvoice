/* eslint-env node */
/* eslint-disable no-undef */
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const TEMPLATE_PATH = `file://${path.join(__dirname, "og-image.html")}`;
const OUTPUT_DIR = path.join(__dirname, "../public");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "og-image.png");

(async () => {
  console.log("Generating OG image...");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.goto(TEMPLATE_PATH, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((r) => setTimeout(r, 500));

  const element = await page.$("#og-image");
  if (element) {
    await element.screenshot({ path: OUTPUT_PATH, type: "png" });
    console.log(`Saved og-image.png to public/`);
  } else {
    console.error("Element #og-image not found");
    process.exit(1);
  }

  await browser.close();
})();
