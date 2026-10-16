(function () {
      var el = document.getElementById('splash-screen');
      if (!el) return;
      // Tampil sekali per sesi (buka ulang aplikasi = muncul lagi, refresh halaman = langsung masuk)
      try {
        if (sessionStorage.getItem('flipbuku_splash_shown')) { el.parentNode.removeChild(el); return; }
        sessionStorage.setItem('flipbuku_splash_shown', '1');
      } catch (e) {}
      var start = Date.now(), done = false, MIN_SHOW = 1600;
      function hide() {
        if (done) return; done = true;
        var wait = Math.max(0, MIN_SHOW - (Date.now() - start));
        setTimeout(function () {
          el.classList.add('splash-hide');
          setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 650);
        }, wait);
      }
      if (document.readyState === 'complete') hide();
      else window.addEventListener('load', hide);
      setTimeout(hide, 6000); // pengaman: jangan tertahan lebih dari 6 detik
    })();

(function () {
      // Hash SHA-256 dari passcode (bukan teks asli). Untuk ganti passcode, lihat petunjuk di bawah.
      var EXPECTED = 'cd717ca55dcc11e4196f234d1de5b32f6689f8f3734c27bbd13b24ac473a74a7';
      var KEY = 'flipbuku_gate_ok', UNTIL = 'flipbuku_gate_until';
      var MAX_TRY = 5, LOCK_MS = 30000;

      var gate = document.getElementById('gate-screen');
      var card = document.getElementById('gate-card');
      var form = document.getElementById('gate-form');
      var input = document.getElementById('gate-input');
      var err = document.getElementById('gate-error');
      var btn = document.getElementById('gate-btn');
      var eye = document.getElementById('gate-eye');
      var remember = document.getElementById('gate-remember');
      var tries = 0, timer = null, locking = false;

      /* SHA-256 (JS murni, jalan di http maupun https) */
      function sha256(ascii) {
        function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
        var mathPow = Math.pow, maxWord = mathPow(2, 32), lengthProperty = 'length';
        var i, j, result = '', words = [], asciiBitLength = ascii[lengthProperty] * 8;
        var hash = [], k = [], primeCounter = 0, isComposite = {};
        for (var candidate = 2; primeCounter < 64; candidate++) {
          if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
            hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
          }
        }
        ascii += '\x80';
        while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
        for (i = 0; i < ascii[lengthProperty]; i++) {
          j = ascii.charCodeAt(i);
          if (j >> 8) return '';
          words[i >> 2] |= j << ((3 - i) % 4) * 8;
        }
        words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
        words[words[lengthProperty]] = (asciiBitLength);
        for (j = 0; j < words[lengthProperty];) {
          var w = words.slice(j, j += 16), oldHash = hash;
          hash = hash.slice(0, 8);
          for (i = 0; i < 64; i++) {
            var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
            var temp1 = hash[7] + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] +
              (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0);
            var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
            hash = [(temp1 + temp2) | 0].concat(hash);
            hash[4] = (hash[4] + temp1) | 0;
          }
          for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
        }
        for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (hash[i] >> (j * 8)) & 255; result += ((b < 16) ? 0 : '') + b.toString(16); }
        return result;
      }

      function hashOf(v) {
        return sha256('flipbuku|' + unescape(encodeURIComponent(String(v).trim().toLowerCase())));
      }
      function isAuthed() {
        try { return localStorage.getItem(KEY) === EXPECTED || sessionStorage.getItem(KEY) === EXPECTED; }
        catch (e) { return false; }
      }
      function saveAuth(persist) {
        try {
          localStorage.removeItem(KEY); sessionStorage.removeItem(KEY);
          (persist ? localStorage : sessionStorage).setItem(KEY, EXPECTED);
        } catch (e) {}
      }
      function clearAuth() {
        try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch (e) {}
      }
      function setLocked(on) { document.body.classList.toggle('app-locked', on); }
      function showError(msg) { err.textContent = msg || ''; }
      function shake() {
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      }
      function remainingLock() {
        try { return Math.max(0, (+localStorage.getItem(UNTIL) || 0) - Date.now()); } catch (e) { return 0; }
      }
      function tickLock() {
        var ms = remainingLock();
        if (ms > 0) {
          locking = true;
          input.disabled = true; btn.disabled = true;
          showError('Terlalu banyak percobaan. Coba lagi dalam ' + Math.ceil(ms / 1000) + ' detik.');
          timer = setTimeout(tickLock, 500);
        } else {
          if (timer) { clearTimeout(timer); timer = null; }
          input.disabled = false; btn.disabled = false;
          if (locking) { locking = false; showError(''); }
          try { localStorage.removeItem(UNTIL); } catch (e) {}
          tries = 0;
        }
      }
      function focusInput() {
        // Fokus otomatis hanya di laptop/desktop (di HP supaya keyboard tidak langsung menutupi layar)
        if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) {} }, 300);
        }
      }

      eye.addEventListener('click', function () {
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        eye.setAttribute('aria-label', show ? 'Sembunyikan passcode' : 'Tampilkan passcode');
        eye.innerHTML = '<i class="fa-solid ' + (show ? 'fa-eye-slash' : 'fa-eye') + '"></i>';
        input.focus();
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (remainingLock() > 0) { tickLock(); return; }
        var v = input.value;
        if (!v.trim()) { showError('Masukkan passcode terlebih dahulu.'); shake(); input.focus(); return; }
        if (hashOf(v) === EXPECTED) {
          saveAuth(remember.checked);
          tries = 0; showError('');
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Berhasil';
          setLocked(false);
          gate.classList.add('gate-fade');
          setTimeout(function () {
            gate.classList.add('gate-off');
            input.value = ''; btn.innerHTML = 'Masuk <i class="fa-solid fa-arrow-right" style="margin-left:6px;"></i>';
            window.dispatchEvent(new Event('resize'));
          }, 450);
        } else {
          tries++;
          shake();
          if (tries >= MAX_TRY) {
            try { localStorage.setItem(UNTIL, String(Date.now() + LOCK_MS)); } catch (e) {}
            tickLock();
          } else {
            showError('Passcode salah. Sisa percobaan: ' + (MAX_TRY - tries) + '.');
          }
          input.select();
        }
      });

      // Kunci kembali aplikasi (tombol gembok di navbar)
      window.lockApp = function () {
        clearAuth();
        input.value = ''; input.type = 'password';
        eye.innerHTML = '<i class="fa-solid fa-eye"></i>';
        showError('');
        gate.classList.remove('gate-off', 'gate-fade');
        setLocked(true);
        if (remainingLock() > 0) tickLock();
        focusInput();
      };

      // Keadaan awal
      if (isAuthed()) {
        gate.classList.add('gate-off');
      } else {
        setLocked(true);
        if (remainingLock() > 0) tickLock();
        focusInput();
      }
    })();

(function () {
      var nav = document.querySelector('body > nav');
      if (!nav) return;
      var raf = 0;
      function overflows() { return nav.scrollWidth > nav.clientWidth + 1; }
      function fit() {
        nav.classList.remove('nav-compact', 'nav-tight');
        if (!overflows()) return;
        nav.classList.add('nav-compact');          // 1) tombol Al-Quran / Cloudzone / Install jadi ikon saja
        if (!overflows()) return;
        nav.classList.add('nav-tight');            // 2) layar sangat sempit: teks logo juga disembunyikan
      }
      function schedule() { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); }

      if (window.ResizeObserver) {
        var ro = new ResizeObserver(schedule);
        ro.observe(nav);
        if (nav.lastElementChild) ro.observe(nav.lastElementChild);   // ikut berubah saat teks/tombol berubah
      }
      window.addEventListener('resize', schedule);
      window.addEventListener('orientationchange', schedule);
      window.addEventListener('load', schedule);
      document.addEventListener('DOMContentLoaded', schedule);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
      schedule();
    })();

const SUPABASE_URL = 'https://pamvpcmkrdgdbyskwzcf.supabase.co'; // contoh: https://abcdxyz.supabase.co
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhbXZwY21rcmRnZGJ5c2t3emNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MzEyNTksImV4cCI6MjEwNzEwNzI1OX0.x1yL91WU7UBzbcJH79dEW_xC1EkfCZwYQ-Ofx-do8Oo';

    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let catalogData = [];
    let pageFlipInstance = null;
    let pdfDocInstance = null;
    let currentBook = null;
    let currentZoom = 1;
    let currentUser = null;
    let stateRestored = false;   // posisi halaman (dari URL #) sudah dipulihkan?
    let pendingAdmin = false;    // menunggu sesi login untuk memulihkan tampilan Cloudzone
    let resizeTimer = null;
    let currentPageIndex = 1;
    let adminDrag = null;
    let isSavingOrder = false;
    let sortOrderAvailable = true;

    const pdfCache = new Map();

    // ===== Pemuatan library sesuai kebutuhan =====
    const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const PAGEFLIP_URL = 'https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js';
    const scriptPromises = {};

    function loadScriptOnce(src) {
      if (!scriptPromises[src]) {
        scriptPromises[src] = new Promise((resolve, reject) => {
          const el = document.createElement('script');
          el.src = src;
          el.async = true;
          el.onload = resolve;
          el.onerror = () => { delete scriptPromises[src]; reject(new Error('Gagal memuat library: ' + src)); };
          document.head.appendChild(el);
        });
      }
      return scriptPromises[src];
    }

    async function ensurePdfJs() {
      if (!window.pdfjsLib) await loadScriptOnce(PDFJS_URL);
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
    }

    async function ensurePageFlip() {
      if (!window.St || !window.St.PageFlip) await loadScriptOnce(PAGEFLIP_URL);
    }

    // ===== Cache katalog & sampul (tampil instan pada kunjungan berikutnya) =====
    const CATALOG_CACHE_KEY = 'flipbuku_catalog_cache_v1';
    const COVER_CACHE_PREFIX = 'flipbuku_cover_v1:';
    const COVER_CONCURRENCY = 3;
    let lastCatalogSerialized = '';
    let coverObserver = null;
    const coverQueue = [];
    const coverInFlight = new Set();
    let coverActive = 0;

    function hashString(str) {
      let h = 5381;
      for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
      return (h >>> 0).toString(36);
    }

    function coverCacheKey(book) {
      return COVER_CACHE_PREFIX + book.id + ':' + hashString(book.pdf_url || '');
    }

    // ===== Cache sampul di IndexedDB (async, menyimpan Blob, kuota jauh lebih besar dari localStorage) =====
    const COVER_DB_NAME = 'flipbuku_covers';
    const COVER_STORE = 'covers';
    const coverUrlCache = new Map();   // key -> object URL (dipakai ulang antar render grid)
    let coverDbPromise = null;

    function idbRequest(req) {
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }

    // Sampul lama di localStorage dipindahkan sekali (tanpa generate ulang) lalu dihapus dari localStorage
    async function migrateLegacyCovers(db) {
      try {
        const legacyKeys = Object.keys(localStorage).filter(k => k.startsWith(COVER_CACHE_PREFIX));
        if (legacyKeys.length === 0) return;
        const entries = [];
        for (const key of legacyKeys) {
          try {
            const blob = await (await fetch(localStorage.getItem(key))).blob();
            entries.push([key, blob]);
          } catch (e) {}
        }
        if (entries.length) {
          const tx = db.transaction(COVER_STORE, 'readwrite');
          entries.forEach(([key, blob]) => tx.objectStore(COVER_STORE).put(blob, key));
          await new Promise(resolve => { tx.oncomplete = resolve; tx.onerror = resolve; tx.onabort = resolve; });
        }
        legacyKeys.forEach(k => localStorage.removeItem(k));
      } catch (e) {}
    }

    function openCoverDb() {
      if (!coverDbPromise) {
        coverDbPromise = new Promise(resolve => {
          if (!('indexedDB' in window)) return resolve(null);
          try {
            const req = indexedDB.open(COVER_DB_NAME, 1);
            req.onupgradeneeded = () => req.result.createObjectStore(COVER_STORE);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
            req.onblocked = () => resolve(null);
          } catch (e) { resolve(null); }
        }).then(async db => {
          if (db) await migrateLegacyCovers(db);
          return db;
        });
      }
      return coverDbPromise;
    }

    // Mengembalikan object URL sampul dari cache, atau null bila belum ada
    async function readCoverCache(book) {
      const key = coverCacheKey(book);
      if (coverUrlCache.has(key)) return coverUrlCache.get(key);
      try {
        const db = await openCoverDb();
        if (!db) return null;
        const blob = await idbRequest(db.transaction(COVER_STORE).objectStore(COVER_STORE).get(key));
        if (!blob) return null;
        const url = URL.createObjectURL(blob);
        coverUrlCache.set(key, url);
        return url;
      } catch (e) { return null; }
    }

    // Simpan Blob ke IndexedDB dan kembalikan object URL-nya (tetap berfungsi walau penyimpanan gagal)
    async function writeCoverCache(book, blob) {
      const key = coverCacheKey(book);
      const url = URL.createObjectURL(blob);
      const old = coverUrlCache.get(key);
      coverUrlCache.set(key, url);
      if (old) URL.revokeObjectURL(old);
      try {
        const db = await openCoverDb();
        if (db) await idbRequest(db.transaction(COVER_STORE, 'readwrite').objectStore(COVER_STORE).put(blob, key));
      } catch (e) {}
      return url;
    }

    // Buang sampul buku yang sudah dihapus / PDF-nya diganti
    async function pruneCoverCache(books) {
      try {
        const db = await openCoverDb();
        if (!db) return;
        const valid = new Set(books.map(coverCacheKey));
        const store = db.transaction(COVER_STORE, 'readwrite').objectStore(COVER_STORE);
        const keys = await idbRequest(store.getAllKeys());
        keys.forEach(k => {
          if (valid.has(k)) return;
          store.delete(k);
          const url = coverUrlCache.get(k);
          if (url) { URL.revokeObjectURL(url); coverUrlCache.delete(k); }
        });
      } catch (e) {}
    }

    const BOOK_ORDER_STORAGE_KEY = 'flipbuku_book_order';

    supabaseClient.auth.onAuthStateChange((event, session) => {
      currentUser = session?.user || null;
      updateAdminNavUI();
      if (pendingAdmin) {
        pendingAdmin = false;
        if (currentUser) restoreAdminView(); else syncHash();
      }
    });

    document.addEventListener("DOMContentLoaded", () => {
      renderCatalogFromCache();
      restoreFromHash(false);   // pulihkan posisi (baca buku / Al-Quran / Cloudzone) dari alamat halaman
      loadCatalogFromSupabase().catch(() => {}).then(() => restoreFromHash(true));

      // Siapkan PDF.js & PageFlip saat browser idle agar klik buku pertama tidak menunggu unduhan library
      const connection = navigator.connection || {};
      if (!connection.saveData) {
        const preload = () => { ensurePdfJs().catch(() => {}); ensurePageFlip().catch(() => {}); };
        if ('requestIdleCallback' in window) requestIdleCallback(preload, { timeout: 4000 });
        else setTimeout(preload, 2500);
      }

      const sidebarEl = document.getElementById('thumbnail-sidebar');
      if (sidebarEl) {
        ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click'].forEach(evt => {
          sidebarEl.addEventListener(evt, (e) => e.stopPropagation());
        });
      }

      const thumbContainer = document.getElementById('thumbnail-container');
      if (thumbContainer) {
        thumbContainer.addEventListener('click', (e) => {
          e.stopPropagation();
          const item = e.target.closest('.thumb-item');
          if (item && item.getAttribute('data-page')) {
            const targetPage = parseInt(item.getAttribute('data-page'), 10);
            jumpToPage(targetPage);
            
            if (window.innerWidth <= 768 || window.innerHeight <= 500) {
              closeMobileSidebar();
            }
          }
        });
      }

      const bottomNavEl = document.querySelector('#view-reader > div:last-child');
      if (bottomNavEl) {
        ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click'].forEach(evt => {
          bottomNavEl.addEventListener(evt, (e) => e.stopPropagation());
        });
      }

      window.addEventListener('resize', handleResizeOrOrientation);
      window.addEventListener('orientationchange', () => {
        setTimeout(handleResizeOrOrientation, 300);
      });
      document.addEventListener('fullscreenchange', () => {
        updateFullscreenButton();
        if (document.getElementById('view-reader').classList.contains('flex')) {
          handleResizeOrOrientation();
        }
      });
      setupAdminRowSorting();

      setupReaderPanning();
      setupKeyboardNavigation();
    });

    // Navigasi keyboard (laptop/desktop): panah kiri/kanan membuka halaman di sisi tersebut,
    // mengikuti arah baca buku. LTR: kanan = maju, kiri = mundur. RTL: kiri = maju, kanan = mundur.
    function setupKeyboardNavigation() {
      let lastKeyFlip = 0;
      document.addEventListener('keydown', (event) => {
        if (document.body.classList.contains('app-locked')) return;   // halaman login masih aktif
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;

        const reader = document.getElementById('view-reader');
        if (!reader || !reader.classList.contains('flex') || !pageFlipInstance) return;

        // Jangan ganggu pengetikan (mis. kolom nomor halaman) atau dialog login
        const target = event.target;
        if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
        if (typeof isQuranOpen === 'function' && isQuranOpen()) return;
        if (!document.getElementById('login-modal').classList.contains('hidden')) return;

        // Saat di-zoom, panah dibiarkan untuk menggeser tampilan (sama seperti swipe yang nonaktif saat zoom)
        if (currentZoom > 1) return;

        event.preventDefault();
        const now = performance.now();
        if (now - lastKeyFlip < 250) return;   // cegah flip bertumpuk saat tombol ditahan
        lastKeyFlip = now;

        const isRtl = currentBook?.reading_direction === 'rtl';
        const goForward = isRtl ? event.key === 'ArrowLeft' : event.key === 'ArrowRight';
        goForward ? flipNextPage() : flipPreviousPage();
      });
    }

    function setupReaderPanning() {
      const viewport = document.getElementById('reader-viewport');
      if (!viewport) return;

      const activePointers = new Map();
      let dragStartX = 0;
      let dragStartY = 0;
      let scrollStartLeft = 0;
      let scrollStartTop = 0;
      let pinchStartDistance = 0;
      let pinchOccurred = false;

      const getPointerDistance = () => {
        const [first, second] = [...activePointers.values()];
        return Math.hypot(second.x - first.x, second.y - first.y);
      };

      viewport.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'touch') {
          activePointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
            startX: event.clientX,
            startY: event.clientY
          });
          viewport.setPointerCapture(event.pointerId);

          if (activePointers.size === 2) {
            pinchOccurred = true;
            viewport.classList.remove('is-dragging');
            pinchStartDistance = getPointerDistance();
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          if (activePointers.size > 1) return;
        }

        if (currentZoom <= 1) return;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        scrollStartLeft = viewport.scrollLeft;
        scrollStartTop = viewport.scrollTop;
        viewport.classList.add('is-dragging');
        if (event.pointerType !== 'touch') viewport.setPointerCapture(event.pointerId);
      });

      viewport.addEventListener('pointermove', (event) => {
        if (event.pointerType === 'touch' && activePointers.has(event.pointerId)) {
          const pointer = activePointers.get(event.pointerId);
          pointer.x = event.clientX;
          pointer.y = event.clientY;
          if (activePointers.size >= 2) {
            const nextDistance = getPointerDistance();
            if (pinchStartDistance > 0 && nextDistance > 0) {
              requestZoomBy(nextDistance / pinchStartDistance);
            }
            pinchStartDistance = nextDistance;
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }

        if (!viewport.classList.contains('is-dragging')) return;
        viewport.scrollLeft = scrollStartLeft - (event.clientX - dragStartX);
        viewport.scrollTop = scrollStartTop - (event.clientY - dragStartY);
      });

      const stopDragging = (event) => {
        const pointer = activePointers.get(event?.pointerId);
        if (event?.type === 'pointerup' && event.pointerType === 'touch' && activePointers.size === 1 && !pinchOccurred && currentZoom <= 1 && pointer) {
          const deltaX = event.clientX - pointer.startX;
          const deltaY = event.clientY - pointer.startY;
          if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
            const swipeForward = currentBook?.reading_direction === 'rtl' ? deltaX > 0 : deltaX < 0;
            swipeForward ? flipNextPage() : flipPreviousPage();
          }
        }

        if (event?.pointerId !== undefined) activePointers.delete(event.pointerId);
        if (activePointers.size < 2) pinchStartDistance = 0;
        viewport.classList.remove('is-dragging');

        if (event?.type === 'pointerup' && activePointers.size === 1 && currentZoom > 1) {
          const remainingPointer = activePointers.values().next().value;
          dragStartX = remainingPointer.x;
          dragStartY = remainingPointer.y;
          scrollStartLeft = viewport.scrollLeft;
          scrollStartTop = viewport.scrollTop;
          viewport.classList.add('is-dragging');
        }

        if (event?.pointerId !== undefined && viewport.hasPointerCapture(event.pointerId)) {
          viewport.releasePointerCapture(event.pointerId);
        }
        if (activePointers.size === 0) pinchOccurred = false;
      };

      viewport.addEventListener('pointerup', stopDragging);
      viewport.addEventListener('pointercancel', stopDragging);
      
      // PERBAIKAN 2: Zoom dengan roda mouse yang lebih mulus dan natural
      viewport.addEventListener('wheel', (event) => {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          requestZoomBy(Math.exp(-event.deltaY * 0.0015));
          return;
        }

        if (currentZoom <= 1) return;
        event.preventDefault();
        viewport.scrollLeft += event.deltaX;
        viewport.scrollTop += event.deltaY;
      }, { passive: false });
    }

    function handleResizeOrOrientation() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(async () => {
        syncThumbnailSidebarMode();
        if (pdfDocInstance && document.getElementById('view-reader').classList.contains('flex')) {
          const rect = document.getElementById('reader-viewport').getBoundingClientRect();
          const portrait = window.innerWidth < window.innerHeight;
          const unchanged = lastBuildRect &&
            Math.abs(rect.width - lastBuildRect.w) <= 2 &&
            Math.abs(rect.height - lastBuildRect.h) <= 2 &&
            portrait === lastBuildRect.portrait;
          if (unchanged) return;
          await rebuildFlipbookDOM();
          if (currentZoom > 1) setZoom(currentZoom, false);
        }
      }, 250);
    }

    function isCompactReader() {
      return window.matchMedia('(max-width: 768px), (max-height: 500px)').matches;
    }

    function syncThumbnailSidebarMode() {
      const sidebar = document.getElementById('thumbnail-sidebar');
      if (!sidebar) return;

      if (isCompactReader()) {
        if (!sidebar.classList.contains('mobile-visible')) {
          sidebar.classList.add('mobile-hidden');
        }
      } else {
        sidebar.classList.remove('mobile-hidden', 'mobile-visible', 'desktop-hidden');
      }
    }

    // Menampilkan katalog dari cache lokal lebih dulu, data terbaru menyusul dari Supabase
    function renderCatalogFromCache() {
      try {
        const cached = JSON.parse(localStorage.getItem(CATALOG_CACHE_KEY) || 'null');
        if (!cached || !Array.isArray(cached.data) || cached.data.length === 0) return;
        sortOrderAvailable = cached.sortOrderAvailable !== false;
        lastCatalogSerialized = JSON.stringify(cached.data);
        applyCatalogData(cached.data);
      } catch (e) {}
    }

    function applyCatalogData(data) {
      catalogData = (data || []).slice().sort((firstBook, secondBook) => {
        const firstOrder = firstBook.sort_order ?? Number.MAX_SAFE_INTEGER;
        const secondOrder = secondBook.sort_order ?? Number.MAX_SAFE_INTEGER;
        if (firstOrder !== secondOrder) return firstOrder - secondOrder;
        return new Date(secondBook.created_at || 0) - new Date(firstBook.created_at || 0);
      });
      if (!sortOrderAvailable) {
        let savedOrder = [];
        try {
          savedOrder = JSON.parse(localStorage.getItem(BOOK_ORDER_STORAGE_KEY) || '[]');
        } catch (e) {}
        const orderById = new Map(savedOrder.map((id, index) => [String(id), index]));
        catalogData.sort((firstBook, secondBook) =>
          (orderById.get(String(firstBook.id)) ?? Number.MAX_SAFE_INTEGER) -
          (orderById.get(String(secondBook.id)) ?? Number.MAX_SAFE_INTEGER)
        );
      }
      populateCategoryDropdown();
      renderCatalogGrid(catalogData);
    }

    async function loadCatalogFromSupabase() {
      const grid = document.getElementById('catalog-grid');
      if (catalogData.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-indigo-300/70"><i class="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-400"></i><p class="mt-2 text-sm">Mengambil koleksi flipbook...</p></div>`;
      }

      let { data, error } = await supabaseClient
        .from('flipbooks')
        .select('*, sort_order')
        .order('created_at', { ascending: false });

      sortOrderAvailable = !error;
      if (error && /sort_order/i.test(error.message)) {
        sortOrderAvailable = false;
        ({ data, error } = await supabaseClient
          .from('flipbooks')
          .select('*')
          .order('created_at', { ascending: false }));
      }

      if (error) {
        // Bila katalog dari cache sudah tampil, biarkan tetap tampil (mis. koneksi sedang buruk)
        if (catalogData.length === 0) {
          grid.innerHTML = `<div class="col-span-full text-center py-12 text-red-400 text-sm">Gagal memuat data: ${error.message}</div>`;
        }
        return;
      }

      pruneCoverCache(data || []);
      const serialized = JSON.stringify(data || []);
      try {
        localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ data: data || [], sortOrderAvailable }));
      } catch (e) {}

      // Data sama dengan yang sudah tampil dari cache -> tidak perlu render ulang (tanpa kedip)
      if (serialized === lastCatalogSerialized && catalogData.length > 0) return;
      lastCatalogSerialized = serialized;
      applyCatalogData(data);
    }

    function renderCatalogGrid(items) {
      const grid = document.getElementById('catalog-grid');
      grid.innerHTML = '';

      // Hentikan antrean/pengamat sampul dari render sebelumnya
      if (coverObserver) coverObserver.disconnect();
      coverQueue.length = 0;

      if (items.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 text-sm">Tidak ada flipbook ditemukan.</div>`;
        return;
      }

      if (!coverObserver && 'IntersectionObserver' in window) {
        coverObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            coverObserver.unobserve(entry.target);
            if (entry.target.__book) enqueueCover(entry.target.__book);
          });
        }, { rootMargin: '300px 0px' });
      }

      items.forEach(book => {
        const card = document.createElement('div');
        card.className = 'glass-card rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer group shadow-sm';
        card.onclick = () => openReader(book);

        card.innerHTML = `
          <div class="h-44 sm:h-48 bg-slate-900/85 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
            <img id="cover-img-${book.id}" class="w-full h-full object-cover hidden" alt="" decoding="async">
            <div id="cover-placeholder-${book.id}" class="absolute inset-0 flex items-center justify-center bg-slate-950/90">
              <i class="fa-solid fa-circle-notch fa-spin text-indigo-400 text-xl"></i>
            </div>
            <span class="absolute top-2.5 left-2.5 text-[9px] uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full font-semibold z-10 shadow-sm">${book.category || 'Umum'}</span>
          </div>
          <div class="p-3 flex-grow flex flex-col justify-between space-y-1.5">
            <div>
              <h3 class="font-bold text-white text-xs sm:text-sm group-hover:text-indigo-300 transition-colors line-clamp-1">${book.title}</h3>
              <p class="text-[11px] text-indigo-200/60 line-clamp-1 mt-0.5 leading-snug">${book.description || 'Tidak ada deskripsi.'}</p>
            </div>
            <div class="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-indigo-400 font-medium">
              <span>Buka Buku</span>
              <i class="fa-solid fa-arrow-right transform group-hover:translate-x-1 transition-transform text-[10px]"></i>
            </div>
          </div>
        `;
        grid.appendChild(card);

        readCoverCache(book).then(cachedCover => {
          if (!card.isConnected) return;      // grid sudah dirender ulang (mis. saat mencari)
          if (cachedCover) {
            showCover(book.id, cachedCover);  // dari cache: tanpa mengunduh PDF sama sekali
          } else if (coverObserver) {
            card.__book = book;
            coverObserver.observe(card);      // sampul baru dibuat saat kartu mendekati layar
          } else {
            enqueueCover(book);
          }
        });
      });
    }

    function normalizeReadingDirection(value) {
      return String(value || 'ltr').replaceAll("'", '').replaceAll('"', '').toLowerCase() === 'rtl'
        ? 'rtl'
        : 'ltr';
    }

    function showCover(bookId, dataUrl) {
      const img = document.getElementById(`cover-img-${bookId}`);
      const placeholder = document.getElementById(`cover-placeholder-${bookId}`);
      if (!img) return;
      img.src = dataUrl;
      img.classList.remove('hidden');
      if (placeholder) placeholder.classList.add('hidden');
    }

    function showCoverFallback(bookId) {
      const placeholder = document.getElementById(`cover-placeholder-${bookId}`);
      if (placeholder) {
        placeholder.innerHTML = `<i class="fa-solid fa-file-pdf text-4xl text-indigo-400/40"></i>`;
      }
    }

    // Antrean sampul: maksimal COVER_CONCURRENCY PDF dibuka bersamaan
    function enqueueCover(book) {
      if (coverInFlight.has(book.id) || coverQueue.some(b => b.id === book.id)) return;
      coverQueue.push(book);
      pumpCoverQueue();
    }

    function pumpCoverQueue() {
      while (coverActive < COVER_CONCURRENCY && coverQueue.length > 0) {
        const book = coverQueue.shift();
        coverActive++;
        coverInFlight.add(book.id);
        generateCover(book).finally(() => {
          coverActive--;
          coverInFlight.delete(book.id);
          pumpCoverQueue();
        });
      }
    }

    async function generateCover(book) {
      try {
        await ensurePdfJs();
        // disableAutoFetch: ambil halaman 1 saja, jangan unduh sisa file PDF di latar belakang
        const loadingTask = pdfjsLib.getDocument({ url: book.pdf_url, disableAutoFetch: true });
        try {
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.35 });

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));
          const context = canvas.getContext('2d');
          context.fillStyle = '#ffffff';            // JPEG tidak punya transparansi
          context.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: context, viewport }).promise;

          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
          if (!blob) throw new Error('Gagal membuat sampul');
          const coverUrl = await writeCoverCache(book, blob);
          showCover(book.id, coverUrl);
          canvas.width = 0; canvas.height = 0;
        } finally {
          loadingTask.destroy();                    // lepaskan memori & worker
        }
      } catch (e) {
        showCoverFallback(book.id);
      }
    }

    function populateCategoryDropdown() {
      const select = document.getElementById('category-filter');
      const categories = ['ALL', ...new Set(catalogData.map(b => b.category).filter(Boolean))];
      select.innerHTML = categories.map(c => `<option value="${c}">${c === 'ALL' ? 'Semua Buku' : c}</option>`).join('');
    }

    let filterTimer = null;
    function filterCatalogDebounced() {
      clearTimeout(filterTimer);
      filterTimer = setTimeout(filterCatalog, 150);
    }

    function filterCatalog() {
      const query = document.getElementById('search-input').value.toLowerCase();
      const category = document.getElementById('category-filter').value;

      const filtered = catalogData.filter(book => {
        const matchQuery = book.title.toLowerCase().includes(query) || (book.description && book.description.toLowerCase().includes(query));
        const matchCategory = category === 'ALL' || book.category === category;
        return matchQuery && matchCategory;
      });

      renderCatalogGrid(filtered);
    }

    function switchView(viewName) {
      closeQuran();
      if (viewName !== 'reader' && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      document.getElementById('view-catalog').classList.add('hidden');
      document.getElementById('view-reader').classList.add('hidden');
      document.getElementById('view-reader').classList.remove('flex');
      document.getElementById('view-admin').classList.add('hidden');

      if (viewName === 'catalog') {
        document.getElementById('view-catalog').classList.remove('hidden');
      } else if (viewName === 'reader') {
        document.getElementById('view-reader').classList.remove('hidden');
        document.getElementById('view-reader').classList.add('flex');
      } else if (viewName === 'admin') {
        if (!currentUser) {
          openAdminModal();
          document.getElementById('view-catalog').classList.remove('hidden');
          syncHash();
          return;
        }
        document.getElementById('view-admin').classList.remove('hidden');
        renderAdminTable();
      }
      syncHash();
    }

    async function openReader(book) {
      if (pageCanvasCacheBookId !== book.id) clearPageCanvasCache();
      pageCanvasCacheBookId = book.id;
      lastBuildRect = null;
      currentBook = { ...book, reading_direction: normalizeReadingDirection(book.reading_direction) };
      document.getElementById('reader-page-controls').classList.toggle('rtl', currentBook.reading_direction === 'rtl');
      resetZoom();
      document.getElementById('reader-book-title').textContent = book.title;
      switchView('reader');
      document.getElementById('loading-spinner').classList.remove('hidden');
      document.getElementById('flipbook-wrapper').classList.add('hidden');

      try {
        await Promise.all([ensurePdfJs(), ensurePageFlip()]);

        if (pdfCache.has(book.id)) {
          pdfDocInstance = pdfCache.get(book.id);
        } else {
          const cachedPdfUrl = book.pdf_url.includes('?') ? `${book.pdf_url}&v=${book.id}` : `${book.pdf_url}?v=${book.id}`;
          const loadingTask = pdfjsLib.getDocument({ url: cachedPdfUrl, rangeChunkSize: 524288 });
          pdfDocInstance = await loadingTask.promise;
          pdfCache.set(book.id, pdfDocInstance);
        }

        document.getElementById('page-count').innerText = pdfDocInstance.numPages;

        const savedPage = localStorage.getItem(`flipbuku_last_page_${book.id}`);
        if (savedPage) {
          currentPageIndex = parseInt(savedPage, 10);
          if (currentPageIndex > pdfDocInstance.numPages || currentPageIndex < 1) {
            currentPageIndex = 1;
          }
        } else {
          currentPageIndex = 1;
        }

        document.getElementById('page-num-input').value = currentPageIndex;

        await generateThumbnailsList();
        await rebuildFlipbookDOM();

        document.getElementById('loading-spinner').classList.add('hidden');
        document.getElementById('flipbook-wrapper').classList.remove('hidden');

      } catch (err) {
        alert("Gagal memuat dokumen PDF: " + err.message);
        switchView('catalog');
      }
    }

    // ===== Cache canvas halaman (dipakai ulang saat rebuild) & pelepasan memori =====
    const pageCanvasCache = new Map();
    let pageCanvasCacheBookId = null;
    let lastBuildRect = null;
    const KEEP_RENDERED_PAGES = 6;

    function clearPageCanvasCache() {
      pageCanvasCache.forEach(c => { c.width = 0; c.height = 0; });
      pageCanvasCache.clear();
    }

    // Bebaskan bitmap halaman yang jauh dari halaman aktif (memori canvas besar, terutama di mobile)
    function releaseFarPages(current) {
      pageCanvasCache.forEach((canvas, pageNum) => {
        if (canvas.dataset.state === 'done' && Math.abs(pageNum - current) > KEEP_RENDERED_PAGES) {
          canvas.width = 0;
          canvas.height = 0;
          delete canvas.dataset.state;
        }
      });
    }

    // ===== Thumbnail: dirender hanya saat terlihat =====
    let thumbObserver = null;

    async function renderThumb(pageNum) {
      const doc = pdfDocInstance;
      const thumbCanvas = document.getElementById(`thumb-canvas-${pageNum}`);
      if (!doc || !thumbCanvas || thumbCanvas.dataset.state === 'done' || thumbCanvas.dataset.state === 'rendering') return;
      thumbCanvas.dataset.state = 'rendering';
      try {
        const page = await doc.getPage(pageNum);
        const thumbViewport = page.getViewport({ scale: 0.2 });
        thumbCanvas.height = thumbViewport.height;
        thumbCanvas.width = thumbViewport.width;
        await page.render({ canvasContext: thumbCanvas.getContext('2d'), viewport: thumbViewport }).promise;
        thumbCanvas.dataset.state = 'done';
      } catch (err) {
        delete thumbCanvas.dataset.state;
        console.warn("Gagal render thumbnail:", pageNum, err);
      }
    }

    function scrollActiveThumbIntoView(smooth = true) {
      const activeThumb = document.getElementById(`thumb-page-${currentPageIndex}`);
      if (activeThumb) activeThumb.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'nearest' });
    }

    function isThumbnailSidebarVisible() {
      const sidebar = document.getElementById('thumbnail-sidebar');
      return !!sidebar && sidebar.offsetParent !== null && !sidebar.classList.contains('mobile-hidden');
    }

    async function generateThumbnailsList() {
      const thumbContainer = document.getElementById('thumbnail-container');
      if (!thumbContainer) return;
      thumbContainer.innerHTML = '';
      activeThumbEl = null;

      if (thumbObserver) thumbObserver.disconnect();
      thumbObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (!entry.isIntersecting) return;
              thumbObserver.unobserve(entry.target);
              renderThumb(parseInt(entry.target.getAttribute('data-page'), 10));
            });
          }, { root: thumbContainer, rootMargin: '200px 0px' })
        : null;

      // Ukuran awal canvas dari rasio halaman 1 agar tata letak daftar tidak bergeser saat thumbnail terisi
      let thumbW = 0, thumbH = 0;
      try {
        const first = await pdfDocInstance.getPage(1);
        const vp = first.getViewport({ scale: 0.2 });
        thumbW = Math.max(1, Math.floor(vp.width));
        thumbH = Math.max(1, Math.floor(vp.height));
      } catch (e) {}

      for (let pageNum = 1; pageNum <= pdfDocInstance.numPages; pageNum++) {
        const thumbDiv = document.createElement('div');
        thumbDiv.className = `thumb-item glass-card p-2 rounded-xl border border-white/10 hover:border-indigo-400 transition flex flex-col items-center justify-center ${pageNum === currentPageIndex ? 'active' : ''}`;
        thumbDiv.id = `thumb-page-${pageNum}`;
        thumbDiv.setAttribute('data-page', pageNum);
        
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.id = `thumb-canvas-${pageNum}`;
        thumbCanvas.className = "rounded-lg w-full h-auto bg-white shadow-md min-h-[50px]";
        if (thumbW && thumbH) { thumbCanvas.width = thumbW; thumbCanvas.height = thumbH; }

        const label = document.createElement('span');
        label.className = "text-[10px] text-indigo-200 font-semibold mt-1.5";
        label.innerText = pageNum;

        thumbDiv.appendChild(thumbCanvas);
        thumbDiv.appendChild(label);
        thumbContainer.appendChild(thumbDiv);
        if (thumbObserver) thumbObserver.observe(thumbDiv);
        else renderThumb(pageNum);
      }
    }

    // Rebuild dijalankan satu per satu. Fullscreen memicu beberapa event resize beruntun;
    // tanpa antrean, beberapa rebuild saling menimpa DOM/canvas yang sama.
    let activeThumbEl = null;
    let rebuildLoop = null;
    let rebuildQueued = false;
    function rebuildFlipbookDOM() {
      if (rebuildLoop) {
        rebuildQueued = true;
        return rebuildLoop;
      }
      rebuildLoop = (async () => {
        try {
          let runs = 0;
          do {
            rebuildQueued = false;
            await rebuildFlipbookDOMOnce();
            runs++;
          } while (rebuildQueued && runs < 4);
        } finally {
          rebuildLoop = null;
        }
      })();
      return rebuildLoop;
    }

    // Halaman yang mungkin tampil: kiri/kanan bergantung arah baca (RTL: halaman kanan = current-1)
    async function renderPagesAround(pageNum) {
      for (const n of [pageNum, pageNum - 1, pageNum + 1, pageNum + 2]) {
        await renderPageIfNeeded(n);
      }
    }

    async function rebuildFlipbookDOMOnce() {
      if (!pdfDocInstance) return;

      const flipWrapper = document.getElementById('flipbook-wrapper');
      if (!flipWrapper) return;

      const wasHidden = flipWrapper.classList.contains('hidden');
      if (wasHidden) flipWrapper.classList.remove('hidden');

      if (pageFlipInstance) {
        try { pageFlipInstance.destroy(); } catch(e){}
        pageFlipInstance = null;
      }

      flipWrapper.innerHTML = '<div id="flipbook-container"></div>';
      const flipContainer = document.getElementById('flipbook-container');

      const totalPages = pdfDocInstance.numPages;
      const isRtl = currentBook?.reading_direction === 'rtl';

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page-canvas-wrapper';
        pageDiv.setAttribute('data-page-num', pageNum);

        let canvas = pageCanvasCache.get(pageNum);
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvas.id = `page-canvas-${pageNum}`;
          pageCanvasCache.set(pageNum, canvas);
        }
        pageDiv.appendChild(canvas);
        flipContainer.appendChild(pageDiv);
      }

      const firstPage = await pdfDocInstance.getPage(1);
      const originalViewport = firstPage.getViewport({ scale: 1.0 });
      const aspectRatio = originalViewport.width / originalViewport.height;

      const viewportContainer = document.getElementById('reader-viewport');
      const isPortrait = window.innerWidth < window.innerHeight;
      const isMobile = window.innerWidth <= 768 || window.innerHeight <= 500;
      const useSinglePage = isPortrait || isMobile;

      const viewportRect = viewportContainer.getBoundingClientRect();
      const startSize = { w: viewportRect.width, h: viewportRect.height };
      const availWidth = viewportRect.width || viewportContainer.clientWidth || (window.innerWidth - 200);
      const availHeight = viewportRect.height || viewportContainer.clientHeight || (window.innerHeight - 100);
      const pageCountInView = useSinglePage ? 1 : 2;
      const horizontalPadding = useSinglePage ? 24 : 48;
      const verticalPadding = isMobile ? 16 : 48;
      const maxWidthByViewport = Math.max(150, (availWidth - horizontalPadding) / pageCountInView);
      const maxHeightByViewport = Math.max(120, availHeight - verticalPadding);

      let targetWidth = Math.min(maxWidthByViewport, maxHeightByViewport * aspectRatio);
      let targetHeight = targetWidth / aspectRatio;

      if (targetHeight > maxHeightByViewport) {
        targetHeight = maxHeightByViewport;
        targetWidth = targetHeight * aspectRatio;
      }

      targetWidth = Math.max(120, Math.round(targetWidth));
      targetHeight = Math.max(120, Math.round(targetHeight));

      pageFlipInstance = new St.PageFlip(flipContainer, {
        width: targetWidth,
        height: targetHeight,
        size: "fixed",
        minWidth: 120,
        maxWidth: 1000,
        minHeight: 120,
        maxHeight: 1200,
        maxShadowOpacity: 0.2,
        showCover: false,
        usePortrait: useSinglePage,
        useMouseEvents: false,
        mobileScrollSupport: false,
        flippingTime: 300,
        disableFlipAnimation: false
      });

      const pageElements = Array.from(flipContainer.querySelectorAll('.page-canvas-wrapper'));
      pageFlipInstance.loadFromHTML(isRtl ? pageElements.reverse() : pageElements);

      await renderPagesAround(currentPageIndex);

      if (isRtl) {
        pageFlipInstance.turnToPage(totalPages - currentPageIndex);
      } else if (currentPageIndex > 1) {
        pageFlipInstance.turnToPage(currentPageIndex - 1);
      }

      pageFlipInstance.on('flip', (e) => {
        currentPageIndex = isRtl ? totalPages - e.data : e.data + 1;
        document.getElementById('page-num-input').value = currentPageIndex;
        
        if (currentBook && currentBook.id) {
          localStorage.setItem(`flipbuku_last_page_${currentBook.id}`, currentPageIndex);
        }

        renderPagesAround(currentPageIndex).then(() => releaseFarPages(currentPageIndex));

        if (activeThumbEl) activeThumbEl.classList.remove('active');
        const activeThumb = document.getElementById(`thumb-page-${currentPageIndex}`);
        activeThumbEl = activeThumb;
        if (activeThumb) {
          activeThumb.classList.add('active');
          if (isThumbnailSidebarVisible()) scrollActiveThumbIntoView(true);
        }
      });

      if (wasHidden) flipWrapper.classList.add('hidden');

      // Ukuran viewport berubah saat proses (mis. transisi fullscreen belum selesai) -> ulangi dengan ukuran akhir
      const endRect = viewportContainer.getBoundingClientRect();
      if (Math.abs(endRect.width - startSize.w) > 2 || Math.abs(endRect.height - startSize.h) > 2) {
        rebuildQueued = true;
      }
      lastBuildRect = { w: endRect.width, h: endRect.height, portrait: window.innerWidth < window.innerHeight };
    }

    // Status render disimpan di elemen canvas itu sendiri (bukan Set global), jadi canvas baru
    // hasil rebuild otomatis dianggap belum dirender. Gagal render tidak menandai halaman 'selesai'.
    async function renderPageIfNeeded(pageNum) {
      const doc = pdfDocInstance;
      if (!doc || pageNum < 1 || pageNum > doc.numPages) return;

      const canvas = document.getElementById(`page-canvas-${pageNum}`);
      if (!canvas || canvas.dataset.state === 'done' || canvas.dataset.state === 'rendering') return;
      canvas.dataset.state = 'rendering';

      try {
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        // Render ke canvas sementara lalu salin sekaligus: tidak ada kondisi setengah jadi/putih di layar
        const buffer = document.createElement('canvas');
        buffer.width = viewport.width;
        buffer.height = viewport.height;
        await page.render({ canvasContext: buffer.getContext('2d'), viewport }).promise;

        canvas.width = buffer.width;
        canvas.height = buffer.height;
        canvas.getContext('2d').drawImage(buffer, 0, 0);
        buffer.width = 0;
        buffer.height = 0;
        canvas.dataset.state = 'done';
      } catch (err) {
        delete canvas.dataset.state; // boleh dicoba lagi pada pemanggilan berikutnya
        console.warn('Gagal render halaman', pageNum, err);
      }
    }

    function toggleThumbnailSidebar() {
      const sidebar = document.getElementById('thumbnail-sidebar');
      if (isCompactReader()) {
        if (sidebar.classList.contains('mobile-visible')) {
          closeMobileSidebar();
        } else {
          openMobileSidebar();
          scrollActiveThumbIntoView(false);
        }
      } else {
        sidebar.classList.toggle('desktop-hidden');
        if (!sidebar.classList.contains('desktop-hidden')) scrollActiveThumbIntoView(false);
      }
    }

    function openMobileSidebar() {
      const sidebar = document.getElementById('thumbnail-sidebar');
      sidebar.classList.remove('mobile-hidden');
      sidebar.classList.add('mobile-visible');
    }

    function closeMobileSidebar() {
      const sidebar = document.getElementById('thumbnail-sidebar');
      sidebar.classList.remove('mobile-visible');
      sidebar.classList.add('mobile-hidden');
    }

    // PERBAIKAN 2: Fungsi Zoom yang lebih optimal, smooth, dan ramah pengguna
    function setZoom(zoom, smoothReset = true) {
      currentZoom = Math.min(Math.max(0.75, zoom), 3.0);
      const wrapper = document.getElementById('flipbook-wrapper');
      const viewport = document.getElementById('reader-viewport');
      const flipbook = document.getElementById('flipbook-container');

      viewport.classList.toggle('is-zoomed', currentZoom > 1);

      if (currentZoom > 1 && flipbook) {
        const baseWidth = flipbook.offsetWidth;
        const baseHeight = flipbook.offsetHeight;
        const scaledWidth = baseWidth * currentZoom;
        const scaledHeight = baseHeight * currentZoom;
        const offsetX = Math.max(0, (viewport.clientWidth - scaledWidth) / 2);
        const offsetY = Math.max(0, (viewport.clientHeight - scaledHeight) / 2);
        flipbook.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${currentZoom})`;
        wrapper.style.width = `${Math.max(viewport.clientWidth, scaledWidth)}px`;
        wrapper.style.height = `${Math.max(viewport.clientHeight, scaledHeight)}px`;
        const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
        const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
        viewport.scrollTo({
          left: Math.min(maxScrollLeft, Math.max(0, (scaledWidth - viewport.clientWidth) / 2)),
          top: Math.min(maxScrollTop, Math.max(0, (scaledHeight - viewport.clientHeight) / 2)),
          behavior: smoothReset ? 'smooth' : 'instant'
        });
      } else {
        if (flipbook) flipbook.style.transform = currentZoom === 1 ? 'none' : `scale(${currentZoom})`;
        wrapper.style.width = '';
        wrapper.style.height = '';
        viewport.scrollTo({ left: 0, top: 0, behavior: smoothReset ? 'smooth' : 'instant' });
      }
    }

    // Pinch & roda mouse: gabungkan banyak event menjadi satu pembaruan per frame
    let zoomTarget = null;
    let zoomRaf = 0;
    function requestZoomBy(factor) {
      zoomTarget = Math.min(Math.max(0.75, (zoomTarget ?? currentZoom) * factor), 3.0);
      if (zoomRaf) return;
      zoomRaf = requestAnimationFrame(() => {
        zoomRaf = 0;
        const target = zoomTarget;
        zoomTarget = null;
        if (target !== null) setZoom(target, false);
      });
    }

    function zoomFlipbook(amount) {
      setZoom(currentZoom + amount);
    }

    function resetZoom() {
      currentZoom = 1;
      const wrapper = document.getElementById('flipbook-wrapper');
      const viewport = document.getElementById('reader-viewport');
      const flipbook = document.getElementById('flipbook-container');
      if (flipbook) flipbook.style.transform = 'none';
      wrapper.style.width = '';
      wrapper.style.height = '';
      viewport.classList.remove('is-zoomed', 'is-dragging');
      viewport.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }

    async function jumpToPage(val) {
      const target = parseInt(val, 10);
      if (pageFlipInstance && !isNaN(target) && target > 0 && target <= (pdfDocInstance?.numPages || 0)) {
        await renderPagesAround(target);
        releaseFarPages(target);
        const displayPage = currentBook?.reading_direction === 'rtl'
          ? pdfDocInstance.numPages - target
          : target - 1;
        pageFlipInstance.turnToPage(displayPage);
      }
    }

    function flipPreviousPage() {
      if (!pageFlipInstance) return;
      currentBook?.reading_direction === 'rtl'
        ? pageFlipInstance.flipNext()
        : pageFlipInstance.flipPrev();
    }

    function flipNextPage() {
      if (!pageFlipInstance) return;
      currentBook?.reading_direction === 'rtl'
        ? pageFlipInstance.flipPrev()
        : pageFlipInstance.flipNext();
    }

    // Ikon berubah sesuai status: expand = masuk fullscreen, compress = keluar fullscreen
    function updateFullscreenButton() {
      const isFs = !!document.fullscreenElement;
      const icon = document.getElementById('fullscreen-icon');
      const btn = document.getElementById('fullscreen-button');
      if (!icon || !btn) return;
      icon.classList.toggle('fa-expand', !isFs);
      icon.classList.toggle('fa-compress', isFs);
      btn.title = isFs ? 'Keluar Fullscreen' : 'Fullscreen';
      btn.setAttribute('aria-label', isFs ? 'Keluar fullscreen' : 'Masuk fullscreen');
    }

    function toggleFullscreen() {
      const elem = document.getElementById('view-reader');
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => alert(err.message));
      } else {
        document.exitFullscreen();
      }
    }

    function openAdminModalOrView() {
      if (currentUser) {
        switchView('admin');
      } else {
        openAdminModal();
      }
    }

    // ===== AL-QURAN (panel di bawah navbar, berisi quran.html) =====
    const QURAN_URL = 'quran.html'; // lokasi halaman Al-Quran (satu folder dengan index.html)

    // ===== SIMPAN & PULIHKAN POSISI HALAMAN (agar refresh tidak kembali ke menu) =====
    // Posisi disimpan di alamat halaman (#): "#baca=ID" (membaca buku), "#admin" (Cloudzone),
    // ditambah "&quran" bila panel Al-Quran sedang terbuka. Katalog = tanpa #.
    // Halaman terakhir tiap buku sudah disimpan terpisah (flipbuku_last_page_*), halaman Al-Quran
    // disimpan oleh quran.html sendiri.
    function parseHash() {
      const hasil = { baca: null, admin: false, quran: false };
      (location.hash || '').replace(/^#/, '').split('&').filter(Boolean).forEach(token => {
        if (token === 'quran') hasil.quran = true;
        else if (token === 'admin') hasil.admin = true;
        else if (token.startsWith('baca=')) {
          try { hasil.baca = decodeURIComponent(token.slice(5)); } catch (e) {}
        }
      });
      return hasil;
    }

    function syncHash() {
      try {
        const bagian = [];
        const reader = document.getElementById('view-reader');
        const admin = document.getElementById('view-admin');
        if (reader && !reader.classList.contains('hidden') && currentBook && currentBook.id != null) {
          bagian.push('baca=' + encodeURIComponent(currentBook.id));
        } else if (admin && !admin.classList.contains('hidden')) {
          bagian.push('admin');
        }
        if (isQuranOpen()) bagian.push('quran');
        const hash = bagian.length ? '#' + bagian.join('&') : '';
        if ((location.hash || '') !== hash) {
          history.replaceState(null, '', location.pathname + location.search + hash);
        }
      } catch (e) {}
    }

    function restoreAdminView() {
      const quranTerbuka = isQuranOpen();
      switchView('admin');
      if (quranTerbuka) openQuran();
    }

    // force = true: dipanggil setelah katalog selesai dimuat (terakhir kali mencoba)
    function restoreFromHash(force) {
      if (stateRestored) return;
      const s = parseHash();
      if (!s.baca && !s.admin && !s.quran) { stateRestored = true; return; }

      if (s.baca) {
        const book = catalogData.find(b => String(b.id) === String(s.baca));
        if (!book && !force) return;            // katalog belum siap: coba lagi setelah data termuat
        if (book) openReader(book);
      } else if (s.admin) {
        if (currentUser) restoreAdminView(); else pendingAdmin = true;
      }

      stateRestored = true;
      if (s.quran) openQuran();                 // dibuka terakhir agar tampil di atas
      syncHash();
    }

    function isQuranOpen() {
      const el = document.getElementById('quran-overlay');
      return !!el && !el.classList.contains('hidden');
    }

    // Saat panel Al-Quran terbuka, tombol berubah jadi "FlipBuku" (untuk kembali); sebaliknya jadi "Al-Quran"
    function setQuranButton(aktif) {
      const btn = document.getElementById('nav-quran-btn');
      if (!btn) return;
      const ikon = document.getElementById('nav-quran-icon');
      const teks = document.getElementById('nav-quran-text');
      btn.setAttribute('aria-pressed', aktif ? 'true' : 'false');
      btn.setAttribute('aria-label', aktif ? 'Kembali ke FlipBuku' : 'Buka Al-Quran');
      if (ikon) ikon.className = aktif ? 'fa-solid fa-book-open' : 'fa-solid fa-book-quran';
      if (teks) teks.textContent = aktif ? 'FlipBuku' : 'Al-Quran';
    }

    function openQuran() {
      const overlay = document.getElementById('quran-overlay');
      // iframe baru dibuat saat pertama kali dibuka (hemat kecepatan loading FlipbuKu)
      if (!document.getElementById('quran-frame')) {
        const frame = document.createElement('iframe');
        frame.id = 'quran-frame';
        frame.src = QURAN_URL;
        frame.title = 'Mushaf Al-Quran';
        frame.className = 'absolute inset-0 w-full h-full border-0';
        frame.onload = () => {
          const spinner = document.getElementById('quran-loading');
          if (spinner) spinner.classList.add('hidden');
        };
        overlay.appendChild(frame);
      }
      overlay.classList.remove('hidden');
      setQuranButton(true);
      syncHash();
    }

    function closeQuran() {
      const overlay = document.getElementById('quran-overlay');
      if (!overlay) return;
      overlay.classList.add('hidden');
      setQuranButton(false);
      syncHash();
    }

    // klik tombol Al-Quran lagi = tutup
    function toggleQuran() {
      if (isQuranOpen()) closeQuran(); else openQuran();
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isQuranOpen()) closeQuran();
    });

    function openAdminModal() {
      document.getElementById('login-modal').classList.remove('hidden');
    }

    function closeAdminModal() {
      document.getElementById('login-modal').classList.add('hidden');
    }

    function updateAdminNavUI() {
      const btnText = document.getElementById('admin-btn-text');
      if (currentUser) {
        btnText.innerText = "Cloudzone";
      } else {
        btnText.innerText = "Cloudzone";
      }
    }

    async function handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const btn = document.getElementById('btn-login');

      btn.disabled = true;
      btn.innerText = "Memproses...";

      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

      btn.disabled = false;
      btn.innerText = "Masuk Cloudzone";

      if (error) {
        alert("Login Gagal: " + error.message);
      } else {
        closeAdminModal();
        switchView('admin');
      }
    }

    async function logoutAdmin() {
      await supabaseClient.auth.signOut();
      switchView('catalog');
    }

    async function handleUpload(e) {
      e.preventDefault();

      if (!currentUser) {
        alert("Anda harus login sebagai Admin untuk mengunggah!");
        return;
      }

      const title = document.getElementById('upload-title').value;
      const category = document.getElementById('upload-category').value;
      const readingDirection = document.getElementById('upload-reading-direction').value;
      const desc = document.getElementById('upload-desc').value;
      
      const githubUrlInput = document.getElementById('upload-github-url').value.trim();

      if (!githubUrlInput) {
        alert("Harap masukkan Link GitHub / URL dokumen PDF!");
        return;
      }

      const btn = document.getElementById('btn-submit-upload');
      btn.disabled = true;
      btn.innerText = "Menyimpan Data...";

      try {
        const pdfUrl = githubUrlInput;

        const { error: dbError } = await supabaseClient
          .from('flipbooks')
          .insert([{ 
            title, 
            category, 
            description: desc, 
            pdf_url: pdfUrl, 
            reading_direction: normalizeReadingDirection(readingDirection) 
          }]);

        if (dbError) throw dbError;

        alert("Flipbook Berhasil Disimpan!");
        document.getElementById('upload-form').reset();
        
        pdfCache.clear();

        await loadCatalogFromSupabase();
        renderAdminTable();

      } catch (err) {
        alert("Gagal Menyimpan: " + err.message);
      } finally {
        btn.disabled = false;
        btn.innerText = "Simpan & Terbitkan";
      }
    }

    function copySortOrderSql(btn) {
      const text = document.getElementById('sort-order-sql').innerText;
      const done = () => { btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i> Tersalin'; };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => alert('Salin manual dari kotak SQL.'));
      else alert('Salin manual dari kotak SQL.');
    }

    function renderAdminTable() {
      document.getElementById('sort-order-warning')?.classList.toggle('hidden', sortOrderAvailable);
      const tbody = document.getElementById('admin-table-body');
      tbody.innerHTML = '';

      if (catalogData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-500">Belum ada data flipbook.</td></tr>`;
        return;
      }

      catalogData.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-white/5 hover:bg-white/[0.03] transition-colors draggable-row';
        tr.dataset.bookId = item.id;
        tr.dataset.index = index;

        tr.innerHTML = `
          <td class="p-3.5 text-center text-xs text-indigo-300/60 font-mono drag-handle" title="Tahan & geser untuk memindahkan"><i class="fa-solid fa-grip-vertical"></i></td>
          <td class="p-3.5 font-medium text-white">${item.title}</td>
          <td class="p-3.5"><span class="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30">${item.category}</span></td>
          <td class="p-3.5 text-xs text-indigo-200/70">${normalizeReadingDirection(item.reading_direction) === 'rtl' ? 'Kanan ke kiri' : 'Kiri ke kanan'}</td>
          <td class="p-3.5 text-xs text-indigo-200/60">${item.description || '-'}</td>
          <td class="p-3.5 text-right space-x-1">
            <button onclick="editFlipbook('${item.id}')" class="text-indigo-300 hover:text-indigo-100 p-1.5 transition" title="Edit buku"><i class="fa-solid fa-pen"></i></button>
            <button onclick="deleteFlipbook('${item.id}')" class="text-red-400 hover:text-red-300 p-1.5 transition" title="Hapus"><i class="fa-solid fa-trash"></i></button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    // ===== Drag & drop urutan buku (Pointer Events: mouse, pen, dan layar sentuh) =====
    function setupAdminRowSorting() {
      const tbody = document.getElementById('admin-table-body');
      tbody.addEventListener('pointerdown', startRowDrag);
    }

    function getScrollParent(el) {
      let node = el.parentElement;
      while (node && node !== document.body) {
        const overflowY = getComputedStyle(node).overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node;
        node = node.parentElement;
      }
      return document.scrollingElement;
    }

    function startRowDrag(e) {
      const handle = e.target.closest('.drag-handle');
      if (!handle || adminDrag || isSavingOrder) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      const row = handle.closest('tr[data-book-id]');
      if (!row) return;
      e.preventDefault();

      adminDrag = {
        row,
        bookId: row.dataset.bookId,
        fromIndex: parseInt(row.dataset.index, 10),
        insertIndex: null,
        pointerId: e.pointerId,
        clientY: e.clientY,
        scroller: getScrollParent(row),
        rafId: null
      };

      row.classList.add('dragging');
      document.body.classList.add('admin-sorting');
      window.addEventListener('pointermove', onRowDragMove);
      window.addEventListener('pointerup', onRowDragEnd);
      window.addEventListener('pointercancel', onRowDragCancel);
      window.addEventListener('keydown', onRowDragKey);
      adminDrag.rafId = requestAnimationFrame(rowDragTick);
    }

    function onRowDragMove(e) {
      if (!adminDrag || e.pointerId !== adminDrag.pointerId) return;
      e.preventDefault();
      adminDrag.clientY = e.clientY;
      updateRowDropTarget();
    }

    // Auto-scroll saat pointer mendekati tepi area yang bisa di-scroll
    function rowDragTick() {
      if (!adminDrag) return;
      const { scroller, clientY } = adminDrag;
      const rect = scroller === document.scrollingElement
        ? { top: 0, bottom: window.innerHeight }
        : scroller.getBoundingClientRect();
      const zone = 70;
      let speed = 0;
      if (clientY < rect.top + zone) speed = -Math.ceil((rect.top + zone - clientY) / 5);
      else if (clientY > rect.bottom - zone) speed = Math.ceil((clientY - (rect.bottom - zone)) / 5);
      if (speed) {
        scroller.scrollTop += Math.max(-24, Math.min(24, speed));
        updateRowDropTarget();
      }
      adminDrag.rafId = requestAnimationFrame(rowDragTick);
    }

    // insertIndex = posisi sisipan di antara baris (0..jumlah baris), ditentukan dari titik tengah tiap baris
    function updateRowDropTarget() {
      const rows = [...document.querySelectorAll('#admin-table-body tr[data-book-id]')];
      rows.forEach(r => r.classList.remove('drop-before', 'drop-after'));

      let insertIndex = rows.length;
      for (let i = 0; i < rows.length; i++) {
        const rect = rows[i].getBoundingClientRect();
        if (adminDrag.clientY < rect.top + rect.height / 2) { insertIndex = i; break; }
      }
      adminDrag.insertIndex = insertIndex;

      // Posisi yang sama dengan sekarang = tidak ada perubahan, jangan tampilkan garis
      if (insertIndex === adminDrag.fromIndex || insertIndex === adminDrag.fromIndex + 1) return;
      if (insertIndex < rows.length) rows[insertIndex].classList.add('drop-before');
      else rows[rows.length - 1].classList.add('drop-after');
    }

    function finishRowDrag() {
      if (!adminDrag) return null;
      cancelAnimationFrame(adminDrag.rafId);
      window.removeEventListener('pointermove', onRowDragMove);
      window.removeEventListener('pointerup', onRowDragEnd);
      window.removeEventListener('pointercancel', onRowDragCancel);
      window.removeEventListener('keydown', onRowDragKey);
      document.body.classList.remove('admin-sorting');
      document.querySelectorAll('#admin-table-body .dragging, #admin-table-body .drop-before, #admin-table-body .drop-after')
        .forEach(r => r.classList.remove('dragging', 'drop-before', 'drop-after'));
      const state = adminDrag;
      adminDrag = null;
      return state;
    }

    function onRowDragEnd(e) {
      if (!adminDrag || e.pointerId !== adminDrag.pointerId) return;
      adminDrag.clientY = e.clientY;
      updateRowDropTarget();
      const { fromIndex, insertIndex } = finishRowDrag();
      if (insertIndex === null || insertIndex === fromIndex || insertIndex === fromIndex + 1) return;
      commitBookReorder(fromIndex, insertIndex > fromIndex ? insertIndex - 1 : insertIndex);
    }

    function onRowDragCancel(e) {
      if (adminDrag && e.pointerId === adminDrag.pointerId) finishRowDrag();
    }

    function onRowDragKey(e) {
      if (e.key === 'Escape') finishRowDrag();
    }

    async function commitBookReorder(fromIndex, toIndex) {
      if (fromIndex === toIndex || isSavingOrder) return;
      isSavingOrder = true;

      const previousOrder = catalogData.slice();
      const previousSortOrder = new Map(catalogData.map(book => [String(book.id), book.sort_order]));

      const [movedItem] = catalogData.splice(fromIndex, 1);
      catalogData.splice(toIndex, 0, movedItem);
      if (sortOrderAvailable) {
        catalogData.forEach((book, index) => { book.sort_order = index; });
      }

      renderAdminTable();
      filterCatalog(); // segarkan katalog publik tanpa menghapus filter pencarian/kategori

      try {
        if (!sortOrderAvailable) {
          localStorage.setItem(BOOK_ORDER_STORAGE_KEY, JSON.stringify(catalogData.map(book => book.id)));
          return;
        }

        // Hanya kirim baris yang nilai sort_order-nya berubah
        const changed = catalogData.filter(book => previousSortOrder.get(String(book.id)) !== book.sort_order);
        const results = await Promise.all(changed.map(book =>
          supabaseClient
            .from('flipbooks')
            .update({ sort_order: book.sort_order })
            .eq('id', book.id)
            .select('id')
        ));

        const failed = results.find(r => r.error);
        if (failed) throw new Error(failed.error.message);
        if (results.some(r => !r.data || r.data.length === 0)) {
          throw new Error('Tidak ada baris yang diperbarui. Periksa policy UPDATE/SELECT RLS pada tabel flipbooks.');
        }
      } catch (error) {
        // Kembalikan tampilan, lalu muat ulang dari database supaya sinkron bila sebagian update sempat masuk
        catalogData = previousOrder;
        renderAdminTable();
        filterCatalog();
        alert('Gagal menyimpan urutan baru: ' + error.message);
        await loadCatalogFromSupabase();
        renderAdminTable();
      } finally {
        isSavingOrder = false;
      }
    }

    function editFlipbook(id) {
      const item = catalogData.find(book => String(book.id) === String(id));
      const row = document.querySelector(`#admin-table-body tr[data-book-id="${id}"]`);
      if (!item || !row) return;

      row.innerHTML = `
        <td class="p-3.5 text-center text-xs text-indigo-300/40"><i class="fa-solid fa-grip-vertical"></i></td>
        <td class="p-3.5"><input id="edit-title-${id}" value="${escapeHtml(item.title || '')}" class="w-full glass-input rounded-lg px-2.5 py-1.5 text-sm"></td>
        <td class="p-3.5"><input id="edit-category-${id}" value="${escapeHtml(item.category || '')}" class="w-full glass-input rounded-lg px-2.5 py-1.5 text-sm"></td>
        <td class="p-3.5"><select id="edit-direction-${id}" class="w-full glass-input rounded-lg px-2.5 py-1.5 text-sm bg-slate-900"><option value="ltr" ${normalizeReadingDirection(item.reading_direction) !== 'rtl' ? 'selected' : ''}>Kiri ke kanan</option><option value="rtl" ${normalizeReadingDirection(item.reading_direction) === 'rtl' ? 'selected' : ''}>Kanan ke kiri</option></select></td>
        <td class="p-3.5"><input id="edit-description-${id}" value="${escapeHtml(item.description || '')}" placeholder="Deskripsi" class="w-full glass-input rounded-lg px-2.5 py-1.5 text-sm"></td>
        <td class="p-3.5 text-right whitespace-nowrap">
          <button onclick="saveFlipbook('${id}')" class="text-emerald-300 hover:text-emerald-200 p-1.5 transition"><i class="fa-solid fa-check"></i> Simpan</button>
          <button onclick="renderAdminTable()" class="text-slate-300 hover:text-white p-1.5 transition"><i class="fa-solid fa-xmark"></i> Batal</button>
        </td>
      `;
    }

    function escapeHtml(value) {
      return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
    }

    async function saveFlipbook(id) {
      const title = document.getElementById(`edit-title-${id}`)?.value.trim();
      const category = document.getElementById(`edit-category-${id}`)?.value.trim();
      const reading_direction = document.getElementById(`edit-direction-${id}`)?.value || 'ltr';
      const description = document.getElementById(`edit-description-${id}`)?.value.trim();

      if (!title || !category) {
        alert('Nama buku dan kategori wajib diisi.');
        return;
      }

      const { data: updatedRows, error } = await supabaseClient
        .from('flipbooks')
        .update({ title, category, description, reading_direction })
        .eq('id', id)
        .select('id, title, category, description, reading_direction');

      if (error) {
        alert('Gagal menyimpan perubahan: ' + error.message);
        return;
      }

      if (!updatedRows || updatedRows.length === 0) {
        alert('Tidak ada data yang diperbarui. Periksa policy UPDATE/SELECT RLS pada tabel flipbooks.');
        return;
      }

      const itemIndex = catalogData.findIndex(book => String(book.id) === String(id));
      if (itemIndex >= 0) {
        catalogData[itemIndex] = {
          ...catalogData[itemIndex],
          ...updatedRows[0]
        };
      }
      renderAdminTable();
      renderCatalogGrid(catalogData);
      pdfCache.delete(id);
      await loadCatalogFromSupabase();
      renderAdminTable();
    }

    async function deleteFlipbook(id) {
      if (!confirm("Apakah Anda yakin ingin menghapus flipbook ini?")) return;

      const { error } = await supabaseClient
        .from('flipbooks')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Gagal menghapus: " + error.message);
      } else {
        pdfCache.delete(id);
        loadCatalogFromSupabase();
        renderAdminTable();
      }
    }

(function () {
      let deferredPrompt = null;
      const btn = document.getElementById('nav-install-btn');
      const isStandalone = () =>
        window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      function showBtn() { if (btn && !isStandalone()) btn.style.display = 'flex'; }
      function hideBtn() { if (btn) btn.style.display = 'none'; }

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showBtn();
      });
      window.addEventListener('appinstalled', () => { deferredPrompt = null; hideBtn(); });

      // iPhone/iPad (Safari) tidak punya prompt otomatis: tampilkan tombol dengan petunjuk manual
      if (isIOS && !isStandalone()) showBtn();

      window.installApp = async function () {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          try { await deferredPrompt.userChoice; } catch (e) {}
          deferredPrompt = null;
          hideBtn();
        } else if (isIOS) {
          alert('Untuk memasang FlipbuKu di iPhone/iPad:\n1. Ketuk tombol Bagikan (kotak dengan panah ke atas) di Safari\n2. Pilih "Tambah ke Layar Utama"\n3. Ketuk "Tambah"');
        }
      };

      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('sw.js').catch(() => {});
        });
      }
    })();
