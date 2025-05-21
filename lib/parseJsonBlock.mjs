export default function parseJsonBlock(text = '') {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/i);
  return match ? match[1].trim() : null;
}
