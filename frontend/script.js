// Frontend script to handle brain dump submission
async function submitDump() {
  const accountId = document.getElementById('accountId').value.trim();
  const dump = document.getElementById('dump').value.trim();
  const resultEl = document.getElementById('result');
  resultEl.textContent = 'Submitting...';

  try {
    const res = await fetch('/submit-dump', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, dump })
    });

    const data = await res.json();
    if (!res.ok) {
      resultEl.textContent = data.error || 'Error submitting dump';
      return;
    }
    // Display results
    resultEl.innerHTML = `
      <div class="mt-4">
        <h2 class="text-lg font-semibold mb-2">Summary</h2>
        <p class="mb-4">${data.summary || ''}</p>
        <h2 class="text-lg font-semibold mb-2">Justification</h2>
        <p class="mb-4">${data.justification || ''}</p>
        <h2 class="text-lg font-semibold mb-2">Scores</h2>
        <ul class="list-disc list-inside mb-4">
          <li>Trust: ${data.trust_delta ?? ''}</li>
          <li>Momentum: ${data.momentum_delta ?? ''}</li>
          <li>Loyalty: ${data.loyalty_delta ?? ''}</li>
        </ul>
        <h2 class="text-lg font-semibold mb-2">Next Steps</h2>
        <ul class="list-disc list-inside">
          ${(data.recommended_actions || [])
            .map(a => `<li>${a}</li>`)
            .join('')}
        </ul>
      </div>`;
  } catch (err) {
    resultEl.textContent = 'Request failed';
  }
}

document.getElementById('submitBtn').addEventListener('click', (e) => {
  e.preventDefault();
  submitDump();
});
