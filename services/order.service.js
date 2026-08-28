const { Order, Product } = require('../models');
const { formatRupiah } = require('../utils/formatRupiah');
const bot = require('../config/telegram');

/**
 * 🛡️ DRY - SERVICE LAYER
 * ============================================================
 * createOrder() dipanggil dari controllers/order.controller.js (web).
 * notifyAdminNewOrder() dipanggil DARI DALAM createOrder() otomatis,
 * jadi logic "kurangin stok -> simpen order -> kirim notif admin"
 * cukup ditulis SEKALI di sini, gak nyebar ke banyak tempat.
 *
 * Bagian DRY paling kentara di project ini justru ada di
 * services/product.service.js: fungsi getAllProducts() dan
 * formatProductListText() dipake bareng-bareng di 3 tempat beda:
 * 1. Halaman web katalog (views/index.ejs, lewat page.controller.js)
 * 2. REST API GET /api/products
 * 3. Perintah /stok di bot Telegram (bot/handlers/stok.handler.js)
 * ============================================================
 */
async function createOrder({ productId, quantity, buyerName }) {
  const product = await Product.findByPk(productId);

  if (!product) {
    return { success: false, message: `Produk dengan ID ${productId} gak ditemukan` };
  }

  if (product.stock < quantity) {
    return {
      success: false,
      message: `Stok gak cukup. Stok tersedia: ${product.stock}, kamu minta: ${quantity}`,
    };
  }

  const order = await Order.create({
    productId: product.id,
    quantity,
    buyerName,
  });

  // kurangin stok - juga logic bisnis yang sama buat kedua pintu masuk
  product.stock -= quantity;
  await product.save();

  // 🛡️ DRY lagi: notifyAdminNewOrder dipanggil di sini, otomatis
  // ke-trigger baik order-nya datang dari web maupun dari Telegram
  await notifyAdminNewOrder(order, product);

  return { success: true, order, product };
}

/**
 * Kirim notifikasi ke admin lewat Telegram tiap ada order baru,
 * APAPUN sumbernya (web atau Telegram). Ini juga contoh reuse:
 * fungsi kirim pesan Telegram yang sama dipake buat notifikasi admin,
 * bukan cuma buat balesan ke pembeli.
 */
async function notifyAdminNewOrder(order, product) {
  const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;

  if (!bot || !adminChatId || adminChatId === 'isi-chat-id-admin') {
    console.log('ℹ️  Notifikasi admin dilewati (bot/ADMIN_TELEGRAM_CHAT_ID belum diset)');
    return;
  }

  const total = formatRupiah(product.price * order.quantity);

  // product.stock di titik ini SUDAH dikurangi (liat createOrder di atas,
  // notifyAdminNewOrder dipanggil SETELAH product.save())
  const stockWarning = product.stock <= 5 ? ' ⚠️ MENIPIS' : '';

  const text = [
    '🔔 Order baru masuk!',
    '',
    `Produk: ${product.name}`,
    `Jumlah dipesan: ${order.quantity}`,
    `Total: ${total}`,
    `Pembeli: ${order.buyerName}`,
    `Order ID: #${order.id}`,
    '',
    `📦 Sisa stok sekarang: ${product.stock}${stockWarning}`,
  ].join('\n');

  try {
    await bot.sendMessage(adminChatId, text);
  } catch (err) {
    console.error('Gagal kirim notifikasi ke admin:', err.message);
  }
}

async function getAllOrders() {
  return Order.findAll({ include: Product, order: [['createdAt', 'DESC']] });
}

module.exports = { createOrder, notifyAdminNewOrder, getAllOrders };
