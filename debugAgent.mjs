import fs from 'fs/promises';

async function main() {
  const payload = JSON.parse(await fs.readFile('./test-dump.json', 'utf8'));
  const res = await fetch('http://localhost:3000/submit-dump', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(text);
}

main().catch((err) => {
  console.error('Debug agent failed:', err);
});