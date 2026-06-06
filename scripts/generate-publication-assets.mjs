import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const contentPath = path.join(repoRoot, "content", "site-content.json");
const rssPath = path.join(repoRoot, "rss.xml");
const sitemapPath = path.join(repoRoot, "sitemap.xml");

const raw = await fs.readFile(contentPath, "utf8");
const content = JSON.parse(raw);

const site = {
  title: content.site?.title || "HB",
  description: content.site?.description || "HB publication",
  url: content.site?.url || "https://smangat1.github.io/cs-law-publication/"
};

function publicUrl(relativePath) {
  return new URL(relativePath, site.url).href;
}

function xmlEscape(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rssDate(value) {
  const date = new Date(`${value}T12:00:00-04:00`);
  return date.toUTCString();
}

const publishedPieces = (content.pieces || [])
  .filter((piece) => piece.status === "published")
  .sort((left, right) => String(right.publishedAt).localeCompare(String(left.publishedAt)));

const publishedIssues = (content.issues || [])
  .filter((issue) => issue.status === "published")
  .sort((left, right) => String(right.publishedAt).localeCompare(String(left.publishedAt)));

const topics = [...new Set(publishedPieces.map((piece) => piece.category).filter(Boolean))].sort((left, right) => left.localeCompare(right));
const authors = [...new Set(publishedPieces.map((piece) => piece.author).filter(Boolean))].sort((left, right) => left.localeCompare(right));

const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(site.title)}</title>
    <link>${xmlEscape(site.url)}</link>
    <description>${xmlEscape(site.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${publishedPieces.map((piece) => `    <item>
      <title>${xmlEscape(piece.title)}</title>
      <link>${xmlEscape(publicUrl(`piece.html?id=${encodeURIComponent(piece.id)}`))}</link>
      <guid>${xmlEscape(publicUrl(`piece.html?id=${encodeURIComponent(piece.id)}`))}</guid>
      <pubDate>${rssDate(piece.publishedAt)}</pubDate>
      <description>${xmlEscape(piece.summary || piece.dek || "")}</description>
    </item>`).join("\n")}
  </channel>
</rss>
`;

const urls = [
  "",
  "about.html",
  "archive.html",
  "archive/articles.html",
  "archive/essays.html",
  "archive/issues.html",
  "topics.html",
  "authors.html",
  ...publishedIssues.map((issue) => issue.path || `issues/${issue.slug}.html`),
  ...publishedPieces.map((piece) => `piece.html?id=${encodeURIComponent(piece.id)}`),
  ...topics.map((topic) => `topic.html?name=${encodeURIComponent(topic)}`),
  ...authors.map((author) => `author.html?name=${encodeURIComponent(author)}`)
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((entry) => `  <url><loc>${xmlEscape(publicUrl(entry))}</loc></url>`).join("\n")}
</urlset>
`;

await fs.writeFile(rssPath, rss, "utf8");
await fs.writeFile(sitemapPath, sitemap, "utf8");

console.log("Generated rss.xml and sitemap.xml from content/site-content.json");
