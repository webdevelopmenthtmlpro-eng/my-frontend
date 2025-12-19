export async function sendMessageToBackend(message, token) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data.reply || '';
  } catch (err) {
    console.error('sendMessageToBackend error', err);
    return 'Error: could not reach backend.';
  }
}
