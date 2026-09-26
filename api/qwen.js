// Vercel Serverless Proxy: Qwen AI API
// Securely injects QWEN_API_KEY on server-side — never exposed to browser

export default async function handler(req, res) {
  const QWEN_API_KEY = process.env.QWEN_API_KEY || '';
  const QWEN_BASE_URL = process.env.QWEN_BASE_URL || 'https://dashscope-intl.aliyuncs.com';
  const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen3.8-max';

  // Handle status endpoint
  const urlPath = req.url || '';
  if (urlPath.includes('/status')) {
    return res.status(200).json({
      configured: Boolean(QWEN_API_KEY),
      model: QWEN_MODEL,
    });
  }

  // Forward the request to Qwen API
  const targetPath = urlPath.replace(/^\/api\/qwen/, '/v1');
  const targetUrl = `${QWEN_BASE_URL}${targetPath}`;

  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (QWEN_API_KEY) {
      headers['Authorization'] = `Bearer ${QWEN_API_KEY}`;
    }

    const fetchOptions = {
      method: req.method || 'POST',
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // Read the request body
      const body = await readBody(req);
      if (body) fetchOptions.body = body;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    // Forward response headers
    res.status(response.status);
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.send(data);
  } catch (error) {
    console.error('Qwen proxy error:', error);
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
