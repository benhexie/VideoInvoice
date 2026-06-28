/* eslint-env node */
/* eslint-disable no-undef */
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const OUTPUT_DIR = path.join(__dirname, "../../assets/images/preview");
const TEMPLATE_PATH = `file://${path.join(__dirname, "template.html")}`;
const FEATURE_GRAPHIC_TEMPLATE_PATH = `file://${path.join(__dirname, "feature-graphic.html")}`;

const SCREENS = [
  { name: "1_Capture",  param: "capture"  },
  { name: "2_Invoices", param: "invoices" },
  { name: "3_Detail",   param: "detail"   },
  { name: "4_Preview",  param: "preview"  },
  { name: "5_Settings", param: "settings" },
];

(async () => {
  console.log("Starting preview generation...");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 1000,
    height: 2000,
    deviceScaleFactor: 3,
  });

  for (const screen of SCREENS) {
    console.log(`Generating ${screen.name}...`);
    const url = `${TEMPLATE_PATH}?screen=${screen.param}`;
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");
    await new Promise((r) => setTimeout(r, 500));

    const element = await page.$("#device-frame");
    if (element) {
      await element.screenshot({
        path: path.join(OUTPUT_DIR, `${screen.name}.png`),
        type: "png",
      });
      console.log(`Saved ${screen.name}.png`);
    } else {
      console.error(`Element #device-frame not found for ${screen.name}`);
    }
  }

  console.log("Generating Feature Graphic...");
  await page.setViewport({
    width: 1024,
    height: 500,
    deviceScaleFactor: 1,
  });

  await page.goto(FEATURE_GRAPHIC_TEMPLATE_PATH, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((r) => setTimeout(r, 2000));

  const featureElement = await page.$("#feature-graphic");
  if (featureElement) {
    await featureElement.screenshot({
      path: path.join(OUTPUT_DIR, "Feature_Graphic.png"),
      type: "png",
    });
    console.log("Saved Feature_Graphic.png");
  } else {
    console.error("Element #feature-graphic not found");
  }

  await browser.close();
  console.log("Done! Images saved to assets/images/preview/");
})();
