#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import * as dotenv from "dotenv";
import { generateSite } from "./lib/generate.js";
import { scaffoldFiles } from "./lib/scaffold.js";

dotenv.config();

const program = new Command();

program
  .name("pds")
  .description("Prompt-Driven Static Site Generator (Gemini + Node.js)")
  .option("-p, --prompt <text>", "site brief, e.g. 'marketing site for a solar startup'")
  .option("-n, --name <text>", "project folder name", "my-static-site")
  .option("-t, --theme <text>", "brand colors or vibe, e.g. 'green, clean, modern'")
  .option("--pages <list>", "comma-separated pages (e.g. home,about,contact)", "home,about,contact")
  .option("--no-js", "skip script.js generation")
  .option("--no-css", "skip style.css generation")
  .parse(process.argv);

async function main() {
  const opts = program.opts();

  // Ask missing info interactively
  const answers = await inquirer.prompt(
    [
      !opts.prompt && {
        type: "input",
        name: "prompt",
        message: "Describe the site you want:",
        default: "A clean marketing site for a solar energy startup."
      },
      !opts.theme && {
        type: "input",
        name: "theme",
        message: "Theme / brand keywords (colors, tone):",
        default: "green, clean, modern, trustworthy"
      },
      !opts.name && {
        type: "input",
        name: "name",
        message: "Project name (folder):",
        default: "my-static-site"
      }
    ].filter(Boolean)
  );

  const config = {
    prompt: opts.prompt ?? answers.prompt,
    theme: opts.theme ?? answers.theme,
    name: opts.name ?? answers.name,
    pages: opts.pages.split(",").map((s) => s.trim()).filter(Boolean),
    includeJS: opts.js,
    includeCSS: opts.css
  };

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY missing. Put it in .env");
    process.exit(1);
  }

  console.log("🧠 Generating with Gemini…");
  const generated = await generateSite(config);

  console.log("🛠️  Writing files…");
  const written = await scaffoldFiles(config, generated);

  console.log(`✅ Done! Open ./${config.name}/index.html in your browser.`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
