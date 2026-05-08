'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2/promise');

const app  = express();
const PORT = process.env.PORT || 5000;

// ════════════════════════════════════════════════════════════════
// Middleware
// ════════════════════════════════════════════════════════════════

app.use(cors());

app.use(express.json());

// ════════════════════════════════════════════════════════════════
// Database Connection Pool
// Menggunakan pool agar koneksi dikelola secara efisien
// ════════════════════════════════════════════════════════════════

const pool = mysql.createPool({
  host    : process.env.DB_HOST     || 'localhost',
  port    : process.env.DB_PORT     || 3306,
  user    : process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'db_customer',
  waitForConnections: true,
  connectionLimit   : 10,
  queueLimit        : 0,
});

// Verifikasi koneksi saat server pertama kali start
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Database terhubung ke:', process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('❌ Gagal terhubung ke database:', err.message);
    process.exit(1); // Hentikan server jika DB tidak bisa terhubung
  }
})();

// ════════════════════════════════════════════════════════════════
// Health Check
// ════════════════════════════════════════════════════════════════

/**
 * GET /api/health
 * Endpoint untuk memverifikasi server berjalan dengan baik.
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server berjalan normal', timestamp: new Date().toISOString() });
});

// ════════════════════════════════════════════════════════════════
// Endpoint: POST /api/sekolah
// ════════════════════════════════════════════════════════════════

/**
 * GET /api/sekolah
 * Mengambil semua data sekolah dari tabel `sekolah`.
 */
app.get('/api/sekolah', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sekolah ORDER BY id_sekolah DESC');
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('[GET /api/sekolah] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data sekolah.', error: err.message });
  }
});

/**
 * POST /api/sekolah
 * Menyimpan data sekolah baru ke tabel `sekolah`.
 *
 * Request body:
 * @param {string} nama_sekolah - Nama lengkap sekolah
 * @param {string} alamat      - Alamat lengkap sekolah
 *
 * Response:
 * @returns {object} { success, message, id }
 */
app.post('/api/sekolah', async (req, res) => {
  const { nama_sekolah, alamat } = req.body;

  // ── Validasi input ──
  if (!nama_sekolah || typeof nama_sekolah !== 'string' || nama_sekolah.trim() === '') {
    return res.status(400).json({ success: false, message: 'Nama sekolah tidak boleh kosong.' });
  }
  if (!alamat || typeof alamat !== 'string' || alamat.trim() === '') {
    return res.status(400).json({ success: false, message: 'Alamat tidak boleh kosong.' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO sekolah (nama_sekolah, alamat) VALUES (?, ?)',
      [nama_sekolah.trim(), alamat.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Data sekolah berhasil disimpan.',
      id     : result.insertId,
    });
  } catch (err) {
    console.error('[POST /api/sekolah] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan data sekolah.', error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// Endpoint: GET /api/pembelian
// ════════════════════════════════════════════════════════════════

/**
 * GET /api/pembelian
 * Mengambil semua data pembelian beserta nama sekolah (via LEFT JOIN).
 * @returns {object} { success, data }
 */
app.get('/api/pembelian', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id_pembelian,
        p.id_sekolah,
        s.nama_sekolah,
        p.varian_produk,
        p.tanggal_pembelian
      FROM pembelian p
      LEFT JOIN sekolah s ON p.id_sekolah = s.id_sekolah
      ORDER BY p.id_pembelian DESC
    `);
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('[GET /api/pembelian] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data pembelian.', error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// Endpoint: POST /api/pembelian
// ════════════════════════════════════════════════════════════════

/**
 * POST /api/pembelian
 * Menyimpan data transaksi pembelian ke tabel `pembelian`.
 *
 * Request body:
 * @param {string} varianProduk     - Salah satu dari ENUM varian produk
 * @param {string} tanggalPembelian - Tanggal dalam format YYYY-MM-DD
 *
 * Response:
 * @returns {object} { success, message, id }
 */

/** Nilai ENUM yang valid sesuai kolom `varian_produk` di tabel pembelian */
const VALID_VARIAN = [
  'Parenting Mempesona',
  'Parenting Outbond',
  'Mendongeng',
  'Assesment',
  'Open House',
  'Pelatihan Guru',
];

app.post('/api/pembelian', async (req, res) => {
  const { id_sekolah, varian_produk, tanggal_pembelian } = req.body;

  // ── Validasi input ──
  if (!id_sekolah) {
    return res.status(400).json({ success: false, message: 'Sekolah harus dipilih.' });
  }
  if (!varian_produk || !VALID_VARIAN.includes(varian_produk)) {
    return res.status(400).json({
      success: false,
      message: `Varian produk tidak valid. Pilihan: ${VALID_VARIAN.join(', ')}`,
    });
  }
  if (!tanggal_pembelian || !/^\d{4}-\d{2}-\d{2}$/.test(tanggal_pembelian)) {
    return res.status(400).json({ success: false, message: 'Format tanggal tidak valid. Gunakan YYYY-MM-DD.' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO pembelian (id_sekolah, varian_produk, tanggal_pembelian) VALUES (?, ?, ?)',
      [id_sekolah, varian_produk, tanggal_pembelian]
    );

    return res.status(201).json({
      success: true,
      message: 'Data pembelian berhasil disimpan.',
      id     : result.insertId,
    });
  } catch (err) {
    console.error('[POST /api/pembelian] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan data pembelian.', error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// Start Server
// ════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
