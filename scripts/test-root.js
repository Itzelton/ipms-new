// Simple script to call the backend root endpoint
(async () => {
  try {
    const res = await fetch('http://localhost:3333/');
    console.log('status', res.status);
    const body = await res.text();
    console.log('body', body);
  } catch (e) {
    console.error('request failed', e);
    process.exit(1);
  }
})();
