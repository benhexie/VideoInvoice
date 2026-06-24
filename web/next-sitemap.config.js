/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://videoinvoice.app",
  generateRobotsTxt: true,
  sitemapSize: 1000,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
};
