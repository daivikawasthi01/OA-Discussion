function normalizeMarkdown(text) {
  if (!text || typeof text !== "string") return text;

  return text
    .replace(/\r\n/g, "\n")      // Windows → Unix
    .replace(/\n{3,}/g, "\n\n")  // Preserve markdown spacing
    .replace(/[ \t]+\n/g, "\n"); // Trim trailing spaces per line
}

module.exports = normalizeMarkdown;
