import fs from 'fs/promises';

async function main() {
  const [, , file = 'test-dump.json', endpoint = 'http://localhost:3000/submit-dump'] = process.argv;
  const data = JSON.parse(await fs.readFile(file, 'utf8'));
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dump: data.dump, accountId: data.account_id || data.accountId })
  });
  console.log('Status:', res.status);
  console.log(await res.text());
}

main().catch((err) => {
  console.error('Debug agent failed:', err);
});
