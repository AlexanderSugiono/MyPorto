/* =========================================================
   script.js — Portofolio Achmad Saifudin
   1. Render kartu proyek dinamis (data-driven dari array PROJECTS)
   2. Filter kategori proyek
   3. Animasi scroll-reveal
   4. Tombol salin email
   5. Tombol Download CV
   ========================================================= */

(function () {
  'use strict';

  /* =======================================================
     DATA PROYEK (array of objects)
     -------------------------------------------------------
     CARA MENAMBAH PROYEK BARU:
     Cukup duplikat satu object di bawah lalu ubah isinya,
     tanpa perlu menyentuh HTML sama sekali.

     Field:
       id          : slug unik (opsional)
       title       : judul proyek
       badge       : label kecil di pojok atas gambar
       categories  : array token filter -> 'fullstack' | 'webapp' | 'ecommerce'
       accent      : 'primary' (cyan) | 'secondary' (hijau) | 'tertiary' (ungu)
       image       : path gambar lokal, misal 'assets/projects/nama-file.jpg'
       alt         : teks alternatif gambar
       description : deskripsi singkat
       tech        : array daftar teknologi
       links       : array tombol aksi { label, url, icon }
                     icon: 'arrow_outward' (live preview) | 'code' (github)
     ======================================================= */

  // NOTE: url '#' di bawah hanyalah placeholder — GANTI dengan link asli proyekmu.
  // NOTE: gambar memakai path lokal placeholder 'assets/projects/*.jpg'.
  //       Jika file belum ada, otomatis ditampilkan placeholder gelap (tidak rusak).
  const PROJECTS = [
    {
      id: 'literra',
      title: 'Literra — Online Bookstore Platform',
      badge: 'E-Commerce • Full-Stack',
      categories: ['ecommerce', 'fullstack'],
      accent: 'primary',
      image: 'assets/projects/LITDAS.png',
      alt: 'Literra - platform toko buku online',
      description:
        'Aplikasi toko buku online komprehensif dengan sistem multi-role (Superadmin, Penjual/Penerbit, Pembaca). Dilengkapi katalog interaktif, analitik penjualan real-time, keranjang belanja, dan integrasi payment gateway.',
      tech: ['Laravel', 'MySQL', 'Alpine.js', 'Tailwind CSS', 'Midtrans'],
      links: [{ label: 'Live Preview', url: 'https://literra.rpl.best/', icon: 'arrow_outward' }]
    },
    {
      id: 'Kosmo',
      title: 'Kosmo — Smart Boarding House Management',
      badge: 'SaaS • Dashboard',
      categories: ['webapp', 'fullstack'],
      accent: 'secondary',
      image: 'assets/projects/KOSMOJIR.png',
      alt: 'FinAnalytics - dashboard fintech SaaS',
      description:
        'Sistem manajemen kos-kosan modern berbasis multi-role (Owner & Tenant) dengan fitur kelola properti, otomatisasi tagihan bulanan, verifikasi bukti pembayaran, dan tiket laporan perbaikan secara real-time..',
      tech: ['Vue 3', 'Chart.js', 'REST API', 'Tailwind', 'PostgreSQL'],
      links: [{ label: 'GitHub Repo', url: '#', icon: 'code' }]
    },
    {
      id: 'splitbill',
      title: 'SplitBill — Group Expense Splitting App',
      badge: 'AI Tool • Web App',
      categories: ['webapp'],
      accent: 'tertiary',
      image: 'assets/projects/Split.png',
      alt: 'AuraFlow - orkestrator workflow AI',
      description:
        'Aplikasi split bill tanpa login berbasis link unik per grup, dengan algoritma debt simplification untuk menyederhanakan pembayaran antar anggota jadi transaksi paling minimal..',
      tech: ['React', 'Next.js', 'Node.js', 'WebGL Nodes', 'Tailwind'],
      links: [{ label: 'GitHub Repo', url: '#', icon: 'code' }]
    }
  ];

  /* =======================================================
     PETA WARNA AKSEN (Tailwind class di-inject via JS,
     otomatis dikenali oleh Tailwind Play CDN via DOM observer)
     ======================================================= */
  const ACCENTS = {
    primary: {
      cardHover: 'hover:border-primary-container hover:shadow-[0_12px_40px_rgba(0,242,254,0.2)]',
      titleHover: 'group-hover:text-primary-container',
      badge: 'text-primary-container',
      tag: 'border-primary-container/20 text-primary-fixed',
      btn: 'bg-primary-container/10 border border-primary-container/30 text-primary-container hover:bg-primary-container hover:text-on-primary-container'
    },
    secondary: {
      cardHover: 'hover:border-secondary hover:shadow-[0_12px_40px_rgba(78,222,163,0.2)]',
      titleHover: 'group-hover:text-secondary',
      badge: 'text-secondary',
      tag: 'border-secondary/20 text-secondary',
      btn: 'bg-secondary/10 border border-secondary/30 text-secondary hover:bg-secondary hover:text-on-secondary'
    },
    tertiary: {
      cardHover: 'hover:border-tertiary-fixed-dim hover:shadow-[0_12px_40px_rgba(208,188,255,0.2)]',
      titleHover: 'group-hover:text-tertiary-fixed-dim',
      badge: 'text-tertiary-fixed-dim',
      tag: 'border-tertiary-fixed-dim/20 text-tertiary-fixed-dim',
      btn: 'bg-tertiary-container/10 border border-tertiary-fixed-dim/30 text-tertiary-fixed-dim hover:bg-tertiary-fixed-dim hover:text-on-tertiary-container'
    }
  };

  /* Placeholder gambar SVG (ditampilkan bila file gambar belum ada) */
  function svgPlaceholder(fileName) {
    const label = fileName || 'project.jpg';
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#161b2a"/><stop offset="1" stop-color="#0e1321"/>' +
      '</linearGradient></defs>' +
      '<rect width="800" height="450" fill="url(#g)"/>' +
      '<g fill="none" stroke="#00f2fe" stroke-opacity="0.25">' +
      '<rect x="330" y="140" width="140" height="140" rx="20"/>' +
      '<circle cx="400" cy="210" r="90"/>' +
      '</g>' +
      '<text x="400" y="330" text-anchor="middle" font-family="monospace" font-size="22" fill="#6ff6ff" fill-opacity="0.85">' +
      label +
      '</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function renderProjects() {
    const grid = document.getElementById('projectGrid');
    if (!grid) return;

    const html = PROJECTS.map(function (p) {
      const a = ACCENTS[p.accent] || ACCENTS.primary;
      const techTags = p.tech
        .map(function (t) {
          return (
            '<span class="px-space-xs py-0.5 rounded bg-surface-container-high/80 border ' +
            a.tag +
            ' font-code-sm text-[11px]">' +
            t +
            '</span>'
          );
        })
        .join('');

      const actionBtns = p.links
        .map(function (l) {
          return (
            '<a class="flex-1 py-space-xs px-space-sm rounded ' +
            a.btn +
            ' font-code-sm text-code-sm font-semibold transition-all flex items-center justify-center gap-1" ' +
            'href="' +
            l.url +
            '" target="_blank" rel="noreferrer">' +
            '<span>' +
            l.label +
            '</span>' +
            '<span class="material-symbols-outlined text-[14px]">' +
            l.icon +
            '</span>' +
            '</a>'
          );
        })
        .join('');

      return (
        '<div class="project-card group relative rounded-xl bg-surface-container-low/80 backdrop-blur-xl border border-outline-variant/40 overflow-hidden flex flex-col ' +
        a.cardHover +
        ' transition-all duration-500 transform hover:-translate-y-2 reveal-init" data-categories="' +
        p.categories.join(' ') +
        '">' +
        '  <div class="relative w-full h-56 overflow-hidden bg-surface-container-highest">' +
        '    <img alt="' +
        p.alt +
        '" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:brightness-90" src="' +
        p.image +
        '" data-fallback="' +
        svgPlaceholder(p.image.split('/').pop()) +
        '"/>' +
        '    <div class="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-80"></div>' +
        '    <div class="absolute top-3 left-3 px-space-xs py-space-xxs rounded bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/30 font-code-sm text-code-sm ' +
        a.badge +
        '">' +
        p.badge +
        '</div>' +
        '  </div>' +
        '  <div class="p-space-lg flex-1 flex flex-col justify-between">' +
        '    <div>' +
        '      <h3 class="font-headline-sm text-headline-sm font-bold text-on-surface ' +
        a.titleHover +
        ' transition-colors mb-space-xs">' +
        p.title +
        '</h3>' +
        '      <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 leading-relaxed mb-space-md">' +
        p.description +
        '</p>' +
        '    </div>' +
        '    <div>' +
        '      <div class="flex flex-wrap gap-space-xs mb-space-md">' +
        techTags +
        '      </div>' +
        '      <div class="flex items-center gap-space-sm pt-space-sm border-t border-outline-variant/20">' +
        actionBtns +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>'
      );
    }).join('');

    grid.innerHTML = html;

    /* Fallback bila gambar belum tersedia */
    grid.querySelectorAll('img[data-fallback]').forEach(function (img) {
      img.addEventListener('error', function () {
        if (img.src !== img.dataset.fallback) {
          img.src = img.dataset.fallback;
        }
      });
    });
  }

  /* ---------- Filter Proyek ---------- */
  const BASE_BTN = 'project-filter-btn px-space-md py-space-xxs rounded font-code-sm text-code-sm transition-all';
  const INACTIVE_BTN = 'text-on-surface-variant hover:text-on-surface';
  const ACTIVE_BTN = 'font-semibold bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,242,254,0.3)]';

  function initFilter() {
    const btns = Array.prototype.slice.call(document.querySelectorAll('.project-filter-btn'));
    if (!btns.length) return;

    const LABELS = { all: 'Semua', fullstack: 'Full-Stack', webapp: 'Web App', ecommerce: 'E-Commerce' };

    /* Hitung jumlah proyek per kategori lalu tempel ke label tombol */
    const counts = { all: PROJECTS.length };
    ['fullstack', 'webapp', 'ecommerce'].forEach(function (token) {
      counts[token] = PROJECTS.filter(function (p) {
        return p.categories.indexOf(token) !== -1;
      }).length;
    });
    btns.forEach(function (btn) {
      const f = btn.getAttribute('data-filter');
      btn.textContent = (LABELS[f] || f) + ' (' + counts[f] + ')';
    });

    function applyFilter(target) {
      btns.forEach(function (b) {
        b.className = BASE_BTN + ' ' + INACTIVE_BTN;
      });
      target.className = BASE_BTN + ' ' + ACTIVE_BTN;

      const f = target.getAttribute('data-filter');
      Array.prototype.slice.call(document.querySelectorAll('.project-card')).forEach(function (card) {
        const cats = (card.getAttribute('data-categories') || '').split(' ').filter(Boolean);
        card.style.display = f === 'all' || cats.indexOf(f) !== -1 ? 'flex' : 'none';
      });
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyFilter(btn);
      });
    });

    /* Aktifkan filter "Semua" di awal */
    const allBtn = btns.find(function (b) {
      return b.getAttribute('data-filter') === 'all';
    });
    if (allBtn) applyFilter(allBtn);
  }

  /* =======================================================
     SCROLL REVEAL (IntersectionObserver)
     ======================================================= */
  function initReveal() {
    const reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal-init'));

    reveals.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition =
        'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* =======================================================
     SALIN EMAIL (1 klik) — baca langsung dari teks di HTML
     agar tidak perlu diubah dua kali
     ======================================================= */
  function initCopyEmail() {
    const copyBtn = document.getElementById('copyEmailBtn');
    const emailEl = document.getElementById('emailText');
    const copyLabel = document.getElementById('copyBtnLabel');
    if (!copyBtn || !emailEl) return;

    copyBtn.addEventListener('click', function () {
      const email = emailEl.textContent.trim();
      navigator.clipboard
        .writeText(email)
        .then(function () {
          if (copyLabel) copyLabel.textContent = 'Tersalin!';
          copyBtn.classList.add('bg-secondary', 'text-on-secondary');
          setTimeout(function () {
            if (copyLabel) copyLabel.textContent = 'Salin';
            copyBtn.classList.remove('bg-secondary', 'text-on-secondary');
          }, 2000);
        })
        .catch(function () {
          if (copyLabel) copyLabel.textContent = 'Gagal!';
        });
    });
  }

  /* =======================================================
     TOMBOL DOWNLOAD CV
     - Jika href masih '#' (placeholder): jalankan animasi simulasi.
     - Jika href sudah diisi path file (mis. cv-achmad-saifudin.pdf):
       browser akan mengunduh file secara normal.
     ======================================================= */
  function initCvButton() {
    const cvBtn = document.getElementById('downloadCvBtn');
    if (!cvBtn) return;

    cvBtn.addEventListener('click', function (e) {
      const href = cvBtn.getAttribute('href');
      if (href && href !== '#') return; // biarkan aksi default (download file)

      e.preventDefault();
      const originalText = cvBtn.innerHTML;
      cvBtn.innerHTML =
        '<span class="material-symbols-outlined animate-spin text-[20px]">sync</span><span>Mengunduh...</span>';
      setTimeout(function () {
        cvBtn.innerHTML =
          '<span class="material-symbols-outlined text-[20px]">task_alt</span><span>CV Siap Diakses!</span>';
        setTimeout(function () {
          cvBtn.innerHTML = originalText;
        }, 2500);
      }, 800);
    });
  }

  /* =======================================================
     INIT
     ======================================================= */
  document.addEventListener('DOMContentLoaded', function () {
    renderProjects(); // render kartu proyek dulu, baru reveal agar kartu ikut ter-animasi
    initFilter();
    initReveal();
    initCopyEmail();
    initCvButton();
  });
})();