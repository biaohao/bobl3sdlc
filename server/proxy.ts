import express from 'express';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

const app = express();
const PORT = process.env.PROXY_PORT || 3001;

app.use(express.json());

// CORS headers for local development
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Quote endpoint: /api/quote?symbols=IBM,MSFT,ORCL
app.get('/api/quote', async (req, res) => {
  try {
    const symbols = (req.query.symbols as string)?.split(',').map(s => s.trim().toUpperCase()) || [];
    if (symbols.length === 0) {
      return res.status(400).json({ error: 'symbols query parameter required' });
    }

    const quotes = await yahooFinance.quote(symbols);

    // yahoo-finance2 v4 returns array for multiple symbols, object for single
    const quotesArray = Array.isArray(quotes) ? quotes : [quotes];

    // Build lookup map by symbol
    const quotesMap = new Map<string, typeof quotesArray[0]>();
    for (const q of quotesArray) {
      if (q?.symbol) {
        quotesMap.set(q.symbol, q);
      }
    }

    const results = symbols.map(symbol => {
      const quote = quotesMap.get(symbol);
      if (!quote) {
        return {
          symbol,
          regularMarketPrice: 0,
          regularMarketChange: 0,
          regularMarketChangePercent: 0,
          regularMarketTime: Date.now(),
          longName: symbol,
          shortName: symbol,
          currency: 'USD',
          marketState: 'UNKNOWN',
        };
      }
      return {
        symbol: quote.symbol ?? symbol,
        regularMarketPrice: quote.regularMarketPrice ?? 0,
        regularMarketChange: quote.regularMarketChange ?? 0,
        regularMarketChangePercent: quote.regularMarketChangePercent ?? 0,
        regularMarketTime: typeof quote.regularMarketTime === 'number' ? quote.regularMarketTime : Date.now(),
        longName: quote.longName ?? symbol,
        shortName: quote.shortName ?? symbol,
        currency: quote.currency ?? 'USD',
        marketState: quote.marketState ?? 'UNKNOWN',
      };
    });

    res.json({ ok: true, data: results });
  } catch (error) {
    console.error('Quote fetch error:', error);
    res.status(500).json({
      ok: false,
      error: {
        code: 'NETWORK',
        message: 'Failed to fetch quotes',
      },
    });
  }
});

// History endpoint: /api/history?symbol=IBM&period1=2024-01-01&period2=2024-12-31
app.get('/api/history', async (req, res) => {
  try {
    const symbol = (req.query.symbol as string)?.toUpperCase();
    const period1 = req.query.period1 ? new Date(req.query.period1 as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const period2 = req.query.period2 ? new Date(req.query.period2 as string) : new Date();

    if (!symbol) {
      return res.status(400).json({ error: 'symbol query parameter required' });
    }

    const history = await yahooFinance.chart(symbol, {
      period1,
      period2,
      interval: '1d',
    });

    if (!history.quotes || history.quotes.length === 0) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: `No historical data found for ${symbol}` },
      });
    }

    const points = history.quotes
      .filter(q => q.close != null && q.date)
      .map(q => ({
        date: q.date instanceof Date ? q.date.toISOString().split('T')[0] : q.date,
        close: q.close ?? 0,
        high: q.high ?? 0,
        low: q.low ?? 0,
        open: q.open ?? 0,
        volume: q.volume ?? 0,
        adjustedClose: q.adjclose ?? q.close ?? 0,
      }));

    res.json({ ok: true, data: points });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      ok: false,
      error: {
        code: 'NETWORK',
        message: 'Failed to fetch history',
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Yahoo Finance proxy running on http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  GET /health`);
  console.log(`  GET /api/quote?symbols=IBM,MSFT,ORCL`);
  console.log(`  GET /api/history?symbol=IBM&period1=2024-01-01&period2=2024-12-31`);
});