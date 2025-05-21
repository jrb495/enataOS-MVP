/**
 * Attempts to extract a valid JSON block from a string,
 * including cases where it's wrapped in ```json ... ```
 * or ``` ... ```
 *
 * @param {string} text - The full GPT response content
 * @returns {string|null} - Extracted JSON string or null if not found
 */
export default function parseJsonBlock(text) {
  if (!text) return null;

  // Match ```json ... ```
  const jsonTagged = text.match(/```json\s*([\s\S]*?)```/i);
  if (jsonTagged) return jsonTagged[1].trim();

  // Match generic ``` ... ```
  const genericBlock = text.match(/```\s*([\s\S]*?)```/);
  if (genericBlock) return genericBlock[1].trim();

  // Fallback: try to find the first balanced { ... }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const possibleJson = text.slice(firstBrace, lastBrace + 1).trim();
    try {
      JSON.parse(possibleJson);
      return possibleJson;
    } catch (err) {
      return null;
    }
  }

  return null;
}
