// scripts/make-absolute-urls.cjs
const fs = require("fs");
const path = require("path");

const baseUrl = process.argv[2] || "https://mrcem.codovio.com";
const htmlDir = path.join(__dirname, "../public/subject-html");
const mapFile = path.join(__dirname, "../public/subject-map.json");

// Recursive function to get all .html files
function getHtmlFiles(dir) {
  let results = [];
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(filePath));
    } else if (file.endsWith(".html")) {
      results.push(filePath);
    }
  });
  return results;
}

// Function to update image URLs in HTML
function updateHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // Replace old whatsBiz API links
  content = content.replace(
    /https?:\/\/whatsbiz\.codovio\.com\/mrcem\/getFile\/[^"']+/g,
    (match) => {
      const filename = decodeURIComponent(match.split("/").pop()).replace(/\|/g, "-");
      // Ab tumhare structure ke hisaab se
      return `${baseUrl}/images/subjects/${filename}`;
    }
  );

  // Replace relative <img src="..."> links
  content = content.replace(
    /<img\s+[^>]*src=["']([^"']+)["']/g,
    (tag, src) => {
      if (src.startsWith("http")) return tag; // already absolute
      const filename = src.split("/").pop();
      return tag.replace(src, `${baseUrl}/images/subjects/${filename}`);
    }
  );

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Updated ${path.basename(filePath)}`);
}

// Run updates
const htmlFiles = getHtmlFiles(htmlDir);
htmlFiles.forEach(updateHtmlFile);

// Fix subject-map.json paths
if (fs.existsSync(mapFile)) {
  const mapContent = fs.readFileSync(mapFile, "utf-8");
  const updatedMap = mapContent.replace(
    /"localHtml":\s*"(.*?)"/g,
    (match, p1) => `"localHtml": "${p1.replace(/\\/g, "/")}"`
  );
  fs.writeFileSync(mapFile, updatedMap, "utf-8");
  console.log("Updated subject-map.json with cleaned paths.");
}

console.log(`✅ Done. All image URLs now point to ${baseUrl}/images/subjects/`);
