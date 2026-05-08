import { useState, useEffect } from 'react';
import axios from 'axios';

/** Base URL API backend. Sesuaikan jika port berbeda. */
const API_BASE = 'http://localhost:5000/api';
import {
  School,
  ShoppingCart,
  User,
  MapPin,
  Package,
  Calendar,
  Plus,
  CheckCircle,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';

/**
 * Daftar varian produk sesuai ENUM di tabel `pembelian` pada db_customer.sql.
 * @type {string[]}
 */
const VARIAN_PRODUK = [
  'Parenting Mempesona',
  'Parenting Outbond',
  'Mendongeng',
  'Assesment',
  'Open House',
  'Pelatihan Guru',
];

/**
 * Komponen Dashboard utama untuk sistem pencatatan data customer sekolah.
 * Terdiri dari dua form: Form Sekolah dan Form Pembelian.
 * @returns {JSX.Element}
 */
function Dashboard() {
  // ── State: Form Sekolah ──
  const [namaSekolah, setNamaSekolah] = useState('');
  const [alamat, setAlamat] = useState('');

  // ── State: List Sekolah (dari Backend) ──
  const [listSekolah, setListSekolah] = useState([]);

  // ── State: List Pembelian (dari Backend) ──
  const [listPembelian, setListPembelian] = useState([]);

  // ── State: Form Pembelian ──
  const [idSekolah, setIdSekolah] = useState('');
  const [varianProduk, setVarianProduk] = useState('');
  const [tanggalPembelian, setTanggalPembelian] = useState('');

  // ── State: Feedback ──
  const [submitStatus, setSubmitStatus] = useState({ sekolah: false, pembelian: false });
  /** State loading saat request sedang dikirim */
  const [loading, setLoading] = useState({ sekolah: false, pembelian: false });
  /** State pesan error dari API */
  const [apiError, setApiError] = useState({ sekolah: '', pembelian: '' });

  /**
   * Fetch data sekolah dari backend.
   */
  const fetchSekolah = async () => {
    console.log('⏳ Mengambil data sekolah...');
    try {
      const res = await axios.get(`${API_BASE}/sekolah`);
      if (res.data.success) {
        console.log('✅ Data Sekolah berhasil diambil:', res.data.data);
        setListSekolah(res.data.data);
      } else {
        console.error('❌ Data sekolah tidak sukses:', res.data);
      }
    } catch (err) {
      console.error('❌ Gagal mengambil data sekolah:', err);
    }
  };

  /**
   * Fetch data pembelian dari backend (dengan nama sekolah via JOIN).
   */
  const fetchPembelian = async () => {
    console.log('⏳ Mengambil data pembelian...');
    try {
      const res = await axios.get(`${API_BASE}/pembelian`);
      if (res.data.success) {
        console.log('✅ Data Pembelian berhasil diambil:', res.data.data);
        setListPembelian(res.data.data);
      } else {
        console.error('❌ Data pembelian tidak sukses:', res.data);
      }
    } catch (err) {
      console.error('❌ Gagal mengambil data pembelian:', err);
    }
  };

  /** Initial load: ambil data sekolah & pembelian saat komponen pertama kali mount */
  useEffect(() => {
    fetchSekolah();
    fetchPembelian();
  }, []);

  /** Debug log: Pantau perubahan pada state listSekolah */
  useEffect(() => {
    console.log('📦 State listSekolah Saat Ini:', listSekolah);
  }, [listSekolah]);

  /** Debug log: Pantau perubahan pada state listPembelian */
  useEffect(() => {
    console.log('📦 State listPembelian Saat Ini:', listPembelian);
  }, [listPembelian]);

  /**
   * Handler submit form sekolah.
   * @param {React.FormEvent} e
   */
  const handleSubmitSekolah = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, sekolah: true }));
    setApiError((prev) => ({ ...prev, sekolah: '' }));

    try {
      await axios.post(`${API_BASE}/sekolah`, { nama_sekolah: namaSekolah, alamat });
      setSubmitStatus((prev) => ({ ...prev, sekolah: true }));
      setNamaSekolah('');
      setAlamat('');
      
      // Force update setelah sukses POST
      fetchSekolah(); 
      fetchPembelian();

      setTimeout(() => {
        setSubmitStatus((prev) => ({ ...prev, sekolah: false }));
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal terhubung ke server. Pastikan backend berjalan.';
      setApiError((prev) => ({ ...prev, sekolah: msg }));
    } finally {
      setLoading((prev) => ({ ...prev, sekolah: false }));
    }
  };

  /**
   * Handler submit form pembelian.
   * @param {React.FormEvent} e
   */
  const handleSubmitPembelian = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, pembelian: true }));
    setApiError((prev) => ({ ...prev, pembelian: '' }));

    try {
      await axios.post(`${API_BASE}/pembelian`, {
        id_sekolah: idSekolah,
        varian_produk: varianProduk,
        tanggal_pembelian: tanggalPembelian,
      });
      setSubmitStatus((prev) => ({ ...prev, pembelian: true }));
      setIdSekolah('');
      setVarianProduk('');
      setTanggalPembelian('');
      
      // Force update setelah sukses POST
      fetchSekolah();
      fetchPembelian();

      setTimeout(() => {
        setSubmitStatus((prev) => ({ ...prev, pembelian: false }));
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal terhubung ke server. Pastikan backend berjalan.';
      setApiError((prev) => ({ ...prev, pembelian: msg }));
    } finally {
      setLoading((prev) => ({ ...prev, pembelian: false }));
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* ── Background Decorative Blobs ── */}
      <div style={styles.blobTopRight} />
      <div style={styles.blobBottomLeft} />

      {/* ── Header ── */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoGroup}>
            <div style={styles.logoIcon}>
              <LayoutDashboard size={28} color="#fff" />
            </div>
            <div>
              <h1 style={styles.headerTitle}>Data Customer</h1>
              <p style={styles.headerSubtitle}>Sistem Pencatatan Sekolah</p>
            </div>
          </div>
          <div style={styles.headerBadge}>
            <div style={styles.statusDot} />
            <span style={styles.statusText}>Online</span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main style={styles.main}>
        {/* ── Stat Cards ── */}
        <div style={styles.statsRow}>
          {[
            { icon: <School size={22} />, label: 'Total Sekolah', value: listSekolah.length || '0', color: '#6366f1' },
            { icon: <ShoppingCart size={22} />, label: 'Total Pembelian', value: listPembelian.length || '0', color: '#06b6d4' },
            { icon: <Package size={22} />, label: 'Varian Produk', value: VARIAN_PRODUK.length, color: '#f59e0b' },
          ].map((stat, idx) => (
            <div key={idx} style={styles.statCard}>
              <div style={{ ...styles.statIconBox, backgroundColor: `${stat.color}20` }}>
                <div style={{ color: stat.color }}>{stat.icon}</div>
              </div>
              <div>
                <p style={styles.statLabel}>{stat.label}</p>
                <p style={styles.statValue}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Form Cards Grid ── */}
        <div style={styles.formGrid}>
          {/* ── Form Sekolah ── */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderIcon}>
                <School size={20} color="#6366f1" />
              </div>
              <div>
                <h2 style={styles.cardTitle}>Form Sekolah</h2>
                <p style={styles.cardDescription}>Tambah data sekolah baru</p>
              </div>
            </div>

            <form onSubmit={handleSubmitSekolah} style={styles.form}>
              {/* Input: Nama Sekolah */}
              <div style={styles.inputGroup}>
                <label htmlFor="namaSekolah" style={styles.label}>
                  Nama Sekolah
                </label>
                <div style={styles.inputWrapper}>
                  <User size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input
                    id="namaSekolah"
                    type="text"
                    placeholder="Masukkan nama sekolah..."
                    value={namaSekolah}
                    onChange={(e) => setNamaSekolah(e.target.value)}
                    required
                    style={styles.input}
                    onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>
              </div>

              {/* Input: Alamat */}
              <div style={styles.inputGroup}>
                <label htmlFor="alamat" style={styles.label}>
                  Alamat
                </label>
                <div style={styles.inputWrapper}>
                  <MapPin size={18} color="#94a3b8" style={{ ...styles.inputIcon, top: '14px' }} />
                  <textarea
                    id="alamat"
                    placeholder="Masukkan alamat lengkap..."
                    rows={3}
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    required
                    style={{ ...styles.input, ...styles.textarea }}
                    onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>
              </div>

              {/* Button Submit */}
              {/* Error message sekolah */}
              {apiError.sekolah && (
                <div style={styles.errorBox}>
                  <span style={styles.errorText}>⚠ {apiError.sekolah}</span>
                </div>
              )}

              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  ...(submitStatus.sekolah ? styles.submitBtnSuccess : {}),
                  ...(loading.sekolah ? styles.submitBtnLoading : {}),
                }}
                disabled={submitStatus.sekolah || loading.sekolah}
              >
                {submitStatus.sekolah ? (
                  <><CheckCircle size={18} /> Data Tersimpan!</>
                ) : loading.sekolah ? (
                  <><span style={styles.spinner} /> Menyimpan...</>
                ) : (
                  <><Plus size={18} /> Tambah Sekolah</>
                )}
              </button>
            </form>
          </div>

          {/* ── Form Pembelian ── */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.cardHeaderIcon, backgroundColor: '#06b6d420' }}>
                <ShoppingCart size={20} color="#06b6d4" />
              </div>
              <div>
                <h2 style={styles.cardTitle}>Form Pembelian</h2>
                <p style={styles.cardDescription}>Catat transaksi pembelian</p>
              </div>
            </div>

            <form onSubmit={handleSubmitPembelian} style={styles.form}>
              {/* Select: Sekolah */}
              <div style={styles.inputGroup}>
                <label htmlFor="idSekolah" style={styles.label}>
                  Pilih Sekolah
                </label>
                <div style={styles.inputWrapper}>
                  <School size={18} color="#94a3b8" style={styles.inputIcon} />
                  <select
                    id="idSekolah"
                    value={idSekolah}
                    onChange={(e) => setIdSekolah(e.target.value)}
                    required
                    style={{ ...styles.input, ...styles.select }}
                    onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  >
                    <option value="" disabled>
                      Pilih sekolah...
                    </option>
                    {listSekolah.map((sek) => (
                      <option key={sek.id || sek.id_sekolah} value={sek.id || sek.id_sekolah}>
                        {sek.nama_sekolah}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} color="#94a3b8" style={styles.selectArrow} />
                </div>
              </div>

              {/* Select: Varian Produk */}
              <div style={styles.inputGroup}>
                <label htmlFor="varianProduk" style={styles.label}>
                  Varian Produk
                </label>
                <div style={styles.inputWrapper}>
                  <Package size={18} color="#94a3b8" style={styles.inputIcon} />
                  <select
                    id="varianProduk"
                    value={varianProduk}
                    onChange={(e) => setVarianProduk(e.target.value)}
                    required
                    style={{ ...styles.input, ...styles.select }}
                    onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  >
                    <option value="" disabled>
                      Pilih varian produk...
                    </option>
                    {VARIAN_PRODUK.map((varian) => (
                      <option key={varian} value={varian}>
                        {varian}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} color="#94a3b8" style={styles.selectArrow} />
                </div>
              </div>

              {/* Input: Tanggal Pembelian */}
              <div style={styles.inputGroup}>
                <label htmlFor="tanggalPembelian" style={styles.label}>
                  Tanggal Pembelian
                </label>
                <div style={styles.inputWrapper}>
                  <Calendar size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input
                    id="tanggalPembelian"
                    type="date"
                    value={tanggalPembelian}
                    onChange={(e) => setTanggalPembelian(e.target.value)}
                    required
                    style={styles.input}
                    onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>
              </div>

              {/* Button Submit */}
              {/* Error message pembelian */}
              {apiError.pembelian && (
                <div style={styles.errorBox}>
                  <span style={styles.errorText}>⚠ {apiError.pembelian}</span>
                </div>
              )}

              <button
                type="submit"
                style={{
                  ...styles.submitBtnCyan,
                  ...(submitStatus.pembelian ? styles.submitBtnSuccess : {}),
                  ...(loading.pembelian ? styles.submitBtnLoading : {}),
                }}
                disabled={submitStatus.pembelian || loading.pembelian}
              >
                {submitStatus.pembelian ? (
                  <><CheckCircle size={18} /> Data Tersimpan!</>
                ) : loading.pembelian ? (
                  <><span style={styles.spinner} /> Menyimpan...</>
                ) : (
                  <><Plus size={18} /> Tambah Pembelian</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Tabel Data ── */}
        <div style={styles.tableSection}>

          {/* Tabel Sekolah */}
          <div style={styles.tableCard}>
            <div style={styles.tableCardHeader}>
              <div style={{ ...styles.cardHeaderIcon, backgroundColor: 'rgba(99,102,241,0.12)' }}>
                <School size={20} color="#6366f1" />
              </div>
              <div>
                <h2 style={styles.cardTitle}>Daftar Sekolah</h2>
                <p style={styles.cardDescription}>{listSekolah.length} sekolah terdaftar</p>
              </div>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>No</th>
                    <th style={styles.th}>Nama Sekolah</th>
                    <th style={styles.th}>Alamat</th>
                  </tr>
                </thead>
                <tbody>
                  {listSekolah.length === 0 ? (
                    <tr><td colSpan={3} style={styles.tdEmpty}>Belum ada data sekolah.</td></tr>
                  ) : (
                    listSekolah.map((sek, idx) => (
                      <tr key={sek.id_sekolah} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                        <td style={styles.tdNum}>{idx + 1}</td>
                        <td style={styles.td}>{sek.nama_sekolah}</td>
                        <td style={styles.td}>{sek.alamat}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Pembelian */}
          <div style={styles.tableCard}>
            <div style={styles.tableCardHeader}>
              <div style={{ ...styles.cardHeaderIcon, backgroundColor: 'rgba(6,182,212,0.12)' }}>
                <ShoppingCart size={20} color="#06b6d4" />
              </div>
              <div>
                <h2 style={styles.cardTitle}>Daftar Pembelian</h2>
                <p style={styles.cardDescription}>{listPembelian.length} transaksi tercatat</p>
              </div>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>No</th>
                    <th style={styles.th}>Sekolah</th>
                    <th style={styles.th}>Varian Produk</th>
                    <th style={styles.th}>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {listPembelian.length === 0 ? (
                    <tr><td colSpan={4} style={styles.tdEmpty}>Belum ada data pembelian.</td></tr>
                  ) : (
                    listPembelian.map((beli, idx) => (
                      <tr key={beli.id_pembelian} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                        <td style={styles.tdNum}>{idx + 1}</td>
                        <td style={styles.td}>{beli.nama_sekolah || '-'}</td>
                        <td style={styles.td}>
                          <span style={styles.varianBadge}>{beli.varian_produk}</span>
                        </td>
                        <td style={styles.td}>
                          {beli.tanggal_pembelian
                            ? new Date(beli.tanggal_pembelian).toLocaleDateString('id-ID', {
                                day: '2-digit', month: 'long', year: 'numeric',
                              })
                            : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <p>© 2026 Data Customer App — Sistem Pencatatan Sekolah</p>
      </footer>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Inline Styles — Premium Glassmorphism Dashboard Design
// ════════════════════════════════════════════════════════════════

const styles = {
  // ── Layout ──
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    color: '#e2e8f0',
    position: 'relative',
    overflow: 'hidden',
  },

  // ── Decorative Blobs ──
  blobTopRight: {
    position: 'fixed',
    top: '-120px',
    right: '-120px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blobBottomLeft: {
    position: 'fixed',
    bottom: '-150px',
    left: '-150px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  // ── Header ──
  header: {
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  headerSubtitle: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
    marginTop: '2px',
  },
  headerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '20px',
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.2)',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)',
  },
  statusText: {
    fontSize: '13px',
    color: '#22c55e',
    fontWeight: '500',
  },

  // ── Main ──
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
  },

  // ── Stats Row ──
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(148, 163, 184, 0.08)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  statIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: 0,
    marginTop: '4px',
  },

  // ── Form Grid ──
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '24px',
  },

  // ── Card ──
  card: {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(148, 163, 184, 0.08)',
    borderRadius: '20px',
    padding: '28px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
  },
  cardHeaderIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#f1f5f9',
    margin: 0,
  },
  cardDescription: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
    marginTop: '2px',
  },

  // ── Form ──
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#cbd5e1',
    marginLeft: '2px',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: '12px',
    border: '1.5px solid #334155',
    background: 'rgba(15, 23, 42, 0.6)',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  textarea: {
    resize: 'vertical',
    minHeight: '80px',
  },
  select: {
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
    paddingRight: '42px',
  },
  selectArrow: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },

  // ── Submit Buttons ──
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '13px 24px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.25)',
    fontFamily: 'inherit',
  },
  submitBtnCyan: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '13px 24px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 15px rgba(6, 182, 212, 0.25)',
    fontFamily: 'inherit',
  },
  submitBtnSuccess: {
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.25)',
    cursor: 'default',
  },
  submitBtnLoading: {
    opacity: 0.75,
    cursor: 'not-allowed',
  },

  // ── Error Box ──
  errorBox: {
    padding: '10px 14px',
    borderRadius: '10px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
  },
  errorText: {
    fontSize: '13px',
    color: '#f87171',
    fontWeight: '500',
  },

  // ── Spinner (CSS animation via borderTop trick) ──
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },

  // ── Table Sections ──
  tableSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginTop: '32px',
  },
  tableCard: {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(148, 163, 184, 0.08)',
    borderRadius: '20px',
    padding: '28px',
    overflow: 'hidden',
  },
  tableCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    padding: '11px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    background: 'rgba(15, 23, 42, 0.4)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '13px 16px',
    color: '#cbd5e1',
    borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
    verticalAlign: 'middle',
    lineHeight: '1.5',
  },
  tdNum: {
    padding: '13px 16px',
    color: '#475569',
    borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
    verticalAlign: 'middle',
    fontSize: '13px',
    fontWeight: '500',
    width: '50px',
  },
  tdEmpty: {
    padding: '48px 16px',
    textAlign: 'center',
    color: '#475569',
    fontSize: '14px',
    fontStyle: 'italic',
  },
  trEven: {
    background: 'transparent',
    transition: 'background 0.15s ease',
  },
  trOdd: {
    background: 'rgba(15, 23, 42, 0.25)',
    transition: 'background 0.15s ease',
  },
  varianBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    background: 'rgba(6, 182, 212, 0.12)',
    color: '#22d3ee',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    whiteSpace: 'nowrap',
  },

  // ── Footer ──
  footer: {
    textAlign: 'center',
    padding: '24px',
    color: '#475569',
    fontSize: '13px',
    borderTop: '1px solid rgba(148, 163, 184, 0.06)',
    marginTop: '40px',
  },
};

export default Dashboard;
