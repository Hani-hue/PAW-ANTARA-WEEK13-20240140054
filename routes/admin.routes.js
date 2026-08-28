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
} = require('../controllers/admin.controller');

router.get('/products', isAdmin, renderAdminProducts);
router.get('/products/new', isAdmin, renderCreateForm);
router.post('/products', isAdmin, createProduct);
router.get('/products/:id/edit', isAdmin, renderEditForm);
router.post('/products/:id', isAdmin, updateProduct);
router.post('/products/:id/delete', isAdmin, deleteProduct);

module.exports = router;