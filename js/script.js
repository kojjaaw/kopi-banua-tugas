
const NOMOR_WA_KEDAI = '6286767676767';

const formatRupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
});

const tombolNav = document.querySelector('.nav-toggle');
const menuNav = document.querySelector('.nav-menu');

function aturMenuNav(buka) {
  menuNav.classList.toggle('terbuka', buka);
  tombolNav.setAttribute('aria-expanded', String(buka));
  tombolNav.setAttribute('aria-label', buka ? 'Tutup menu navigasi' : 'Buka menu navigasi');
}

tombolNav.addEventListener('click', () => {
  const sedangBuka = tombolNav.getAttribute('aria-expanded') === 'true';
  aturMenuNav(!sedangBuka);
});

menuNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    aturMenuNav(false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    aturMenuNav(false);
  }
});


const tombolFilter = document.querySelectorAll('.filter-tombol');
const kartuMenu = document.querySelectorAll('.kartu-menu');

  tombol.addEventListener('click', () => {
    const kategori = tombol.dataset.filter;
    tombolFilter.forEach((t) => t.setAttribute('aria-pressed', String(t === tombol)));
    kartuMenu.forEach((kartu) => {
      const cocok = kategori === 'semua' || kartu.dataset.kategori === kategori;
      kartu.hidden = !cocok;
    });
  });


const formPesan = document.getElementById('form-pesan');
const pilihMenu = document.getElementById('pilih-menu');
const inputJumlah = document.getElementById('jumlah');
const teksTotal = document.getElementById('total-harga');

document.querySelectorAll('.tombol-pesan').forEach((tautan) => {
  tautan.addEventListener('click', () => {
    pilihMenu.value = tautan.dataset.menu;
    hitungTotal();
    hapusError('menu');
  });
});



const barisJam = document.querySelectorAll('[data-hari]');
const teksStatus = document.getElementById('status-buka');

function keMenit(jam) {
  const [j, m] = jam.split(':').map(Number);
  return j * 60 + m;
}

function perbaruiStatusBuka() {
  const sekarang = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
  const hari = sekarang.getDay(); // 0 = Minggu ... 6 = Sabtu
  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();

  let jadwalHariIni = null;

  barisJam.forEach((baris) => {
    const hariBaris = baris.dataset.hari.split(' ').map(Number);
    const hariIni = hariBaris.includes(hari);
    baris.classList.toggle('hari-ini', hariIni);
    if (hariIni) {
      jadwalHariIni = baris;
    }
  });

  if (!jadwalHariIni) {
    return;
  }

  const buka = keMenit(jadwalHariIni.dataset.buka);
  const tutup = keMenit(jadwalHariIni.dataset.tutup);
  const sedangBuka = menitSekarang >= buka && menitSekarang < tutup;

  teksStatus.textContent = sedangBuka
    ? `Buka sekarang sampai ${jadwalHariIni.dataset.tutup} WITA`
    : `Sedang tutup. Buka hari ini pukul ${jadwalHariIni.dataset.buka} WITA`;
}

perbaruiStatusBuka();
setInterval(perbaruiStatusBuka, 60000); // perbarui tiap 1 menit


document.getElementById('promo-tutup').addEventListener('click', () => {
  document.getElementById('promo').hidden = true;
});

const inputCatatan = document.getElementById('catatan');
const hitungCatatan = document.getElementById('hitung-catatan');
const kotakKonfirmasi = document.getElementById('konfirmasi');

function hitungTotal() {
  const harga = Number(pilihMenu.selectedOptions[0].dataset.harga);
  const jumlah = Number(inputJumlah.value);
  const total = jumlah >= 1 && jumlah <= 20 ? harga * jumlah : 0;
  teksTotal.textContent = formatRupiah.format(total);
}

pilihMenu.addEventListener('change', hitungTotal);
inputJumlah.addEventListener('input', hitungTotal);

inputCatatan.addEventListener('input', () => {
  hitungCatatan.textContent = inputCatatan.value.length;
});

// Aturan validasi: kembalikan teks error, atau '' jika valid
const aturanValidasi = {
  nama: (nilai) => (nilai.trim().length >= 3 ? '' : 'Nama minimal 3 huruf.'),
  wa: (nilai) => (/^08[0-9]{8,11}$/.test(nilai.trim())
    ? ''
    : 'Nomor harus diawali 08 dan terdiri dari 10 sampai 13 angka.'),
  menu: (nilai) => (nilai ? '' : 'Silakan pilih salah satu menu.'),
  jumlah: (nilai) => {
    const angka = Number(nilai);
    return Number.isInteger(angka) && angka >= 1 && angka <= 20
      ? ''
      : 'Jumlah harus berupa angka 1 sampai 20.';
  }
};

const kolomForm = {
  nama: document.getElementById('nama'),
  wa: document.getElementById('wa'),
  menu: pilihMenu,
  jumlah: inputJumlah
};

function tampilkanError(nama, pesan) {
  const kolom = kolomForm[nama];
  document.getElementById(`error-${kolom.id === 'pilih-menu' ? 'menu' : kolom.id}`).textContent = pesan;
  kolom.setAttribute('aria-invalid', pesan ? 'true' : 'false');
}

function hapusError(nama) {
  tampilkanError(nama, '');
}

function validasiKolom(nama) {
  const pesan = aturanValidasi[nama](kolomForm[nama].value);
  tampilkanError(nama, pesan);
  return pesan === '';
}

Object.keys(kolomForm).forEach((nama) => {
  kolomForm[nama].addEventListener('blur', () => validasiKolom(nama));
});

formPesan.addEventListener('submit', (event) => {
  event.preventDefault();

  let kolomSalahPertama = null;
  Object.keys(kolomForm).forEach((nama) => {
    if (!validasiKolom(nama) && !kolomSalahPertama) {
      kolomSalahPertama = kolomForm[nama];
    }
  });

  if (kolomSalahPertama) {
    kolomSalahPertama.focus();
    return;
  }

  const namaMenu = pilihMenu.selectedOptions[0].textContent.split(' - Rp')[0];
  const jumlah = Number(inputJumlah.value);
  const total = pilihMenu.selectedOptions[0].dataset.harga * jumlah;
  const catatan = inputCatatan.value.trim();

  const ringkasan = `${jumlah} x ${namaMenu}, total ${formatRupiah.format(total)}.`;
  document.getElementById('konfirmasi-teks').textContent =
    `Terima kasih, ${kolomForm.nama.value.trim()}! Pesananmu: ${ringkasan}`;

  const pesanWa = [
    'Halo Kopi Banua, saya mau pesan:',
    `Nama: ${kolomForm.nama.value.trim()}`,
    `No. WhatsApp: ${kolomForm.wa.value.trim()}`,
    `Pesanan: ${jumlah} x ${namaMenu}`,
    `Total: ${formatRupiah.format(total)}`,
    catatan ? `Catatan: ${catatan}` : ''
  ].filter(Boolean).join('\n');

  document.getElementById('tautan-wa').href =
    `https://wa.me/${NOMOR_WA_KEDAI}?text=${encodeURIComponent(pesanWa)}`;

  kotakKonfirmasi.hidden = false;
  kotakKonfirmasi.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  formPesan.reset();
  hitungCatatan.textContent = '0';
  hitungTotal();
});

hitungTotal();
