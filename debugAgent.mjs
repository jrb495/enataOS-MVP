import fs from 'fs/promises';

async function main() {
  const dump = JSON.parse(await fs.readFile('test-dump.json', 'utf8'));
  const res = await fetch('http://localhost:3000/submit-dump', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId: dump.account_id || dump.accountId, dump: dump.dump })
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log(text);
}

main().catch(err => {
  console.error('Debug agent failed:', err);
});


