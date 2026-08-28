require('dotenv').config();
const { sequelize, Product, User } = require('../models');
const authService = require('../services/auth.service');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Koneksi database berhasil');
    await sequelize.sync();

    // Akun admin default - dibikin lewat seeder (bukan form register publik)
    // biar orang gak bisa daftar sendiri jadi admin.
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (!existingAdmin) {
      await authService.registerUser({ username: 'admin', password: 'admin123', role: 'admin' });
      console.log('Akun admin dibikin -> username: admin, password: admin123 (GANTI setelah login pertama)');
    } else {
      console.log('Akun admin udah ada, skip');
    }

    const existingProducts = await Product.count();
    if (existingProducts === 0) {
      await Product.bulkCreate([
        {
          name: 'Kaos Polos A',
          description: 'Bahan cotton combed 30s, adem, tersedia warna hitam & putih. Cocok buat harian, harga lebih terjangkau.',
          price: 75000,
          stock: 50,
        },
        {
          name: 'Kaos Polos B',
          description: 'Bahan cotton combed 24s (lebih tebal & premium dari versi A), tersedia warna navy & maroon. Lebih awet, harga sedikit lebih tinggi.',
          price: 95000,
          stock: 30,
        },
        { name: 'Kemeja Flanel', description: 'Motif kotak-kotak, bahan tebal, cocok buat cuaca dingin', price: 150000, stock: 20 },
        { name: 'Kemeja Linen Lengan Panjang', description: 'Bahan linen adem, cocok buat gaya kasual formal', price: 165000, stock: 18 },
        { name: 'Celana Chino Slim Fit', description: 'Warna khaki, bahan stretch, nyaman dipake seharian', price: 180000, stock: 15 },
        { name: 'Celana Jeans Regular Fit', description: 'Denim tebal, warna biru dongker, awet dan gak gampang pudar', price: 195000, stock: 25 },
        { name: 'Celana Jogger Training', description: 'Bahan ringan menyerap keringat, cocok buat olahraga atau santai', price: 120000, stock: 40 },
        { name: 'Hoodie Oversize', description: 'Bahan fleece tebal, model oversize, tersedia warna abu & hitam', price: 175000, stock: 22 },
        { name: 'Jaket Bomber', description: 'Bahan parasut anti angin, cocok buat cuaca dingin atau hujan ringan', price: 210000, stock: 12 },
        { name: 'Sweater Rajut', description: 'Motif polos, bahan rajut lembut, hangat dipakai malam hari', price: 140000, stock: 20 },
        { name: 'Sepatu Sneakers Canvas', description: 'Cocok buat kasual, tersedia banyak ukuran', price: 220000, stock: 30 },
        { name: 'Sepatu Slip-On', description: 'Simpel tanpa tali, gampang dipake, cocok buat harian', price: 165000, stock: 28 },
        { name: 'Sandal Selop Kulit', description: 'Bahan kulit sintetis, nyaman dan tahan lama', price: 85000, stock: 35 },
        { name: 'Topi Baseball Cap', description: 'Bahan katun twill, adjustable strap, tersedia banyak warna', price: 55000, stock: 45 },
        { name: 'Tas Selempang Kanvas', description: 'Muat laptop 13 inch, banyak kompartemen, cocok buat kuliah', price: 130000, stock: 20 },
      ]);
      console.log('Produk berhasil ditambahin (15 produk buat demo katalog & CRUD admin)');
    } else {
      console.log('Produk udah ada, skip supaya gak dobel');
    }

    console.log('\nSeeding selesai ✅');
    console.log('Login admin -> http://localhost:3000/login (username: admin, password: admin123)');
    console.log('Buka http://localhost:3000 buat coba chat & order.');
    console.log('Coba tanya AI: "bagusan kaos polos A apa B?"');
    console.log('Terus coba: "ya udah aku beli kaos polos B 5 biji atas nama Budi"');
    console.log('Chat /stok ke bot Telegram buat cek stok dari sisi admin.');
    process.exit(0);
  } catch (err) {
    console.error('Gagal seeding:', err.message);
    process.exit(1);
  }
}

seed();