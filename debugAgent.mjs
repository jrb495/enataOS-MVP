import fs from 'fs/promises';

async function main() {
<<<<<<< ours
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
=======
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


>>>>>>> theirs
