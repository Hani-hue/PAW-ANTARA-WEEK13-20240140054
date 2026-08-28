const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth.middleware');
const {
  renderAdminProducts,
  renderCreateForm,
  renderEditForm,
  createProduct,
  updateProduct,
  deleteProduct,
  renderAdminInvoices,
  updateOrderStatus,
} = require('../controllers/admin.controller');

router.get('/products', isAdmin, renderAdminProducts);
router.get('/products/new', isAdmin, renderCreateForm);
router.post('/products', isAdmin, createProduct);
router.get('/products/:id/edit', isAdmin, renderEditForm);
router.post('/products/:id', isAdmin, updateProduct);
router.post('/products/:id/delete', isAdmin, deleteProduct);

// Invoice admin: lihat semua order & ubah status
router.get('/invoices', isAdmin, renderAdminInvoices);
router.post('/invoices/:id/status', isAdmin, updateOrderStatus);

module.exports = router;