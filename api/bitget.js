// Vercel Serverless Proxy: Bitget Exchange API
// Proxies /api/bitget/* to api.bitget.com

export default async function handler(req, res) {
  const urlPath = req.url || '';
  const targetPath = urlPath.replace(/^\/api\/bitget/, '');
  const targetUrl = `https://api.bitget.com${targetPath}`;

  try {
    // Forward all original headers except host
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
        headers[key] = value;
      }
    }

    const fetchOptions = {
      method: req.method || 'GET',
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = await readBody(req);
      if (body) fetchOptions.body = body;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    res.send(data);
  } catch (error) {
    console.error('Bitget proxy error:', error);
    res.status(502).json({ error: 'Proxy error', message: error.message });
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body) {
      resolve(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      return;
    }
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data || null));
  });
}
