// Vercel Serverless Proxy: SEC Document Archive
// Proxies /api/sec-doc/* to www.sec.gov for full filing text extraction

export default async function handler(req, res) {
  const urlPath = req.url || '';
  const targetPath = urlPath.replace(/^\/api\/sec-doc/, '');
  const targetUrl = `https://www.sec.gov${targetPath}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'PRISM7Desk contact@prism7.finance',
        'Accept': 'text/html,application/xhtml+xml,text/plain,*/*',
      },
    });

    const data = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'text/html');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(data);
  } catch (error) {
    console.error('SEC-doc proxy error:', error);
    res.status(502).json({ error: 'Proxy error', message: error.message });
  }
}
