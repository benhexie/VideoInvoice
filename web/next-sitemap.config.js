/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://videoinvoice.app",
  output: "export",
  trailingSlash: true,
  exclude: ["/404", "/404/", "/_not-found", "/_not-found/"],
  generateRobotsTxt: true,
  sitemapSize: 1000,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
};
