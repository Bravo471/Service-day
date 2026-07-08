const { ServiceItem } = require('../models/serviceItem');

const services = [
  new ServiceItem(1, 'Food Drive', 'Pack and distribute food to families in need.'),
  new ServiceItem(2, 'Tree Planting', 'Plant trees in the local community park.')
];

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function getAllServices(req, res) {
  sendJson(res, 200, services);
}

function getServiceById(req, res, id) {
  const item = services.find((service) => service.id.toString() === id);
  if (!item) {
    sendJson(res, 404, { message: 'Service item not found' });
    return;
  }

  sendJson(res, 200, item);
}

function createService(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};
      const newItem = new ServiceItem(
        Date.now(),
        data.name || 'New Service',
        data.description || 'Added from API'
      );
      services.push(newItem);
      sendJson(res, 201, newItem);
    } catch (error) {
      sendJson(res, 400, { message: 'Invalid JSON payload' });
    }
  });
}

module.exports = { getAllServices, getServiceById, createService };
