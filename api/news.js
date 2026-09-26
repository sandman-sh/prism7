// Vercel Serverless Proxy: Yahoo Finance News/Search
// Proxies /api/news to Yahoo Finance search API

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export default async function handler(req, res) {
  const urlPath = req.url || '';
  const targetPath = urlPath.replace(/^\/api\/news/, '/v1/finance/search');
  const targetUrl = `https://query1.finance.yahoo.com${targetPath}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json, text/plain, */*',
      },
    });

    const data = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(data);
  } catch (error) {
    console.error('News proxy error:', error);
    res.status(502).json({ error: 'Proxy error', message: error.message });
  }
}
