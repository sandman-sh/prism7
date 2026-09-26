// Vercel Serverless Proxy: SEC EDGAR Submissions API
// Proxies /api/sec/* to data.sec.gov with compliant User-Agent

export default async function handler(req, res) {
  const urlPath = req.url || '';
  const targetPath = urlPath.replace(/^\/api\/sec/, '');
  const targetUrl = `https://data.sec.gov${targetPath}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'PRISM7Desk contact@prism7.finance',
        'Accept': 'application/json',
      },
    });

    const data = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(data);
  } catch (error) {
    console.error('SEC proxy error:', error);
    res.status(502).json({ error: 'Proxy error', message: error.message });
  }
}
