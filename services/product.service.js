const { Product } = require('../models');
const { formatRupiah } = require('../utils/formatRupiah');

/**
 * 🛡️ DRY - SERVICE LAYER
 * ============================================================
 * Semua fungsi di file ini dipanggil dari 2 tempat beda:
 * 1. controllers/product.controller.js (buat REST API / web)
 * 2. bot/handlers/produk.handler.js   (buat bot Telegram)
 *
 * Tanpa layer ini, query "ambil semua produk" bakal ditulis 2 kali
 * di 2 tempat beda - kalo suatu saat query-nya perlu diubah (misal
 * nambah filter stok), kita harus inget ubah di 2 tempat. Gampang
 * lupa salah satu, jadi sumber bug.
 *
 * Dengan service layer: query cukup ditulis SEKALI di sini,
 * controller & bot handler tinggal MEMANGGIL fungsi ini.
 *
 * Fungsi create/update/delete di bawah ini dipake khusus
 * admin.controller.js (dashboard admin) - tapi tetep ditaruh di
 * service layer ini biar konsisten satu pintu buat semua query produk.
 * ============================================================
 */

async function getAllProducts() {
  return Product.findAll({ order: [['id', 'ASC']] });
}

async function getProductById(id) {
  return Product.findByPk(id);
}

async function createProduct({ name, description, price, stock }) {
  if (!name || price === undefined || price === null) {
    return { success: false, message: 'Nama dan harga produk wajib diisi' };
  }
  if (Number(price) < 0 || Number(stock) < 0) {
    return { success: false, message: 'Harga dan stok tidak boleh negatif' };
  }

  const product = await Product.create({
    name,
    description: description || null,
    price: Number(price),
    stock: Number(stock) || 0,
  });
  return { success: true, product };
}

async function updateProduct(id, { name, description, price, stock }) {
  const product = await Product.findByPk(id);
  if (!product) {
    return { success: false, message: 'Produk tidak ditemukan' };
  }
  if (!name || price === undefined || price === null) {
    return { success: false, message: 'Nama dan harga produk wajib diisi' };
  }
  if (Number(price) < 0 || Number(stock) < 0) {
    return { success: false, message: 'Harga dan stok tidak boleh negatif' };
  }

  await product.update({
    name,
    description: description || null,
    price: Number(price),
    stock: Number(stock) || 0,
  });
  return { success: true, product };
}

async function deleteProduct(id) {
  const product = await Product.findByPk(id);
  if (!product) {
    return { success: false, message: 'Produk tidak ditemukan' };
  }
  await product.destroy();
  return { success: true };
}

/**
 * Format daftar produk jadi teks siap kirim - dipake bot Telegram
 * buat balesan /produk. Sengaja dipisah dari getAllProducts() biar
 * fungsi query & fungsi format gak nyampur (single responsibility).
 */
function formatProductListText(products) {
  if (products.length === 0) {
    return 'Belum ada produk tersedia.';
  }

  const lines = products.map((p) => {
    const stockInfo = p.stock > 0 ? `Stok: ${p.stock}` : 'HABIS';
    return `#${p.id} — ${p.name}\n${formatRupiah(p.price)} | ${stockInfo}`;
  });

  return lines.join('\n\n');
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  formatProductListText,
};