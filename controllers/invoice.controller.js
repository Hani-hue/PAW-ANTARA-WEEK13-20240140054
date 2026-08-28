const orderService = require('../services/order.service');

async function renderInvoices(req, res) {
  try {
    // 🛡️ DRY: fungsi yang sama juga dipake di controllers/order.controller.js
    // buat GET /api/orders
    const orders = await orderService.getAllOrders();

    res.render('invoices', {
      orders: orders.map((o) => o.toJSON()),
    });
  } catch (err) {
    res.status(500).send('Gagal memuat invoice: ' + err.message);
  }
}

module.exports = { renderInvoices };
