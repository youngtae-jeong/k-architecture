const fs = require("fs");
const path = require("path");

const newsDir = path.join(process.cwd(), "content", "news");
const outPath = path.join(process.cwd(), "content", "news.json");

function parseFrontmatter(md) {
  const m = md.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
  if (!m) return { data: {}, body: md.trim() };

  const fm = m[1];
  const body = (m[2] || "").trim();
  const data = {};

  fm.split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
    data[key] = val;
  });

  return { data, body };
}

function main() {
  if (!fs.existsSync(newsDir)) {
    fs.writeFileSync(outPath, JSON.stringify({ items: [] }, null, 2));
    return;
  }

  const files = fs.readdirSync(newsDir).filter((f) => f.endsWith(".md"));
  const items = files
    .map((file) => {
      const full = fs.readFileSync(path.join(newsDir, file), "utf-8");
      const { data, body } = parseFrontmatter(full);
      return {
        slug: file.replace(/\.md$/, ""),
        title: data.title || "",
        date: data.date || "",
        thumbnail: data.thumbnail || "",
        summary: data.summary || "",
        body: body || "",
      };
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  fs.writeFileSync(outPath, JSON.stringify({ items }, null, 2));
}

main();
