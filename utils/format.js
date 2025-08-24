import prettier from "prettier";

/**
 * Formats code before writing to disk.
 * @param {string} text
 * @param {'html'|'css'|'babel'|'markdown'} parser
 */
export async function formatText(text, parser = "babel") {
  try {
    return await prettier.format(text, { parser });
  } catch {
    // If Prettier fails (model returned odd text), write raw to avoid blocking.
    return text;
  }
}
