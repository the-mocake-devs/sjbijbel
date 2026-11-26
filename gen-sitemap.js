const fs = require("fs");

const books = fs.readdirSync("bijbel").filter(f => f.endsWith(".html")).map(f => "/bijbel/" + f.replace(".html", ""));
const guides = fs.readdirSync("gids").filter(f => f.endsWith(".html")).map(f => "/gids/" + f.replace(".html", ""));
const core = ["/", "/lezen", "/bijbelboeken", "/gids", "/quest", "/about", "/privacy", "/contact"];
const urls = [...core, ...books, ...guides];

const lines = urls.map(u => [
  "  <url>",
  "    <loc>https://sjbijbel.app" + u + "</loc>",
  "    <lastmod>2026-11-26</lastmod>",
  "  </url>"
].join("\n"));

const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  lines.join("\n") +
  "\n</urlset>\n";

fs.writeFileSync("sitemap.xml", xml);
console.log("urls:", urls.length, "books:", books.length, "guides:", guides.length);
