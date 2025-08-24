import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { formatText } from "../utils/format.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function scaffoldFiles(config, generated) {
  const root = path.resolve(process.cwd(), config.name);
  await fs.mkdir(root, { recursive: true });

  // Write index.html
  const htmlPath = path.join(root, "index.html");
  await fs.writeFile(htmlPath, await formatText(generated.html, "html"), "utf8");

  // Write CSS if present
  if (generated.css) {
    const cssPath = path.join(root, "style.css");
    await fs.writeFile(cssPath, await formatText(generated.css, "css"), "utf8");
  }

  // Write JS if present
  if (generated.js) {
    const jsPath = path.join(root, "script.js");
    await fs.writeFile(jsPath, await formatText(generated.js, "babel"), "utf8");
  }

  // Copy a tiny favicon and default robots.txt (optional niceties)
  const templatesDir = path.join(__dirname, "..", "templates");
  await safeCopy(path.join(templatesDir, "favicon.svg"), path.join(root, "favicon.svg"));
  await safeCopy(path.join(templatesDir, "robots.txt"), path.join(root, "robots.txt"));

  // Project README
  const readme = mkReadme(config);
  await fs.writeFile(path.join(root, "README.md"), readme, "utf8");

  return { root };
}

async function safeCopy(src, dest) {
  try {
    const data = await fs.readFile(src);
    await fs.writeFile(dest, data);
  } catch {
    // ignore if template missing
  }
}

function mkReadme(config) {
  const pagesList = config.pages.map((p) => `- ${p}`).join("\n");
  return `# ${config.name}

Generated with **Prompt-Driven Static Site Generator**.

## How to run locally
Open \`index.html\` in your browser (just double-click).
Or start a simple server:

\`\`\`bash
# Python 3
python -m http.server 5173

# Node (if installed globally)
npx http-server .
\`\`\`

## Pages
${pagesList}

## Customize
- Update copy in \`index.html\`.
- Tweak styles in \`style.css\`.
- JS enhancements in \`script.js\`.

> Prompt: ${config.prompt}
> Theme: ${config.theme}
`;
}
