// --- Daftar Surah Al-Quran (1-114) beserta halaman awal Mushaf Madinah ---
  const DAFTAR_SURAH = [
    { no: 1, nama: "Al-Fatihah", hal: 1 }, { no: 2, nama: "Al-Baqarah", hal: 2 },
    { no: 3, nama: "Ali 'Imran", hal: 50 }, { no: 4, nama: "An-Nisa'", hal: 77 },
    { no: 5, nama: "Al-Ma'idah", hal: 106 }, { no: 6, nama: "Al-An'am", hal: 128 },
    { no: 7, nama: "Al-A'raf", hal: 151 }, { no: 8, nama: "Al-Anfal", hal: 177 },
    { no: 9, nama: "At-Taubah", hal: 187 }, { no: 10, nama: "Yunus", hal: 208 },
    { no: 11, nama: "Hud", hal: 221 }, { no: 12, nama: "Yusuf", hal: 235 },
    { no: 13, nama: "Ar-Ra'd", hal: 249 }, { no: 14, nama: "Ibrahim", hal: 255 },
    { no: 15, nama: "Al-Hijr", hal: 262 }, { no: 16, nama: "An-Nahl", hal: 267 },
    { no: 17, nama: "Al-Isra'", hal: 282 }, { no: 18, nama: "Al-Kahf", hal: 293 },
    { no: 19, nama: "Maryam", hal: 305 }, { no: 20, nama: "Ta-Ha", hal: 312 },
    { no: 21, nama: "Al-Anbiya'", hal: 322 }, { no: 22, nama: "Al-Hajj", hal: 332 },
    { no: 23, nama: "Al-Mu'minun", hal: 342 }, { no: 24, nama: "An-Nur", hal: 350 },
    { no: 25, nama: "Al-Furqan", hal: 359 }, { no: 26, nama: "Asy-Syu'ara'", hal: 367 },
    { no: 27, nama: "An-Naml", hal: 377 }, { no: 28, nama: "Al-Qasas", hal: 385 },
    { no: 29, nama: "Al-Ankabut", hal: 396 }, { no: 30, nama: "Ar-Rum", hal: 404 },
    { no: 31, nama: "Luqman", hal: 411 }, { no: 32, nama: "As-Sajdah", hal: 415 },
    { no: 33, nama: "Al-Ahzab", hal: 418 }, { no: 34, nama: "Saba'", hal: 428 },
    { no: 35, nama: "Fatir", hal: 434 }, { no: 36, nama: "Ya-Sin", hal: 440 },
    { no: 37, nama: "Ash-Shaffat", hal: 446 }, { no: 38, nama: "Sad", hal: 453 },
    { no: 39, nama: "Az-Zumar", hal: 458 }, { no: 40, nama: "Ghafir", hal: 467 },
    { no: 41, nama: "Fussilat", hal: 477 }, { no: 42, nama: "Asy-Syura", hal: 483 },
    { no: 43, nama: "Az-Zukhruf", hal: 489 }, { no: 44, nama: "Ad-Dukhan", hal: 496 },
    { no: 45, nama: "Al-Jatsiyah", hal: 499 }, { no: 46, nama: "Al-Ahqaf", hal: 502 },
    { no: 47, nama: "Muhammad", hal: 507 }, { no: 48, nama: "Al-Fath", hal: 511 },
    { no: 49, nama: "Al-Hujurat", hal: 515 }, { no: 50, nama: "Qaf", hal: 518 },
    { no: 51, nama: "Adz-Dzariyat", hal: 520 }, { no: 52, nama: "At-Tur", hal: 523 },
    { no: 53, nama: "An-Najm", hal: 526 }, { no: 54, nama: "Al-Qamar", hal: 528 },
    { no: 55, nama: "Ar-Rahman", hal: 531 }, { no: 56, nama: "Al-Waqi'ah", hal: 534 },
    { no: 57, nama: "Al-Hadid", hal: 537 }, { no: 58, nama: "Al-Mujadilah", hal: 542 },
    { no: 59, nama: "Al-Hasyr", hal: 545 }, { no: 60, nama: "Al-Mumtahanah", hal: 549 },
    { no: 61, nama: "Ash-Shaff", hal: 551 }, { no: 62, nama: "Al-Jumu'ah", hal: 553 },
    { no: 63, nama: "Al-Munafiqun", hal: 554 }, { no: 64, nama: "At-Taghabun", hal: 556 },
    { no: 65, nama: "At-Talaq", hal: 558 }, { no: 66, nama: "At-Tahrim", hal: 560 },
    { no: 67, nama: "Al-Mulk", hal: 562 }, { no: 68, nama: "Al-Qalam", hal: 564 },
    { no: 69, nama: "Al-Haqqah", hal: 566 }, { no: 70, nama: "Al-Ma'arij", hal: 568 },
    { no: 71, nama: "Nuh", hal: 570 }, { no: 72, nama: "Al-Jinn", hal: 572 },
    { no: 73, nama: "Al-Muzzammil", hal: 574 }, { no: 74, nama: "Al-Muddatstsir", hal: 575 },
    { no: 75, nama: "Al-Qiyamah", hal: 577 }, { no: 76, nama: "Al-Insan", hal: 578 },
    { no: 77, nama: "Al-Mursalat", hal: 580 }, { no: 78, nama: "An-Naba'", hal: 582 },
    { no: 79, nama: "An-Nazi'at", hal: 583 }, { no: 80, nama: "'Abasa", hal: 585 },
    { no: 81, nama: "At-Takwir", hal: 586 }, { no: 82, nama: "Al-Infitar", hal: 587 },
    { no: 83, nama: "Al-Muthaffifin", hal: 587 }, { no: 84, nama: "Al-Insiqaq", hal: 589 },
    { no: 85, nama: "Al-Buruj", hal: 590 }, { no: 86, nama: "At-Tariq", hal: 591 },
    { no: 87, nama: "Al-A'la", hal: 591 }, { no: 88, nama: "Al-Ghasyiyah", hal: 592 },
    { no: 89, nama: "Al-Fajr", hal: 593 }, { no: 90, nama: "Al-Balad", hal: 594 },
    { no: 91, nama: "Asy-Syams", hal: 595 }, { no: 92, nama: "Al-Lail", hal: 595 },
    { no: 93, nama: "Ad-Duha", hal: 596 }, { no: 94, nama: "Asy-Syarh", hal: 596 },
    { no: 95, nama: "At-Tin", hal: 597 }, { no: 96, nama: "Al-'Alaq", hal: 597 },
    { no: 97, nama: "Al-Qadr", hal: 598 }, { no: 98, nama: "Al-Bayyinah", hal: 598 },
    { no: 99, nama: "Az-Zalzalah", hal: 599 }, { no: 100, nama: "Al-'Adiyat", hal: 599 },
    { no: 101, nama: "Al-Qari'ah", hal: 600 }, { no: 102, nama: "At-Takatsur", hal: 600 },
    { no: 103, nama: "Al-'Asr", hal: 601 }, { no: 104, nama: "Al-Humazah", hal: 601 },
    { no: 105, nama: "Al-Fiil", hal: 601 }, { no: 106, nama: "Quraisy", hal: 602 },
    { no: 107, nama: "Al-Ma'un", hal: 602 }, { no: 108, nama: "Al-Kautsar", hal: 602 },
    { no: 109, nama: "Al-Kafirun", hal: 603 }, { no: 110, nama: "An-Nasr", hal: 603 },
    { no: 111, nama: "Al-Lahab", hal: 603 }, { no: 112, nama: "Al-Ikhlas", hal: 604 },
    { no: 113, nama: "Al-Falaq", hal: 604 }, { no: 114, nama: "An-Nas", hal: 604 }
  ];

  const selectSurah = document.getElementById("pilihSurah");
  DAFTAR_SURAH.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.hal;
    opt.textContent = `${s.no}. ${s.nama}`;
    selectSurah.appendChild(opt);
  });

  const JSON_URL = "https://raw.githubusercontent.com/MohamadHajjRabee/quran-qcf4/main/pages/";
  const FONT_URL = "https://cdn.jsdelivr.net/gh/MohamadHajjRabee/quran-qcf4@main/fonts-woff2/";
  const GAMBAR = {
    cdn: "https://cdn.jsdelivr.net/gh/SakinaDevGroup/mushaf-tajweed-cdn@main",
    raw: "https://raw.githubusercontent.com/SakinaDevGroup/mushaf-tajweed-cdn/main"
  };

  const JARAK_KATA_EM = 0.12;  
  const MIN_JARAK_BARIS = 2.0; 
  const JARAK_SWIPE = 60;
  const JUMLAH_BARIS = 15;         
  const HALAMAN_KALIBRASI = [3, 150, 300, 450];  

  const IKON = {
    bulan: '<svg class="ik" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    matahari: '<svg class="ik" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
  };

  const frame = document.getElementById("frame");
  const teks = document.getElementById("teks");
  const kepala = document.getElementById("kepala");
  const kaki = document.getElementById("kaki");
  const viewport = document.getElementById("viewport");
  const img = document.getElementById("gambar");
  const input = document.getElementById("halaman");
  const info = document.getElementById("info");

  let halaman = Number(localStorage.getItem("quran_halaman")) || 1;
  let tema = localStorage.getItem("quran_tema") === "light" ? "light" : "dark";  
  let mode = localStorage.getItem("quran_mode") === "gambar" ? "gambar" : "teks";
  let tampilGaris = localStorage.getItem("quran_tampilGaris") !== "tidak";
  let token = 0;
  let GEO = null;
  try { GEO = JSON.parse(localStorage.getItem("quran_geo_v2")); } catch (e) { GEO = null; }
  if (!GEO || !(GEO.cw > 0 && GEO.ch > 0 && GEO.p > 0 && GEO.iw > 0)) GEO = null;

  function hitungJuz(no) { return no < 22 ? 1 : Math.min(30, Math.floor((no - 2) / 20) + 1); }

  function judulSurah(teksJudul) {
    const kata = (teksJudul || "").trim().split(/\s+/);
    const polos = k => k.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "");
    const i = kata.findIndex(k => polos(k) === "بسم");
    return (i > 0 ? kata.slice(0, i) : kata).join(" ");
  }

  const dataCache = {};
  const fontCache = {};

  function ambilData(no) {
    if (!dataCache[no]) {
      const nama = String(no).padStart(3, "0");
      dataCache[no] = fetch(JSON_URL + nama + ".json").then(r => {
        if (!r.ok) throw new Error("JSON halaman " + no + " status " + r.status);
        return r.json();
      });
      dataCache[no].catch(() => { delete dataCache[no]; });
    }
    return dataCache[no];
  }

  function muatFont(nama) {
    if (!fontCache[nama]) {
      const file = nama === "QCF4_QBSML" ? "QCF4_QBSML.woff2" : nama + "_W.woff2";
      const f = new FontFace(nama, `url(${FONT_URL}${file})`);
      fontCache[nama] = f.load().then(ff => { document.fonts.add(ff); return ff; });
      fontCache[nama].catch(() => { delete fontCache[nama]; });
    }
    return fontCache[nama];
  }

  function fontHalaman(data) {
    const s = new Set();
    data.lines.forEach(l => l.words.forEach(w => { if (w.type !== "surah_header") s.add(w.font); }));
    return [...s];
  }

  async function renderTeks(no, my) {
    teks.classList.add("memuat");
    const data = await ambilData(no);
    await Promise.all(fontHalaman(data).map(muatFont));
    if (my !== token) return;

    teks.innerHTML = "";
    data.lines.forEach(line => {
      const baris = document.createElement("div");
      baris.className = "baris";
      const header = line.words.find(w => w.type === "surah_header");
      if (header) {
        baris.classList.add("header");
        const b = document.createElement("div");
        b.className = "banner";
        const t = document.createElement("span");
        t.textContent = judulSurah(header.text);
        b.appendChild(t);
        baris.appendChild(b);
      } else {
        baris.classList.add("isi");
        line.words.forEach(w => {
          const k = document.createElement("span");
          k.className = "kata";
          k.style.fontFamily = `"${w.font}"`;
          k.textContent = w.char;
          baris.appendChild(k);
        });
      }
      teks.appendChild(baris);
    });

    const namaSurah = (data.surahs && data.surahs.length) ? data.surahs.map(s => s.name).join(" · ") : "";
    document.getElementById("kSurah").textContent = namaSurah;
    document.getElementById("kJuz").textContent = "Juz " + hitungJuz(no);
    document.getElementById("kNo").textContent = no;
    info.textContent = `Halaman ${no} dari 604` + (namaSurah ? "  •  " + namaSurah : "");

    if (data.surahs && data.surahs.length) {
      const surahAktif = DAFTAR_SURAH.slice().reverse().find(s => s.hal <= no);
      if (surahAktif) selectSurah.value = surahAktif.hal;
    }

    atur();
    teks.classList.remove("memuat");
  }

  function lebarAlami(baris, fs) {
    let total = 0;
    baris.querySelectorAll(".kata").forEach(k => { total += k.getBoundingClientRect().width; });
    return total + Math.max(0, baris.children.length - 1) * JARAK_KATA_EM * fs;
  }

  function atur() {
    const lebar = teks.clientWidth;
    if (!lebar) return;
    const semua = [...teks.querySelectorAll(".baris")];
    const isi = semua.filter(b => b.classList.contains("isi"));
    const faktor = halaman <= 2 ? 0.78 : 1;                 
    const target = (GEO ? lebar * (GEO.iw / GEO.cw) : lebar) * faktor;
    semua.forEach(b => { b.style.width = target + "px"; });
    teks.style.minHeight = GEO ? (lebar * GEO.ch / GEO.cw) + "px" : "";
    if (!isi.length) return;

    teks.style.setProperty("--fs", "100px");
    const alami = isi.map(b => lebarAlami(b, 100));
    const maks = Math.max(...alami);
    if (!maks) return;
    let fs = (100 * target / maks) * 0.995;
    teks.style.setProperty("--fs", fs + "px");

    for (let i = 0; i < 20; i++) {
      const meluber = isi.some(b => lebarAlami(b, fs) > target - 0.5);
      if (!meluber) break;
      fs *= 0.985;
      teks.style.setProperty("--fs", fs + "px");
    }

    if (GEO) {
      const px = lebar * GEO.p / GEO.cw;                    
      teks.style.setProperty("--pitch", (px / fs).toFixed(4));
    } else {
      let hMaks = 0;
      isi.forEach(b => b.querySelectorAll(".kata").forEach(k => { hMaks = Math.max(hMaks, k.getBoundingClientRect().height); }));
      teks.style.setProperty("--pitch", Math.max(MIN_JARAK_BARIS, (hMaks / fs) * 1.1).toFixed(3));
    }

    isi.forEach(b => b.classList.toggle("pendek", lebarAlami(b, fs) < target * 0.85));

    teks.querySelectorAll(".banner").forEach(b => {
      const t = b.firstChild;
      t.style.fontSize = "";
      let ukuran = parseFloat(getComputedStyle(t).fontSize);
      for (let i = 0; i < 15 && t.offsetWidth > b.clientWidth * 0.78; i++) {
        ukuran *= 0.93;
        t.style.fontSize = ukuran + "px";
      }
    });
  }

  let timerUkuran;
  window.addEventListener("resize", () => {
    clearTimeout(timerUkuran);
    timerUkuran = setTimeout(() => { if (mode === "teks" && teks.children.length) atur(); }, 120);
  });

  function urlGambar(no, jenis, t) { return `${GAMBAR[jenis]}/${t || tema}/p${no}.png`; }

  function muatGambarCors(url) {
    return new Promise((ok, gagal) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => ok(el);
      el.onerror = gagal;
      el.src = url;
    });
  }

  function ukurGeometri(el) {
    const W = el.naturalWidth, H = el.naturalHeight;
    const s = Math.min(1, 600 / W);
    const w = Math.round(W * s), h = Math.round(H * s);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(el, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;      
    const br = d[0], bg = d[1], bb = d[2], ba = d[3];  
    const baris = new Float32Array(h), kolom = new Float32Array(w);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        let tinta = Math.abs(d[i + 3] - ba) > 60;
        if (!tinta && d[i + 3] > 60 && ba > 60) {
          tinta = Math.abs(d[i] - br) + Math.abs(d[i + 1] - bg) + Math.abs(d[i + 2] - bb) > 120;
        }
        if (tinta) { baris[y]++; kolom[x]++; }
      }
    }
    const ab = Math.max(2, w * 0.004), ak = Math.max(2, h * 0.004);
    let atas = -1, bawah = -1, kiri = -1, kanan = -1;
    for (let y = 0; y < h; y++) if (baris[y] > ab) { if (atas < 0) atas = y; bawah = y; }
    for (let x = 0; x < w; x++) if (kolom[x] > ak) { if (kiri < 0) kiri = x; kanan = x; }
    if (atas < 0 || kiri < 0) return null;
    return { W, H, s, atas, bawah: bawah + 1, kiri, kanan: kanan + 1 };
  }

  async function muatHalamanContoh(no) {
    try { return await muatGambarCors(urlGambar(no, "cdn", "light")); }
    catch (e) { return await muatGambarCors(urlGambar(no, "raw", "light")); }
  }

  async function kalibrasiGeometri() {
    const hasil = (await Promise.all(HALAMAN_KALIBRASI.map(async no => {
      try { return ukurGeometri(await muatHalamanContoh(no)); } catch (e) { return null; }
    }))).filter(Boolean);
    if (!hasil.length) return null;

    const tengah = arr => [...arr].sort((x, y) => x - y)[Math.floor(arr.length / 2)];
    const W = hasil[0].W, H = hasil[0].H;
    const lebarInk = hasil.map(a => (a.kanan - a.kiri) / a.s);
    const tinggiInk = hasil.map(a => (a.bawah - a.atas) / a.s);
    const iw = tengah(lebarInk);
    const p = tengah(tinggiInk) / JUMLAH_BARIS;                 
    const padV = p * 0.55, padH = Math.max(...lebarInk) * 0.03;
    const g = {
      W, H, iw, p,
      cw: Math.min(W, Math.max(...lebarInk) + padH * 2),
      ch: Math.min(H, Math.max(...tinggiInk) + padV * 2)
    };
    const rasio = g.ch / g.cw;
    if (!(g.cw > 0 && g.p > 0 && rasio > 0.8 && rasio < 3)) return null;   
    GEO = g;
    try { localStorage.setItem("quran_geo_v2", JSON.stringify(g)); } catch (e) {}
    return g;
  }

  function resetGeoGambar() {
    viewport.style.aspectRatio = "";
    img.style.width = ""; img.style.maxWidth = ""; img.style.marginLeft = ""; img.style.marginTop = "";
    img.style.opacity = "1";
  }

  function aturGambar() {
    if (!GEO || !img.naturalWidth) { resetGeoGambar(); return; }
    let a = null;
    try { a = ukurGeometri(img); } catch (e) { a = null; }
    if (!a) { resetGeoGambar(); return; }

    const W = img.naturalWidth, H = img.naturalHeight;
    const cw = Math.min(GEO.cw, W);
    const inkTinggi = (a.bawah - a.atas) / a.s;
    const ch = Math.min(H, Math.max(GEO.ch, inkTinggi + GEO.p * 0.6));   
    const tengahX = (a.kiri + a.kanan) / 2 / a.s;
    const tengahY = (a.atas + a.bawah) / 2 / a.s;
    const cx = Math.min(Math.max(0, tengahX - cw / 2), W - cw);
    const cy = Math.min(Math.max(0, tengahY - ch / 2), H - ch);

    viewport.style.aspectRatio = `${cw} / ${ch}`;
    img.style.maxWidth = "none";
    img.style.width = `${(W / cw) * 100}%`;
    img.style.marginLeft = `${-(cx / cw) * 100}%`;
    img.style.marginTop = `${-(cy / cw) * 100}%`;
    img.style.opacity = "1";
  }

  function terapkanGeometri() {
    if (mode === "teks") { if (teks.children.length) atur(); }
    else if (img.complete && img.naturalWidth) aturGambar();
  }

  function tampilGambar(no) {
    teks.style.display = "none";
    kepala.style.display = "none";
    kaki.style.display = "none";
    viewport.style.display = "block";
    if (GEO) { viewport.style.aspectRatio = `${GEO.cw} / ${GEO.ch}`; img.style.opacity = "0"; }
    else resetGeoGambar();

    img.crossOrigin = "anonymous";
    img.onload = () => { 
      if (no === halaman) {
        aturGambar();
        const surahAktif = DAFTAR_SURAH.slice().reverse().find(s => s.hal <= no);
        if (surahAktif) selectSurah.value = surahAktif.hal;
      }
    };
    let percobaan = 0;
    img.onerror = () => {
      percobaan++;
      if (percobaan === 1) { img.src = urlGambar(no, "raw"); }
      else if (percobaan === 2) {                       
        img.removeAttribute("crossorigin");
        img.src = urlGambar(no, "cdn");
      } else {
        info.textContent = "Gagal memuat gambar. Periksa koneksi internet.";
        img.style.opacity = "1";
      }
    };
    img.src = urlGambar(no, "cdn");
    img.alt = "Mushaf halaman " + no;
  }

  function prefetch(n) {
    if (n < 1 || n > 604) return;
    if (mode === "teks") {
      ambilData(n).then(d => Promise.all(fontHalaman(d).map(muatFont))).catch(() => {});
    } else {
      new Image().src = urlGambar(n, "cdn");
    }
  }

  function animasiMasuk(arah) {
    frame.classList.remove("masuk-kiri", "masuk-kanan");
    if (!arah) return;
    void frame.offsetWidth;
    frame.classList.add(arah > 0 ? "masuk-kiri" : "masuk-kanan");
  }

  function tampil(no, arah) {
    if (!(no >= 1 && no <= 604)) { input.value = halaman; return; }
    halaman = no;
    const my = ++token;

    input.value = no;
    info.textContent = `Halaman ${no} dari 604`;
    document.getElementById("prev").disabled = no <= 1;
    document.getElementById("next").disabled = no >= 604;
    localStorage.setItem("quran_halaman", no);
    window.scrollTo(0, 0);
    animasiMasuk(arah);

    if (mode === "teks") {
      viewport.style.display = "none";
      teks.style.display = "";
      kepala.style.display = "";
      kaki.style.display = "";
      renderTeks(no, my).catch(e => {
        if (my !== token) return;
        console.warn("Mode teks gagal, memakai gambar:", e);
        teks.classList.remove("memuat");
        info.textContent = `Halaman ${no} dari 604  •  (mode teks gagal dimuat, memakai gambar)`;
        tampilGambar(no);
      });
    } else {
      tampilGambar(no);
    }
    prefetch(no + 1);
    prefetch(no - 1);
  }

  function terapkanTema() {
    document.body.classList.toggle("terang", tema === "light");
    document.getElementById("tema").innerHTML = (tema === "dark" ? IKON.matahari : IKON.bulan);
  }
  function terapkanMode() {
    document.getElementById("sTeks").classList.toggle("aktif", mode === "teks");
    document.getElementById("sGambar").classList.toggle("aktif", mode === "gambar");
    document.getElementById("toggleGaris").style.display = mode === "teks" ? "" : "none";
  }
  function terapkanGaris() {
    teks.classList.toggle("tanpa-garis", !tampilGaris);
    document.getElementById("toggleGaris").classList.toggle("aktif", tampilGaris);
  }

  document.getElementById("next").onclick = () => tampil(halaman + 1, 1);
  document.getElementById("prev").onclick = () => tampil(halaman - 1, -1);
  input.addEventListener("change", () => tampil(parseInt(input.value)));
  input.addEventListener("keydown", e => { if (e.key === "Enter") input.blur(); });

  selectSurah.addEventListener("change", () => {
    const halTujuan = parseInt(selectSurah.value);
    if (halTujuan) {
      const arah = halTujuan > halaman ? 1 : -1;
      tampil(halTujuan, arah);
    }
  });

  document.getElementById("tema").onclick = () => {
    tema = tema === "dark" ? "light" : "dark";
    localStorage.setItem("quran_tema", tema);
    terapkanTema();
    if (mode === "gambar") tampil(halaman);
  };
  function pilihMode(m) {
    if (mode === m) return;
    mode = m;
    localStorage.setItem("quran_mode", m);
    terapkanMode();
    tampil(halaman);
  }
  document.getElementById("sTeks").onclick = () => pilihMode("teks");
  document.getElementById("sGambar").onclick = () => pilihMode("gambar");
  document.getElementById("toggleGaris").onclick = () => {
    tampilGaris = !tampilGaris;
    localStorage.setItem("quran_tampilGaris", tampilGaris ? "ya" : "tidak");
    terapkanGaris();
  };
  document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    if (e.key === "ArrowLeft") tampil(halaman + 1, 1);
    if (e.key === "ArrowRight") tampil(halaman - 1, -1);
  });

  let sx = 0, sy = 0, dx = 0, geser = false, arahPasti = false;
  function kembali() {
    frame.style.transition = "transform .2s ease, opacity .2s ease";
    frame.style.transform = ""; frame.style.opacity = "";
  }
  frame.addEventListener("touchstart", e => {
    if (e.touches.length !== 1 || (window.visualViewport && window.visualViewport.scale > 1.05)) { geser = false; return; }
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; geser = true; arahPasti = false;
    frame.style.transition = "none";
  }, { passive: true });
  frame.addEventListener("touchmove", e => {
    if (!geser) return;
    const t = e.touches[0];
    dx = t.clientX - sx;
    const dy = t.clientY - sy;
    if (!arahPasti) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      arahPasti = true;
      if (Math.abs(dy) > Math.abs(dx)) { geser = false; kembali(); return; }
    }
    frame.style.transform = `translateX(${dx * 0.35}px)`;
    frame.style.opacity = 1 - Math.min(Math.abs(dx) / 600, 0.35);
  }, { passive: true });
  frame.addEventListener("touchend", () => {
    if (!geser || !arahPasti) { geser = false; return; }
    geser = false;
    if (Math.abs(dx) >= JARAK_SWIPE) {
      const arah = dx > 0 ? 1 : -1;
      const target = halaman + arah;
      if (target >= 1 && target <= 604) {
        frame.style.transition = "none"; frame.style.transform = ""; frame.style.opacity = "";
        tampil(target, arah);
        return;
      }
    }
    kembali();
  });
  frame.addEventListener("touchcancel", () => { geser = false; kembali(); });

  if ("ontouchstart" in window) document.getElementById("petunjuk").textContent = "Geser ke kanan/kiri untuk pindah halaman";
  terapkanTema();
  terapkanMode();
  terapkanGaris();
  tampil(halaman);
  if (!GEO) kalibrasiGeometri().then(g => { if (g) terapkanGeometri(); }).catch(e => console.warn("Kalibrasi geometri gagal:", e));
