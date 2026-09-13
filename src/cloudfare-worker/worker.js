// ETF Price Proxy — Cloudflare Worker
//
// Fetches quotes from Yahoo Finance's unofficial chart endpoint and returns
// them with permissive CORS headers so a browser-based app can call it
// directly. Yahoo doesn't send CORS headers itself, which is why a direct
// fetch() from the dashboard fails — this Worker sits in between and adds
// the missing header.
//
// Usage:  GET https://<your-worker>.workers.dev?symbol=VUAA.L
// Returns: { symbol, price, currency, exchange, previousClose, updatedAt }

const CACHE_TTL_SECONDS = 15 * 60; // 15 min edge cache — be a good citizen to Yahoo's free endpoint

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    const symbol = url.searchParams.get('symbol');
    if (!symbol) {
      return jsonResponse({ error: 'Missing "symbol" query param' }, 400);
    }

    // Serve from Cloudflare's edge cache if we have a recent copy
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const yahooRes = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`,
        {
          headers: {
            // Yahoo rejects requests with no User-Agent
            'User-Agent': 'Mozilla/5.0 (compatible; FirePortfolioTracker/1.0)',
          },
        }
      );

      if (!yahooRes.ok) {
        return jsonResponse({ error: `Yahoo returned ${yahooRes.status}`, symbol }, 502);
      }

      const data = await yahooRes.json();
      const result = data?.chart?.result?.[0];

      if (!result || !result.meta) {
        return jsonResponse({ error: 'No data returned for symbol', symbol }, 404);
      }

      const payload = {
        symbol,
        price: result.meta.regularMarketPrice ?? null,
        currency: result.meta.currency ?? null,
        exchange: result.meta.exchangeName ?? null,
        previousClose: result.meta.chartPreviousClose ?? null,
        updatedAt: new Date().toISOString(),
      };

      const response = jsonResponse(payload, 200, CACHE_TTL_SECONDS);
      await cache.put(cacheKey, response.clone());
      return response;
    } catch (err) {
      return jsonResponse({ error: err.message, symbol }, 500);
    }
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(body, status = 200, cacheSeconds = 0) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
      ...(cacheSeconds ? { 'Cache-Control': `public, max-age=${cacheSeconds}` } : {}),
    },
  });
}
