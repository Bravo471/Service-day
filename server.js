const http = require('http');
const { handleServiceRoutes } = require('./routes/serviceRoutes');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (url.pathname.startsWith('/api/services')) {
    handleServiceRoutes(req, res, url);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Route not found' }));
});

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
