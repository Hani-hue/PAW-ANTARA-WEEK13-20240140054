const productService = require('../services/product.service');

// 🛡️ DRY: reuse productService.getAllProducts() yang sama dipake katalog & bot /stok.
async function renderAdminProducts(req, res) {
  try {
    const products = await productService.getAllProducts();
    res.render('admin-products', {
      products: products.map((p) => p.toJSON()),
      storeName: process.env.STORE_NAME || 'Toko Kita',
      error: null,
    });
  } catch (err) {
    res.status(500).send('Gagal memuat halaman admin: ' + err.message);
  }
}

// Form tambah produk kosong
function renderCreateForm(req, res) {
  res.render('admin-product-form', {
    storeName: process.env.STORE_NAME || 'Toko Kita',
    mode: 'create',
    product: null,
    error: null,
  });
}

// Form edit produk terisi data lama
async function renderEditForm(req, res) {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.redirect('/admin/products');
    }
    res.render('admin-product-form', {
      storeName: process.env.STORE_NAME || 'Toko Kita',
      mode: 'edit',
      product: product.toJSON(),
      error: null,
    });
  } catch (err) {
    res.status(500).send('Gagal memuat form edit: ' + err.message);
  }
}

async function createProduct(req, res) {
  try {
    const { name, description, price, stock } = req.body;
    const result = await productService.createProduct({ name, description, price, stock });

    if (!result.success) {
      return res.render('admin-product-form', {
        storeName: process.env.STORE_NAME || 'Toko Kita',
        mode: 'create',
        product: req.body,
        error: result.message,
      });
    }
    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send('Gagal tambah produk: ' + err.message);
  }
}

async function updateProduct(req, res) {
  try {
    const { name, description, price, stock } = req.body;
    const result = await productService.updateProduct(req.params.id, { name, description, price, stock });

    if (!result.success) {
      return res.render('admin-product-form', {
        storeName: process.env.STORE_NAME || 'Toko Kita',
        mode: 'edit',
        product: { id: req.params.id, ...req.body },
        error: result.message,
      });
    }
    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send('Gagal update produk: ' + err.message);
  }
}

async function deleteProduct(req, res) {
  try {
    await productService.deleteProduct(req.params.id);
    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send('Gagal hapus produk: ' + err.message);
  }
}

module.exports = {
  renderAdminProducts,
  renderCreateForm,
  renderEditForm,
  createProduct,
  updateProduct,
  deleteProduct,
};