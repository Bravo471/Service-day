const { getAllServices, getServiceById, createService } = require('../controllers/serviceController');

function handleServiceRoutes(req, res, url) {
  const method = req.method.toUpperCase();
  const segments = url.pathname.split('/').filter(Boolean);
  const id = segments[2] || null;

  if (method === 'GET' && segments.length === 2) {
    getAllServices(req, res);
    return;
  }

  if (method === 'GET' && segments.length === 3) {
    getServiceById(req, res, id);
    return;
  }

  if (method === 'POST' && segments.length === 2) {
    createService(req, res);
    return;
  }

  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Method not allowed' }));
}

module.exports = { handleServiceRoutes };
