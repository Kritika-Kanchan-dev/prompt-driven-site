import { GoogleGenerativeAI } from "@google/generative-ai";
import { siteSystemPrompt } from "./prompts.js";

/**
 * High-level orchestrator:
 *  - Produces index.html (with basic nav for pages)
 *  - Optionally produces style.css
 *  - Optionally produces script.js
 */
export async function generateSite(config) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const { prompt, theme, pages, includeCSS, includeJS } = config;

  const pageListText = pages.map((p) => p[0].toUpperCase() + p.slice(1)).join(", ");

  // 1) HTML
  const htmlInstruction = `
You are generating the main HTML for a static website.

Context:
- Brief: ${prompt}
- Theme keywords: ${theme}
- Pages: ${pageListText}

Requirements:
- Produce a complete, valid HTML5 document.
- Create a responsive navbar with links for the listed pages (anchors/hrefs).
- Add hero section with a strong headline & subtext tailored to the brief.
- Add at least two supporting sections (features, testimonials, or CTA).
- Use semantic tags (header, main, section, footer).
- Do not inline large CSS or JS; link to style.css and script.js if they exist.
- Keep placeholder copy realistic and concise.
- Never include <script type="module"> or frameworks—just vanilla.
Return ONLY the HTML, nothing else.
`;

  const cssInstruction = `
You are generating the CSS for a static site.

Design keywords: ${theme}

Requirements:
- Define CSS variables for a primary color, accent, text, background.
- Make it clean, modern, and accessible (contrast).
- Include responsive rules (mobile-first).
- Style a header/navbar, hero, sections, buttons, cards, footer.
Return ONLY the CSS, nothing else.
`;

  const jsInstruction = `
You are generating minimal vanilla JS enhancements for a static site.

Requirements:
- Add a mobile nav toggle for small screens.
- Add smooth scrolling for local anchor links.
- Keep code small, framework-free, and robust.
Return ONLY the JS, nothing else.
`;

  const html = await call(model, siteSystemPrompt, htmlInstruction);

  const result = { html };
  if (includeCSS) result.css = await call(model, siteSystemPrompt, cssInstruction);
  if (includeJS) result.js = await call(model, siteSystemPrompt, jsInstruction);

  return result;
}

async function call(model, system, user) {
  const prompt = `${system}\n\n${user}`;
  const r = await model.generateContent(prompt);
  return r.response.text();
}

