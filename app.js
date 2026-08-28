require("dotenv").config();
const express = require("express");
const session = require("express-session");
const { sequelize } = require("./models");
const startBot = require("./bot/bot");
const { isAuthenticated, attachUserToViews } = require("./middleware/auth.middleware");

const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const chatRoutes = require("./routes/chat.routes");
const pageRoutes = require("./routes/page.routes");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // buat baca body dari form HTML

app.use(
  session({
    secret: process.env.SESSION_SECRET || "ganti-secret-ini-di-env",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 hari
  })
);

// 🛡️ DRY: sekali pasang di sini, res.locals.currentUser otomatis kebaca
// di SEMUA view EJS (nav.ejs dsb) tanpa tiap controller kirim manual.
app.use(attachUserToViews);

app.use("/", authRoutes); // /login, /register, /logout - harus publik, gak boleh diproteksi
app.use("/admin", adminRoutes); // masing-masing route di dalam udah diproteksi isAdmin

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/", isAuthenticated, pageRoutes); // katalog & invoice wajib login (customer ATAU admin)

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Koneksi database berhasil");

    await sequelize.sync();
    console.log("Sync model selesai");

    // Express (halaman web tempat user belanja) dan bot Telegram (khusus
    // admin) jalan BARENG dalam 1 process, sama-sama manggil service
    // layer yang sama (liat services/)
    app.listen(PORT, () => {
      console.log(`Server web jalan di http://localhost:${PORT}`);
    });

    startBot();
  } catch (err) {
    console.error("Gagal konek ke database:", err.message);
  }
}

start();