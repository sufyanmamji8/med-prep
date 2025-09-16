// scripts/download-all-subject-assets.js
const axios = require("axios");
const cheerio = require("cheerio");
const download = require("download");
const fs = require("fs");
const path = require("path");

const BASE = "https://whatsbiz.codovio.com";
const HIERARCHY_API = `${BASE}/mrcem/textBookHierarchy`;
const DETAILS_API_FOR = (pipePath) => `${BASE}/mrcem/getFile/${pipePath}`;

// Where to put local assets and HTML
const PUBLIC_IMAGES_DIR = path.join(__dirname, "..", "public", "images", "subjects");
const PUBLIC_HTML_DIR = path.join(__dirname, "..", "public", "subject-html");
const MAP_FILE = path.join(__dirname, "..", "public", "subject-map.json");

// Utilities
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\-]+/g, "-")
    .replace(/\-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function pathKeyFromSegments(segments) {
  // API uses pipe-delimited path. We want each segment encoded for HTTP and raw pipe kept
  return segments.map((seg) => encodeURIComponent(String(seg).trim())).join("|");
}
function folderNameFromSegments(segments) {
  return segments.map(slugify).join("-");
}

async function fetchHierarchy() {
  const res = await axios.get(HIERARCHY_API);
  // API returns { textBookHierarchy: { ... } } based on your earlier messages
  return res.data?.textBookHierarchy || res.data || {};
}

async function fetchDetailsHtml(pipePath) {
  const url = DETAILS_API_FOR(pipePath);
  const res = await axios.get(url, { timeout: 20000 });
  // The API might return raw HTML string or JSON with HTML fields — handle both
  if (typeof res.data === "string") return res.data;
  // try common JSON keys:
  const possible = res.data?.html || res.data?.content || res.data?.data || res.data;
  if (typeof possible === "string") return possible;
  return JSON.stringify(res.data);
}

async function downloadAndRewriteHtml(html, slugFolderRelative) {
  const $ = cheerio.load(html, { decodeEntities: false });

  // Collect image downloads
  const imageTasks = [];
  $("img").each((i, el) => {
    const src = $(el).attr("src");
    if (!src) return;
    let abs = src;
    if (abs.startsWith("//")) abs = "https:" + abs;
    else if (abs.startsWith("/")) abs = BASE + abs;
    else if (!/^https?:\/\//i.test(abs)) abs = BASE + "/" + abs.replace(/^\.?\//, "");

    const parsedName = path.basename(abs.split("?")[0]) || `img-${i}.jpg`;
    const filename = parsedName;
    const localRelPath = `/images/subjects/${slugFolderRelative}/${filename}`;
    // Replace src in the HTML to local path
    $(el).attr("src", localRelPath);

    imageTasks.push({ url: abs, filename });
  });

  // Download images
  const localDir = path.join(PUBLIC_IMAGES_DIR, slugFolderRelative);
  ensureDir(localDir);

  for (let t of imageTasks) {
    const filepath = path.join(localDir, t.filename);
    if (fs.existsSync(filepath)) {
      console.log(`  ☑ already: ${slugFolderRelative}/${t.filename}`);
      continue;
    }
    console.log(`  ⬇️  ${t.url}  -> ${slugFolderRelative}/${t.filename}`);
    try {
      await download(t.url, localDir, { filename: t.filename });
    } catch (err) {
      console.error(`    ❌ failed to download ${t.url}: ${err.message}`);
    }
  }

  // Return rewritten HTML string
  return $.html();
}

// Walk hierarchy recursively and produce segments (array of arrays)
function collectPathsFromHierarchy(hierarchy) {
  const results = [];

  // hierarchy could be object: { main: value, main2: value2 }
  Object.entries(hierarchy).forEach(([main, content]) => {
    // content could be array or object
    const root = main;
    if (Array.isArray(content)) {
      content.forEach((item) => {
        if (typeof item === "string") {
          results.push([root, item]);
        } else if (item && typeof item === "object") {
          // item may have name or nested structure
          const name = item.name || item.title || item.label;
          if (name) results.push([root, name]);
          // if item has children:
          if (item.children) {
            item.children.forEach((c) => {
              const cname = typeof c === "string" ? c : c.name || c.title;
              if (cname) results.push([root, name, cname]);
            });
          }
        }
      });
    } else if (content && typeof content === "object") {
      // treat keys as chapters -> topics arrays
      Object.entries(content).forEach(([chapter, topics]) => {
        if (Array.isArray(topics)) {
          topics.forEach((topic) => {
            if (typeof topic === "string") results.push([root, chapter, topic]);
            else if (topic && typeof topic === "object") {
              const tname = topic.name || topic.title || topic.label;
              if (tname) results.push([root, chapter, tname]);
            }
          });
        }
      });
    }
  });

  return results;
}

async function main() {
  ensureDir(PUBLIC_IMAGES_DIR);
  ensureDir(PUBLIC_HTML_DIR);

  console.log("Fetching hierarchy...");
  const hierarchy = await fetchHierarchy();
  const pathsList = collectPathsFromHierarchy(hierarchy);
  console.log(`Found ${pathsList.length} subject paths (approx).`);

  const map = {}; // mapping: pipeKey -> { slug, localHtml }

  for (const segments of pathsList) {
    try {
      const pipeKey = pathKeyFromSegments(segments); // encoded segments joined with '|'
      const slug = folderNameFromSegments(segments);
      console.log(`\nProcessing: ${segments.join(" | ")}  => slug: ${slug}`);

      // Attempt fetching details
      let rawHtml;
      try {
        rawHtml = await fetchDetailsHtml(pipeKey);
      } catch (err) {
        console.warn(`  ⚠ details fetch failed for ${pipeKey} (trying unencoded) : ${err.message}`);
        // try raw un-encoded path (rare)
        const rawPath = segments.map((s) => s).join("|");
        try {
          rawHtml = await fetchDetailsHtml(rawPath);
        } catch (err2) {
          console.error(`  ❌ failed to fetch details for ${pipeKey}: ${err2.message}`);
          continue;
        }
      }

      // rewrite and download images
      const rewritten = await downloadAndRewriteHtml(rawHtml, slug);

      // save rewritten HTML
      const htmlFile = path.join(PUBLIC_HTML_DIR, `${slug}.html`);
      fs.writeFileSync(htmlFile, rewritten, "utf8");

      map[pipeKey] = {
        slug,
        slugPath: slug,
        localHtml: `/subject-html/${slug}.html`,
        originalSegments: segments,
      };

      console.log(`  ✅ saved rewritten html: /subject-html/${slug}.html`);
    } catch (err) {
      console.error("  ❌ unexpected error:", err.message);
    }
  }

  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2), "utf8");
  console.log(`\nDone. Map written to public/subject-map.json`);
  console.log("Images saved to public/images/subjects/<slug>/");
  console.log("HTML saved to public/subject-html/<slug>.html");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
