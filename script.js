function orderWhatsApp(packageName) {
    const phone = "62817843531";
    const text = `Assalamualaikum admin Khalifah Asia Bekasi, saya tertarik dan ingin berkonsultasi mengenai pemesanan program: [ ${packageName} ] ke Baitullah Musim 2026. Mohon info ketersediaan slot kursi reguler keluarga.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
}


// =========================================================
// JS KHUSUS PER HALAMAN
// Tiap blok dibungkus guard `data-page` pada <body> supaya
// hanya jalan di halamannya sendiri & tidak bentrok/konflik
// dengan variabel atau elemen dari halaman lain.
// =========================================================

// ============================================================
// HALAMAN: index.html
// ============================================================
if (document.body.dataset.page === "index") {
    // ===== Blok script #3 dari index.html =====
    document.addEventListener('DOMContentLoaded', function () {

                const dropdownItem = document.querySelector('.nav-item-dropdown');
                const dropdownToggle = dropdownItem.querySelector('.nav-link');
                const dropdownMenu = dropdownItem.querySelector('.nav-dropdown');

                // Toggle dropdown
                dropdownToggle.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    dropdownItem.classList.toggle('active');
                });

                // Klik di dalam dropdown tidak menutup dropdown
                dropdownMenu.addEventListener('click', function (e) {
                    e.stopPropagation();
                });

                // Klik di luar dropdown akan menutup
                document.addEventListener('click', function (e) {
                    if (!dropdownItem.contains(e.target)) {
                        dropdownItem.classList.remove('active');
                    }
                });

            });

            // ========== KONFIGURASI INTEGRASI GOOGLE SHEETS ==========
            // Cara setting: buat Google Spreadsheet baru -> Extensions > Apps Script ->
            // tempel kode dari file GOOGLE-SHEETS-SETUP.md -> Deploy as Web App
            // (Execute as: Me, Who has access: Anyone) -> salin URL Web App ke bawah ini.
            const GOOGLE_SHEET_WEBHOOK_URL = ""; // <-- TEMPEL URL WEB APP APPS SCRIPT DI SINI

            // ========== HELPER: KIRIM EVENT KE GA4 & META PIXEL ==========
            // Dipakai di titik-titik penting (submit form, klik WA, download brosur) supaya
            // kelihatan di Google Analytics & Meta Ads Manager traffic/lead datang dari mana.
            // Aman dipanggil kapan saja — kalau gtag/fbq belum siap (misal Ad-Blocker aktif),
            // fungsi ini otomatis dilewati tanpa memunculkan error di console.
            function trackEvent(eventName, params) {
                params = params || {};
                try {
                    if (typeof gtag === 'function') gtag('event', eventName, params);
                } catch (err) { /* GA4 diblokir/gagal load, aman diabaikan */ }
                try {
                    if (typeof fbq === 'function') fbq('trackCustom', eventName, params);
                } catch (err) { /* Meta Pixel diblokir/gagal load, aman diabaikan */ }
            }
            window.trackEvent = trackEvent;

            // Kirim data lead ke Google Sheet secara diam-diam (tidak mengganggu proses WhatsApp).
            // Kalau URL belum diisi, fungsi ini otomatis dilewati tanpa error.
            function sendLeadToGoogleSheet(payload) {
                if (!GOOGLE_SHEET_WEBHOOK_URL) return;
                try {
                    fetch(GOOGLE_SHEET_WEBHOOK_URL, {
                        method: "POST",
                        mode: "no-cors",
                        headers: { "Content-Type": "text/plain;charset=utf-8" },
                        body: JSON.stringify(Object.assign({ waktu: new Date().toISOString() }, payload))
                    }).catch(function (err) {
                        console.warn("Gagal mengirim data lead ke Google Sheet:", err);
                    });
                } catch (err) {
                    console.warn("Gagal mengirim data lead ke Google Sheet:", err);
                }
            }

            // ========== UTIL: AUTO-FORMAT NOMOR WHATSAPP ==========
            // Merapikan nomor sambil diketik: 08xx -> 62 8xx xxxx xxxx, batasi hanya angka.
            // Tujuannya mencegah salah ketik (huruf/simbol) & format nomor yang tidak konsisten
            // saat masuk ke pesan WhatsApp maupun data lead di Google Sheet.
            function formatIndoPhoneLive(raw) {
                let digits = (raw || '').replace(/\D/g, '');
                if (!digits) return '';
                if (digits.startsWith('0')) digits = '62' + digits.slice(1);
                else if (!digits.startsWith('62')) digits = '62' + digits;
                digits = digits.slice(0, 14); // batas wajar panjang nomor Indonesia

                const cc = digits.slice(0, 2);
                const rest = digits.slice(2);
                let out = cc;
                for (let i = 0; i < rest.length; i += 4) {
                    out += ' ' + rest.slice(i, i + 4);
                }
                return out;
            }

            function attachPhoneAutoFormat(inputEl) {
                if (!inputEl) return;
                inputEl.addEventListener('input', function () {
                    const cursorWasAtEnd = inputEl.selectionEnd === inputEl.value.length;
                    const formatted = formatIndoPhoneLive(inputEl.value);
                    if (formatted !== inputEl.value) {
                        inputEl.value = formatted;
                        if (cursorWasAtEnd) {
                            inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
                        }
                    }
                });
                // Rapikan juga saat form dibuka ulang dengan nilai lama (jaga-jaga)
                inputEl.addEventListener('blur', function () {
                    if (inputEl.value.trim()) inputEl.value = formatIndoPhoneLive(inputEl.value);
                });
            }

            // ========== TRUST MARQUEE (render twice for seamless loop) ==========
            (function () {
                const track = document.getElementById("trustTrack");
                const tpl = document.getElementById("trustItemsTemplate");
                if (!track || !tpl) return;
                track.appendChild(tpl.content.cloneNode(true));
                track.appendChild(tpl.content.cloneNode(true));
            })();

            // ========== MODAL: EMAIL (Footer) ==========
            (function () {
                const emailOverlay = document.getElementById('emailModalOverlay');
                const emailClose = document.getElementById('emailModalClose');
                const copyBtn = document.getElementById('copyEmailBtn');
                const copyMsg = document.getElementById('emailCopyMsg');
                const gmailLink = document.getElementById('gmailWebLink');
                const mailtoLink = document.getElementById('mailtoLink');

                const emailAddress = 'info@khalifahasia.co.id';
                const subject = 'Pendaftaran Agent Khalifah Asia Bekasi';
                const body = 'Assalamualaikum, saya ingin bertanya/mendaftar sebagai Agent Khalifah Asia Bekasi.';

                mailtoLink.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                gmailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                let lastFocusedEl = null;

                function openEmailModal(e) {
                    e.preventDefault();
                    lastFocusedEl = document.activeElement;
                    emailOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }

                function closeEmailModal() {
                    emailOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    if (lastFocusedEl) lastFocusedEl.focus();
                }

                emailClose.addEventListener('click', closeEmailModal);
                emailOverlay.addEventListener('click', (e) => {
                    if (e.target === emailOverlay) closeEmailModal();
                });
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && emailOverlay.classList.contains('active')) closeEmailModal();
                });

                copyBtn.addEventListener('click', () => {
                    const fallbackCopy = () => {
                        const tmp = document.createElement('input');
                        tmp.value = emailAddress;
                        document.body.appendChild(tmp);
                        tmp.select();
                        try {
                            document.execCommand('copy');
                        } catch (err) { }
                        document.body.removeChild(tmp);
                        showCopyMsg();
                    };

                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(emailAddress).then(showCopyMsg).catch(fallbackCopy);
                    } else {
                        fallbackCopy();
                    }
                });

                function showCopyMsg() {
                    copyMsg.textContent = 'Alamat email berhasil disalin!';
                    setTimeout(() => {
                        copyMsg.textContent = '';
                    }, 3000);
                }

                document.querySelectorAll('[data-email-trigger]').forEach(btn => {
                    btn.addEventListener('click', openEmailModal);
                });
            })();

            (function () {
                // Di HP (<=900px) pakai video kedua yang khusus di-export portrait,
                // supaya hero tetap besar/full-screen tapi videonya tidak perlu
                // di-crop dari video landscape milik desktop.
                const isMobileHero = window.matchMedia("(max-width: 900px)").matches;
                const desktopVideos = ["Video Carosel/animasikhalifahasiav3.mp4"];
                const mobileVideos = ["Video Carosel/animasikhalifahasiav3-mobile.mp4"];
                const videos = isMobileHero ? mobileVideos : desktopVideos;
                const DURATION = 10000;
                const vidA = document.querySelector(".hero-video-a");
                const vidB = document.querySelector(".hero-video-b");
                const bdA = document.querySelector(".hero-video-backdrop-a");
                const bdB = document.querySelector(".hero-video-backdrop-b");
                if (!vidA || !vidB || videos.length === 0) return;
                const prefersReducedMotion = window.matchMedia &&
                    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
                const prefersLessData = conn && (conn.saveData ||
                    (conn.effectiveType && /2g/.test(conn.effectiveType)));
                if (prefersReducedMotion || prefersLessData) {
                    vidA.removeAttribute("autoplay");
                    vidA.classList.add("is-active");
                    // Backdrop tidak diperlukan di HP (lihat komentar CSS di <head>),
                    // jadi tidak usah ikut dimuat supaya tidak boros kuota.
                    if (!isMobileHero && bdA) {
                        setSource(bdA, videos[0]);
                        bdA.classList.add("is-active");
                    }
                    return;
                }

                let index = 0;
                let showingA = true;

                // Kalau video khusus HP/tablet gagal dimuat (mis. file belum
                // di-upload ke server / nama file beda huruf besar-kecil),
                // otomatis pakai video desktop sebagai cadangan supaya animasi
                // hero tetap muncul di HP/tablet, bukan malah kosong.
                function setSource(videoEl, src, isFallbackAttempt) {
                    if (!videoEl) return;
                    videoEl.innerHTML = "";
                    const source = document.createElement("source");
                    source.src = src;
                    source.type = "video/mp4";
                    videoEl.appendChild(source);
                    const handleError = () => {
                        console.error("Hero video gagal dimuat, cek path:", src);
                        if (isMobileHero && !isFallbackAttempt && desktopVideos[0] && desktopVideos[0] !== src) {
                            console.warn("Mencoba fallback ke video desktop untuk HP/tablet:", desktopVideos[0]);
                            setSource(videoEl, desktopVideos[0], true);
                        }
                    };
                    videoEl.onerror = handleError;
                    source.onerror = handleError;
                    videoEl.load();
                    videoEl.play().catch((err) => console.warn("Autoplay video hero diblokir/gagal:", src, err));
                }

                setSource(vidA, videos[0]);
                vidA.classList.add("is-active");
                // Video blur belakang cuma dipakai di desktop (buat nutup celah
                // kosong dari object-fit:contain di layar lebar/aspect aneh); di HP
                // sudah dimatikan lewat CSS jadi tidak usah ikut dimuat/di-download.
                if (!isMobileHero) {
                    setSource(bdA, videos[0]);
                    if (bdA) bdA.classList.add("is-active");
                }

                if (videos.length > 1) {
                    setInterval(() => {
                        index = (index + 1) % videos.length;
                        const nextVideo = showingA ? vidB : vidA;
                        const currentVideo = showingA ? vidA : vidB;
                        setSource(nextVideo, videos[index]);
                        nextVideo.classList.add("is-active");
                        currentVideo.classList.remove("is-active");
                        if (!isMobileHero) {
                            const nextBackdrop = showingA ? bdB : bdA;
                            const currentBackdrop = showingA ? bdA : bdB;
                            setSource(nextBackdrop, videos[index]);
                            if (nextBackdrop) nextBackdrop.classList.add("is-active");
                            if (currentBackdrop) currentBackdrop.classList.remove("is-active");
                        }
                        showingA = !showingA;
                    }, DURATION);
                }
            })();

            // ========== HERO PARTICLES ==========
            (function () {
                const container = document.getElementById('heroParticles');
                const particleCount = 20;
                for (let i = 0; i < particleCount; i++) {
                    const p = document.createElement('div');
                    p.className = 'hero-particle';
                    p.style.left = Math.random() * 100 + '%';
                    p.style.top = Math.random() * 100 + '%';
                    p.style.animationDelay = Math.random() * 6 + 's';
                    p.style.animationDuration = (4 + Math.random() * 4) + 's';
                    p.style.opacity = 0.2 + Math.random() * 0.3;
                    p.style.width = (2 + Math.random() * 3) + 'px';
                    p.style.height = p.style.width;
                    container.appendChild(p);
                }
            })();

            // ========== BENEFIT CARDS: tap-to-flip (untuk device sentuh) ==========
            (function () {
                const cards = document.querySelectorAll('.benefit-card');
                cards.forEach((card) => {
                    card.addEventListener('click', () => {
                        const wasOpen = card.classList.contains('is-flipped');
                        cards.forEach((c) => c.classList.remove('is-flipped'));
                        if (!wasOpen) card.classList.add('is-flipped');
                    });
                    card.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            card.click();
                        }
                    });
                });
            })();

            // ========== HEADER SCROLL (rAF-throttled agar smooth, tidak lemot) ==========
            const header = document.getElementById('header');

            // ========== MOBILE MENU ==========
            const hamburger = document.getElementById('hamburger');
            const drawer = document.getElementById('mobileDrawer');
            const overlay = document.getElementById('mobileOverlay');

            function toggleMenu() {
                const isOpen = drawer.classList.toggle('active');
                hamburger.classList.toggle('active');
                overlay.classList.toggle('active');
                hamburger.setAttribute('aria-expanded', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            }

            hamburger.addEventListener('click', toggleMenu);
            overlay.addEventListener('click', toggleMenu);
            drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', toggleMenu));

            // ========== SCROLL REVEAL ==========
            const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.12,
                rootMargin: '0px 0px -30px 0px'
            });
            revealElements.forEach(el => revealObserver.observe(el));

            // ========== COUNTER ANIMATION ==========
            const counters = document.querySelectorAll('.hero-stat-num');
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = parseInt(entry.target.dataset.count);
                        const duration = 2000;
                        const start = performance.now();
                        const animate = (now) => {
                            const elapsed = now - start;
                            const progress = Math.min(elapsed / duration, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            const current = Math.floor(eased * target);
                            entry.target.textContent = current.toLocaleString('id-ID') + (target === 100 ? '%' : '+');
                            if (progress < 1) requestAnimationFrame(animate);
                        };
                        requestAnimationFrame(animate);
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.5
            });
            counters.forEach(c => counterObserver.observe(c));

            // ========== BACK TO TOP + HEADER SCROLL STATE (digabung, di-throttle rAF) ==========
            const backToTop = document.getElementById('backToTop');
            let scrollTicking = false;
            let lastScrollY = window.scrollY;
            function updateOnScroll() {
                const y = window.scrollY;

                header.classList.toggle('scrolled', y > 50);

                lastScrollY = y;
                backToTop.classList.toggle('visible', y > 500);
                scrollTicking = false;
            }
            window.addEventListener('scroll', () => {
                if (!scrollTicking) {
                    window.requestAnimationFrame(updateOnScroll);
                    scrollTicking = true;
                }
            }, { passive: true });
            updateOnScroll();
            backToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            // ========== WHATSAPP BOOKING (Jadwal Keberangkatan) — sekarang dialihkan ke Form Booking Online ==========
            function sendWA(paket, btn) {
                try { trackEvent('booking_form_open', { paket: paket }); } catch (err) { /* aman diabaikan */ }
                openBookingModal(btn ? btn.closest('.departure-card') : null, paket);
            }

            // ========== FORM BOOKING ONLINE (Data Diri, Paket & Tanggal, Tipe Kamar) — semua dropdown, sesuai poster ==========
            (function () {
                const overlay = document.getElementById('bookingModalOverlay');
                const closeBtn = document.getElementById('bookingModalClose');
                const form = document.getElementById('bookingForm');
                if (!overlay || !form) return;

                const paketDisplay = document.getElementById('bkPaketDisplay');
                const paketIndexInput = document.getElementById('bkPaketIndex');
                const durasiSelect = document.getElementById('bkDurasi');
                const tanggalSelect = document.getElementById('bkTanggal');
                const kamarSelect = document.getElementById('bkKamar');
                const errorMsg = document.getElementById('bkErrorMsg');
                let lastFocusedEl = null;
                let packages = [];

                // ----- Kumpulkan data semua paket dari kartu Jadwal & Paket (otomatis sesuai poster) -----
                function collectPackages() {
                    const cards = Array.from(document.querySelectorAll('#departureGrid .departure-card'));
                    return cards.map(function (card, i) {
                        const h3 = card.querySelector('h3');
                        const name = h3 ? h3.textContent.trim() : ('Paket ' + (i + 1));
                        const isHaji = card.dataset.haji === 'true';
                        let prices;
                        if (!isHaji) {
                            const fmt = function (v) {
                                if (!v) return '';
                                const num = Math.round(parseFloat(v) * 1000000);
                                return 'Rp' + num.toLocaleString('id-ID');
                            };
                            prices = {
                                quad: fmt(card.dataset.hargaQuad || card.dataset.harga),
                                triple: fmt(card.dataset.hargaTriple),
                                double: fmt(card.dataset.hargaDouble)
                            };
                        } else {
                            const priceEl = card.querySelector('.price');
                            const quadTxt = priceEl ? priceEl.textContent.replace(/^[^$]*/, '').trim() : '';
                            const dfacts = Array.from(card.querySelectorAll('.dfact'));
                            function findFact(label) {
                                const el = dfacts.find(function (f) {
                                    const s = f.querySelector('span');
                                    return s && s.textContent.trim() === label;
                                });
                                const strong = el ? el.querySelector('strong') : null;
                                return strong ? strong.textContent.trim() : '';
                            }
                            prices = {
                                quad: quadTxt,
                                triple: findFact('Triple Room'),
                                double: findFact('Double Room')
                            };
                        }
                        let jadwal = [];
                        try {
                            jadwal = JSON.parse(card.dataset.jadwal || '[]');
                        } catch (err) { jadwal = []; }
                        return { card: card, index: i, name: name, isHaji: isHaji, prices: prices, jadwal: jadwal };
                    });
                }

                function collectAllPackages() {
                    packages = collectPackages();
                }

                // ----- Dropdown Durasi (9/12/14/25 Hari, dari data-jadwal kartu) -----
                function populateDurasiSelect(pkg) {
                    durasiSelect.innerHTML = '';
                    if (!pkg || !pkg.jadwal.length) {
                        durasiSelect.innerHTML = '<option value="">-- Pilih Paket Dulu --</option>';
                        return;
                    }
                    const durasiList = [];
                    pkg.jadwal.forEach(function (j) {
                        if (durasiList.indexOf(j.durasi) === -1) durasiList.push(j.durasi);
                    });
                    durasiSelect.innerHTML = '<option value="">-- Pilih Durasi --</option>';
                    durasiList.forEach(function (d) {
                        const opt = document.createElement('option');
                        opt.value = d;
                        opt.textContent = d + ' Hari';
                        durasiSelect.appendChild(opt);
                    });
                    if (durasiList.length === 1) durasiSelect.value = durasiList[0];
                }

                // ----- Dropdown Tanggal (mengikuti durasi yang dipilih, hanya tanggal resmi di poster) -----
                function populateTanggalSelect(pkg, durasi) {
                    tanggalSelect.innerHTML = '';
                    if (!pkg || !durasi) {
                        tanggalSelect.innerHTML = '<option value="">-- Pilih Durasi Dulu --</option>';
                        return;
                    }
                    const dates = pkg.jadwal.filter(function (j) { return j.durasi === durasi; });
                    tanggalSelect.innerHTML = '<option value="">-- Pilih Tanggal --</option>';
                    dates.forEach(function (j) {
                        const opt = document.createElement('option');
                        opt.value = j.tanggal;
                        opt.textContent = j.tanggal;
                        tanggalSelect.appendChild(opt);
                    });
                    if (dates.length === 1) tanggalSelect.value = dates[0].tanggal;
                }

                // ----- Dropdown Tipe Kamar (harga otomatis sesuai paket) -----
                function populateKamarSelect(pkg) {
                    kamarSelect.innerHTML = '';
                    if (!pkg) {
                        kamarSelect.innerHTML = '<option value="">-- Pilih Paket Dulu --</option>';
                        return;
                    }
                    kamarSelect.innerHTML = '<option value="">-- Pilih Tipe Kamar --</option>';
                    const roomTypes = [
                        { value: 'quad', label: 'Quad Room' },
                        { value: 'triple', label: 'Triple Room' },
                        { value: 'double', label: 'Double Room' }
                    ];
                    roomTypes.forEach(function (r) {
                        const price = pkg.prices[r.value];
                        if (!price) return;
                        const opt = document.createElement('option');
                        opt.value = r.value;
                        opt.textContent = r.label + ' - ' + price;
                        kamarSelect.appendChild(opt);
                    });
                }

                function applyPackage(pkg) {
                    populateDurasiSelect(pkg);
                    populateTanggalSelect(pkg, durasiSelect.value || null);
                    populateKamarSelect(pkg);
                    if (pkg) {
                        paketDisplay.textContent = pkg.name;
                        paketDisplay.classList.remove('bk-empty');
                        paketIndexInput.value = String(pkg.index);
                    } else {
                        paketDisplay.textContent = '-- Belum ada paket dipilih --';
                        paketDisplay.classList.add('bk-empty');
                        paketIndexInput.value = '';
                    }
                }

                function selectPaketByIndex(index) {
                    applyPackage(packages[index]);
                }

                durasiSelect.addEventListener('change', function () {
                    const idx = paketIndexInput.value;
                    const pkg = idx === '' ? null : packages[parseInt(idx, 10)];
                    populateTanggalSelect(pkg, durasiSelect.value || null);
                });

                // ----- Buka / Tutup Modal -----
                window.openBookingModal = function (cardOrNull, rawPaketLabel) {
                    collectAllPackages();

                    let matchIndex = -1;
                    if (cardOrNull) {
                        matchIndex = packages.findIndex(function (p) { return p.card === cardOrNull; });
                    }
                    if (matchIndex === -1 && rawPaketLabel) {
                        // fallback: cocokkan berdasarkan potongan nama paket
                        const shortLabel = rawPaketLabel.split(' - ')[0].split('(')[0].trim().toLowerCase();
                        matchIndex = packages.findIndex(function (p) {
                            return shortLabel.indexOf(p.name.toLowerCase()) !== -1 || p.name.toLowerCase().indexOf(shortLabel) !== -1;
                        });
                    }

                    if (matchIndex !== -1) {
                        selectPaketByIndex(matchIndex);
                    } else {
                        applyPackage(null);
                    }

                    errorMsg.classList.remove('show');
                    lastFocusedEl = document.activeElement;
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    setTimeout(function () {
                        const namaInput = document.getElementById('bkNama');
                        if (namaInput) namaInput.focus();
                    }, 50);
                };

                function closeBookingModal() {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                    if (lastFocusedEl) lastFocusedEl.focus();
                }

                closeBtn.addEventListener('click', closeBookingModal);
                overlay.addEventListener('click', function (e) {
                    if (e.target === overlay) closeBookingModal();
                });
                document.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape' && overlay.classList.contains('active')) closeBookingModal();
                });

                // ----- Submit Form -> WhatsApp -----
                form.addEventListener('submit', function (e) {
                    e.preventDefault();

                    const nama = document.getElementById('bkNama').value.trim();
                    const whatsapp = document.getElementById('bkWhatsapp').value.trim();
                    const jumlah = document.getElementById('bkJumlah').value.trim();
                    const kota = document.getElementById('bkKota').value.trim();
                    const paketIdx = paketIndexInput.value;
                    const durasi = durasiSelect.value;
                    const tanggal = tanggalSelect.value;
                    const kamar = kamarSelect.value;
                    const catatan = document.getElementById('bkCatatan').value.trim();

                    if (!nama || !whatsapp || !jumlah || paketIdx === '' || !durasi || !tanggal || !kamar) {
                        errorMsg.classList.add('show');
                        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        return;
                    }
                    errorMsg.classList.remove('show');

                    const pkg = packages[parseInt(paketIdx, 10)];
                    const roomLabels = { quad: 'Quad Room', triple: 'Triple Room', double: 'Double Room' };
                    const roomPrice = pkg ? (pkg.prices[kamar] || '') : '';
                    const roomLabel = roomLabels[kamar];

                    let pesan = 'Assalamualaikum, saya ingin melakukan booking dengan detail berikut:\n\n';
                    pesan += '*Data Diri*\n';
                    pesan += 'Nama: ' + nama + '\n';
                    pesan += 'No. WhatsApp: ' + whatsapp + '\n';
                    pesan += 'Jumlah Jamaah: ' + jumlah + ' orang\n';
                    if (kota) pesan += 'Kota Domisili: ' + kota + '\n';
                    pesan += '\n*Paket & Jadwal*\n';
                    pesan += 'Paket: ' + (pkg ? pkg.name : '-') + '\n';
                    pesan += 'Lama Perjalanan: ' + durasi + ' Hari\n';
                    pesan += 'Tanggal Keberangkatan: ' + tanggal + '\n';
                    pesan += '\n*Tipe Kamar*\n';
                    pesan += roomLabel + (roomPrice ? ' - ' + roomPrice : '') + '\n';
                    if (catatan) pesan += '\n*Catatan Tambahan*\n' + catatan + '\n';
                    pesan += '\nMohon dibantu untuk proses booking dan pendaftarannya. Jika ada info tambahan yang perlu saya lengkapi, mohon diinfokan ya. Terima kasih.';

                    try {
                        trackEvent('booking_whatsapp', { paket: pkg ? pkg.name : '', durasi: durasi, kamar: kamar });
                    } catch (err) { /* aman diabaikan */ }

                    openWhatsApp(pesan);
                    closeBookingModal();
                    form.reset();
                    document.getElementById('bkJumlah').value = 1;
                    applyPackage(null);
                });
            })();



            // ========== MODAL DETAIL JADWAL KEBERANGKATAN ==========
            (function () {
                const overlay = document.getElementById('detailModalOverlay');
                const closeBtn = document.getElementById('detailModalClose');
                const imgEl = document.getElementById('detailModalImg');
                const badgeEl = document.getElementById('detailModalBadge');
                const zoomEl = document.getElementById('detailModalZoom');
                const eyebrowEl = document.getElementById('detailModalEyebrow');
                const titleEl = document.getElementById('detailModalTitle');
                const descEl = document.getElementById('detailModalDesc');
                const factsEl = document.getElementById('detailModalFacts');
                const specsEl = document.getElementById('detailModalSpecs');
                const priceEl = document.getElementById('detailModalPrice');
                const bookBtn = document.getElementById('detailModalBookBtn');
                const includesTitleEl = document.getElementById('detailModalIncludesTitle');
                const includesListEl = document.getElementById('detailModalIncludesList');
                if (!overlay) return;

                // Simpan fasilitas Umroh (bawaan HTML) agar bisa dikembalikan saat kartu Umroh dibuka lagi
                const defaultIncludesTitle = includesTitleEl ? includesTitleEl.textContent : 'Fasilitas Sudah Termasuk';
                const defaultIncludesHTML = includesListEl ? includesListEl.innerHTML : '';
                const checkIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6" /></svg>';
                const hajiIncludesHTML =
                    '<li>' + checkIcon + 'Tiket pesawat PP kelas ekonomi</li>' +
                    '<li>' + checkIcon + 'Akomodasi hotel &amp; tenda ber-AC di Arafah &amp; Mina</li>' +
                    '<li>' + checkIcon + 'Guide (Muthawif) &amp; dokter pendamping</li>' +
                    '<li>' + checkIcon + 'DAM Tamattu &amp; pengurusan dokumen visa</li>' +
                    '<li>' + checkIcon + 'Makan 3x sehari &amp; transportasi full AC</li>';

                window.showDepartureDetail = function (btn) {
                    const card = btn.closest('.departure-card');
                    if (!card) return;

                    const img = card.querySelector('.departure-media img');
                    const badge = card.querySelector('.departure-badge');
                    const eyebrow = card.querySelector('.departure-duration');
                    const title = card.querySelector('h3');
                    const metaText = card.querySelector('.departure-meta');
                    const facts = card.querySelectorAll('.dfact');
                    const priceBlock = card.querySelector('.price');
                    const bookingLink = card.querySelector('.departure-btn');
                    const chipEl = card.querySelector('.departure-date-chip');

                    const imgSrc = img ? img.getAttribute('src') : '';
                    imgEl.src = imgSrc;
                    imgEl.alt = title ? title.textContent.trim() : '';
                    if (zoomEl) zoomEl.href = imgSrc || '#';

                    if (badge) {
                        badgeEl.textContent = badge.textContent.trim();
                        badgeEl.style.display = 'inline-block';
                    } else {
                        badgeEl.style.display = 'none';
                    }
                    eyebrowEl.textContent = eyebrow ? eyebrow.textContent.trim() : '';
                    titleEl.textContent = title ? title.textContent.trim() : 'Detail Paket';
                    descEl.textContent = metaText ? metaText.textContent.trim() : '';

                    factsEl.innerHTML = '';
                    facts.forEach(f => {
                        const clone = f.cloneNode(true);
                        factsEl.appendChild(clone);
                    });

                    // ===== Spesifikasi Paket (lebih lengkap) =====
                    const specItems = [];
                    if (chipEl) {
                        const dTxt = (chipEl.dataset.day || '').trim();
                        const mTxt = (chipEl.dataset.month || '').trim();
                        if (mTxt) {
                            const dSymbolOnly = dTxt && !/[a-zA-Z0-9]/.test(dTxt);
                            const tglLabel = dSymbolOnly ? mTxt : `${dTxt} ${mTxt}`.trim();
                            specItems.push(`<strong>Tanggal Keberangkatan:</strong> ${tglLabel}`);
                        }
                    }
                    if (eyebrow) {
                        specItems.push(`<strong>Program:</strong> ${eyebrow.textContent.trim()}`);
                    }
                    facts.forEach(f => {
                        const label = f.querySelector('span') ? f.querySelector('span').textContent.trim() : '';
                        const value = f.querySelector('strong') ? f.querySelector('strong').textContent.trim() : '';
                        if (label && value) specItems.push(`<strong>${label}:</strong> ${value}`);
                    });
                    specItems.push(`<strong>Maskapai:</strong> ${card.dataset.maskapai || 'Garuda Indonesia'}`);
                    specItems.push('<strong>Kota Keberangkatan:</strong> Jakarta (Bandara Soekarno-Hatta)');

                    specsEl.innerHTML = specItems.map(item => `<li>${item}</li>`).join('');

                    // ===== Fasilitas Sudah Termasuk: tampilkan versi Haji Khusus jika kartu ini paket Haji =====
                    const isHaji = card.getAttribute('data-haji') === 'true';
                    if (includesTitleEl) includesTitleEl.textContent = isHaji ? 'Harga Sudah Termasuk' : defaultIncludesTitle;
                    if (includesListEl) includesListEl.innerHTML = isHaji ? hajiIncludesHTML : defaultIncludesHTML;

                    const itinKey = card.getAttribute('data-itin');

                    priceEl.innerHTML = priceBlock ? priceBlock.innerHTML : '';

                    bookBtn.onclick = function () {
                        closeDetailModal();
                        if (bookingLink) bookingLink.click();
                    };

                    // Simpan data paket yang sedang dibuka, dipakai oleh tombol "Unduh Brosur PDF"
                    window.currentDetailPackage = {
                        itinKey: itinKey,
                        title: titleEl.textContent.trim(),
                        badge: badgeEl.style.display !== 'none' ? badgeEl.textContent.trim() : '',
                        eyebrow: eyebrowEl.textContent.trim(),
                        desc: descEl.textContent.trim(),
                        specs: specItems,
                        priceHtml: priceEl.innerHTML,
                        imgSrc: imgSrc
                    };

                    // Lacak paket mana yang paling sering dilihat calon jamaah (GA4 view_item / Meta ViewContent)
                    try { if (typeof gtag === 'function') gtag('event', 'view_item', { item_name: window.currentDetailPackage.title }); } catch (err) { }
                    try { if (typeof fbq === 'function') fbq('track', 'ViewContent', { content_name: window.currentDetailPackage.title }); } catch (err) { }

                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                };

                function closeDetailModal() {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }

                closeBtn.addEventListener('click', closeDetailModal);
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) closeDetailModal();
                });
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && overlay.classList.contains('active')) closeDetailModal();
                });

                // ===== ZOOM POSTER: buka lightbox di halaman yang sama, bukan tab/halaman baru =====
                if (zoomEl) {
                    zoomEl.addEventListener('click', function (e) {
                        e.preventDefault();
                        const src = zoomEl.getAttribute('href');
                        openPosterLightbox(src);
                    });
                }
            })();

            // ========== LIGHTBOX POSTER (tanpa tab/halaman baru) ==========
            (function () {
                const lbOverlay = document.getElementById('posterLightboxOverlay');
                const lbImg = document.getElementById('posterLightboxImg');
                const lbClose = document.getElementById('posterLightboxClose');
                if (!lbOverlay || !lbImg) return;

                window.openPosterLightbox = function (src) {
                    if (!src || src === '#') return;
                    lbImg.src = src;
                    lbOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                };

                function closeLightbox() {
                    lbOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    lbImg.src = '';
                }

                lbClose.addEventListener('click', closeLightbox);
                lbOverlay.addEventListener('click', (e) => {
                    if (e.target === lbOverlay) closeLightbox();
                });
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && lbOverlay.classList.contains('active')) closeLightbox();
                });
            })();

            // ========== DOWNLOAD BROSUR PDF PER PAKET ==========
            // Membuat brosur PDF secara instan di browser (tanpa perlu siapkan file PDF manual
            // per paket) dari data paket yang sedang dibuka di modal detail. Jamaah bisa
            // langsung kirim PDF-nya ke keluarga lewat WhatsApp/email tanpa perlu screenshot.
            //
            // CATATAN TEKNIS (riwayat perbaikan):
            // 1) Awalnya template brosur ditaruh JAUH di luar layar (left:-9999px) supaya tidak
            //    kelihatan user — ini bikin html2canvas gagal "memotret" & hasil PDF blank putih.
            //    -> Diperbaiki: brosur dirender NORMAL di layar, ditutup overlay loading.
            // 2) Namun PDF masih tetap blank karena akar masalah sebenarnya ada di library
            //    html2pdf.js itu sendiri: sebelum memotret, html2pdf.js meng-CLONE elemen ke
            //    iframe tersembunyi, dan proses cloning ini punya bug resmi (diakui di GitHub
            //    issue-nya) yang membuat style CSS tidak terbawa dengan benar ke hasil clone,
            //    plus batas ukuran kanvas yang gampang terlampaui saat scale:2 dipakai —
            //    keduanya berujung pada PDF kosong.
            //    -> Diperbaiki: tidak lagi memakai html2pdf.js. html2canvas & jsPDF dipanggil
            //    LANGSUNG secara manual di bawah ini, memotret elemen brosur yang benar-benar
            //    tampil di layar (bukan hasil clone), lalu gambar hasil potretnya disusun
            //    sendiri jadi PDF multi-halaman jika perlu. Ini jauh lebih stabil di semua
            //    browser, termasuk browser HP (Chrome/Safari Android & iOS).
            (function () {
                const brosurBtn = document.getElementById('detailModalBrosurBtn');
                const brosurLabel = document.getElementById('detailModalBrosurBtnLabel');
                const overlay = document.getElementById('brosurOverlay');
                const template = document.getElementById('brosurTemplate');
                if (!brosurBtn || !template || !overlay) return;

                // Menyusun 1 gambar hasil potret html2canvas menjadi PDF A4, dipecah otomatis
                // jadi beberapa halaman kalau kontennya lebih panjang dari 1 halaman A4.
                function canvasToPdfAndSave(canvas, filename) {
                    const jsPDFCtor = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
                    if (!jsPDFCtor) throw new Error('jsPDF belum termuat');

                    const pdf = new jsPDFCtor('p', 'mm', 'a4');
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();

                    const imgWidth = pageWidth;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    const imgData = canvas.toDataURL('image/jpeg', 0.92);

                    let heightLeft = imgHeight;
                    let position = 0;

                    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;

                    while (heightLeft > 0) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }

                    pdf.save(filename);
                }

                function buildBrosurHtml(pkg) {
                    const specsHtml = (pkg.specs && pkg.specs.length)
                        ? '<ul class="bp-specs">' + pkg.specs.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>'
                        : '';

                    return '' +
                        '<div class="bp-page">' +
                        '  <div class="bp-header">' +
                        '    <img src="Image/Khalifah Bekasi.png" class="bp-logo" crossorigin="anonymous" onerror="this.style.display=\'none\'" />' +
                        '    <div class="bp-header-text"><div class="bp-brand">Khalifah Asia Bekasi</div><div class="bp-tagline">Umroh &amp; Haji Khusus Berizin Resmi Kemenag RI</div></div>' +
                        '  </div>' +
                        (pkg.imgSrc ? '  <img src="' + pkg.imgSrc + '" class="bp-poster" crossorigin="anonymous" onerror="this.style.display=\'none\'" />' : '') +
                        '  <div class="bp-badge-row">' + (pkg.badge ? '<span class="bp-badge">' + pkg.badge + '</span>' : '') + (pkg.eyebrow ? '<span class="bp-eyebrow">' + pkg.eyebrow + '</span>' : '') + '</div>' +
                        '  <h1 class="bp-title">' + pkg.title + '</h1>' +
                        '  <p class="bp-desc">' + (pkg.desc || '') + '</p>' +
                        '  <div class="bp-price-box">' + pkg.priceHtml + '</div>' +
                        '  <h3 class="bp-section-title">Spesifikasi Paket</h3>' +
                        specsHtml +
                        '  <div class="bp-footer">' +
                        '    <div><strong>WhatsApp:</strong> +62 817-8435-31 &nbsp;|&nbsp; <strong>Email:</strong> info@khalifahasia.co.id</div>' +
                        '    <div class="bp-footer-note">Brosur ini dibuat otomatis dari khalifahasiabekasi.co.id — harga &amp; jadwal dapat berubah, mohon konfirmasi ulang ke tim kami sebelum mendaftar.</div>' +
                        '  </div>' +
                        '</div>';
                }

                // Tunggu semua <img> di dalam elemen selesai dimuat (berhasil ATAU gagal),
                // supaya html2canvas tidak "memotret" sebelum gambar sempat tampil.
                function waitForImages(el) {
                    const imgs = Array.from(el.querySelectorAll('img'));
                    if (!imgs.length) return Promise.resolve();
                    return Promise.all(imgs.map(function (img) {
                        if (img.complete) return Promise.resolve();
                        return new Promise(function (resolve) {
                            img.addEventListener('load', resolve, { once: true });
                            img.addEventListener('error', resolve, { once: true });
                            // Jaga-jaga kalau event tidak pernah terpicu (koneksi sangat lambat)
                            setTimeout(resolve, 4000);
                        });
                    }));
                }

                brosurBtn.addEventListener('click', function () {
                    const pkg = window.currentDetailPackage;
                    if (!pkg || typeof html2canvas === 'undefined') return;

                    brosurBtn.disabled = true;
                    const originalLabel = brosurLabel.textContent;
                    brosurLabel.textContent = 'Menyiapkan PDF...';

                    template.innerHTML = buildBrosurHtml(pkg);
                    overlay.classList.add('active');

                    const safeName = pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                    function finish() {
                        overlay.classList.remove('active');
                        brosurBtn.disabled = false;
                        brosurLabel.textContent = originalLabel;
                        template.innerHTML = '';
                    }

                    waitForImages(template).then(function () {
                        // Tunggu 2 frame render browser supaya layout & paint elemen brosur
                        // benar-benar selesai sebelum dipotret (jaga-jaga di HP yang lebih lambat).
                        return new Promise(function (resolve) {
                            requestAnimationFrame(function () { requestAnimationFrame(resolve); });
                        });
                    }).then(function () {
                        // scale dibatasi max 2 dan disesuaikan lebar elemen, supaya kanvas hasil
                        // potret tidak melebihi batas ukuran kanvas yang didukung browser HP
                        // (ini penyebab utama PDF blank sebelumnya).
                        const scale = Math.min(2, 1600 / template.offsetWidth);
                        return html2canvas(template, {
                            scale: scale > 0 ? scale : 1.5,
                            useCORS: true,
                            allowTaint: false,
                            backgroundColor: '#ffffff',
                            windowWidth: template.scrollWidth,
                            windowHeight: template.scrollHeight
                        });
                    }).then(function (canvas) {
                        canvasToPdfAndSave(canvas, 'Brosur-' + (safeName || 'paket-umroh') + '.pdf');
                    }).then(function () {
                        finish();
                        // Lacak brosur mana yang paling banyak diunduh (sinyal minat serius calon jamaah)
                        try { if (typeof gtag === 'function') gtag('event', 'download_brosur', { item_name: pkg.title }); } catch (err) { }
                        try { if (typeof fbq === 'function') fbq('trackCustom', 'DownloadBrosur', { content_name: pkg.title }); } catch (err) { }
                    }).catch(function (err) {
                        console.warn('Gagal membuat brosur PDF:', err);
                        finish();
                        alert('Maaf, brosur PDF gagal dibuat. Silakan coba lagi atau hubungi kami via WhatsApp.');
                    });
                });
            })();

            // ========== MODAL: LIHAT SEMUA GALERI PER PROGRAM (tombol "Lihat semua galeri pada program ini") ==========
            (function () {
                const overlay = document.getElementById('programGalleryOverlay');
                const modal = overlay ? overlay.querySelector('.program-gallery-modal') : null;
                const closeBtn = document.getElementById('programGalleryClose');
                const titleEl = document.getElementById('programGalleryTitle');
                const descEl = document.getElementById('programGalleryDesc');
                const gridEl = document.getElementById('programGalleryGrid');
                const buttons = document.querySelectorAll('.gallery-view-all-btn');
                if (!overlay || !gridEl || !buttons.length) return;
                const programGalleries = {
                    thaif: {
                        title: 'Umroh Plus Thaif',
                        desc: 'Nikmati perjalanan ibadah Umroh sekaligus menjelajahi keindahan dan kesejukan Kota Thaif bersama jamaah Khalifah Asia.',
                        images: ['Umroh Reguler Plus Thaif/fotbar10.jpeg', 'Umroh Reguler Plus Thaif/fotbar5.jpeg', 'Umroh Reguler Plus Thaif/fotbar6.jpeg', 'Umroh Reguler Plus Thaif/fotbar7.jpeg', 'Umroh Reguler Plus Thaif/fotbar8.jpeg', 'Umroh Reguler Plus Thaif/fotbar9.jpeg']
                    },
                    turki: {
                        title: 'Umroh Plus Turki',
                        desc: 'Perjalanan ibadah yang bermakna sekaligus menjelajahi keindahan sejarah dan budaya Islam di Turki',
                        images: ['Umroh Plus Turki/galerikami11.jpeg', 'Umroh Plus Turki/galerikami7.jpeg', 'Umroh Plus Turki/galerikami8.jpeg', 'Umroh Plus Turki/galerikami9.jpeg', 'Umroh Plus Turki/galerikami10.jpeg', 'Umroh Plus Turki/galerikami11.jpeg']
                    },
                    ramadhan: {
                        title: 'Umroh Reguler',
                        desc: 'Wujudkan perjalanan ibadah Umroh yang aman, nyaman, dan penuh makna bersama pendampingan jamaah Khalifah Asia.',
                        images: ['Umroh Reguler/fotbar1.jpeg', 'Umroh Reguler/fotbar2.jpeg', 'Umroh Reguler/fotbar3.jpeg', 'Umroh Reguler/fotbar4.jpeg', 'Umroh Reguler/fotbar5.jpeg', 'Umroh Reguler/fotbar6.jpeg']
                    },
                    dubai: {
                        title: 'Umroh Plus Dubai',
                        desc: 'Saksikan gemerlap kota modern di tengah gurun — dokumentasi perjalanan jamaah Khalifah Asia.',
                        images: ['Image/galerikami1.jpeg', 'Image/fotbar2.jpeg', 'Image/galerikami4.jpeg', 'Image/galeri7.jpg', 'Image/fotbar1.jpeg', 'Image/galerikami6.jpeg']
                    },
                    oman: {
                        title: 'Umroh Plus Oman',
                        desc: 'Nikmati pesona Wahiba Sands dan kemegahan Masjid Sultan Qaboos — dokumentasi perjalanan jamaah Khalifah Asia.',
                        images: ['Image/fotbar2.jpeg', 'Image/galerikami4.jpeg', 'Image/fotbar8.jpeg', 'Image/galerikami10.jpeg', 'Image/galeri7.jpg', 'Image/galerikami1.jpeg']
                    },
                    mesir: {
                        title: 'Umroh Plus Mesir',
                        desc: 'Saksikan keajaiban Piramida Giza dan Sphinx yang megah — dokumentasi perjalanan jamaah Khalifah Asia.',
                        images: ['Image/galeri7.jpg', 'Image/galerikami3.jpeg', 'Image/fotbar4.jpeg', 'Image/galerikami6.jpeg', 'Image/fotbar5.jpeg', 'Image/galerikami1.jpeg']
                    },
                    andalusia: {
                        title: 'Umroh Plus Andalusia',
                        desc: 'Kagumi jejak peradaban Islam di Cordoba dan Granada — dokumentasi perjalanan jamaah Khalifah Asia.',
                        images: ['Image/fotbar8.jpeg', 'Image/galerikami4.jpeg', 'Image/galerikami10.jpeg', 'Image/fotbar1.jpeg', 'Image/galerikami3.jpeg', 'Image/galeri7.jpg']
                    },
                    uzbekistan: {
                        title: 'Umroh Plus Uzbekistan',
                        desc: 'Telusuri jejak peradaban Islam di Samarkand dan Bukhara — dokumentasi perjalanan jamaah Khalifah Asia.',
                        images: ['Image/galerikami4.jpeg', 'Image/fotbar5.jpeg', 'Image/galerikami6.jpeg', 'Image/galerikami1.jpeg', 'Image/fotbar2.jpeg', 'Image/galerikami10.jpeg']
                    }
                };

                let lastFocused = null;

                function renderGrid(images) {
                    gridEl.innerHTML = '';
                    images.forEach(function (src) {
                        const img = document.createElement('img');
                        img.src = src;
                        img.loading = 'lazy';
                        img.decoding = 'async';
                        img.alt = (titleEl ? titleEl.textContent : 'Galeri') + ' - Khalifah Asia Bekasi';
                        img.onerror = function () { this.style.display = 'none'; };
                        gridEl.appendChild(img);
                    });
                }

                function openProgramGallery(programKey) {
                    const data = programGalleries[programKey];
                    if (!data) return;
                    if (titleEl) titleEl.textContent = data.title;
                    if (descEl) descEl.textContent = data.desc;
                    renderGrid(data.images);

                    lastFocused = document.activeElement;
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    if (closeBtn) closeBtn.focus();
                }

                function closeProgramGallery() {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                    if (lastFocused) lastFocused.focus();
                }

                buttons.forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        const programKey = btn.getAttribute('data-program');
                        openProgramGallery(programKey);
                    });
                });

                if (closeBtn) closeBtn.addEventListener('click', closeProgramGallery);
                overlay.addEventListener('click', function (e) {
                    if (e.target === overlay) closeProgramGallery();
                });
                document.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape' && overlay.classList.contains('active')) closeProgramGallery();
                });
            })();

            // ---- FILTER JELAJAH ----
            const grid = document.getElementById('jelajahGrid');
            const filterNegara = document.getElementById('filterNegara');
            const filterDurasi = document.getElementById('filterDurasi');
            const resetBtn = document.getElementById('btnResetJelajah');

            function applyFilter() {
                if (!grid) return;
                const cards = grid.querySelectorAll('.jelajah-card');

                const negaraVal = filterNegara ? filterNegara.value : 'all';
                const durasiVal = filterDurasi ? filterDurasi.value : 'all';

                cards.forEach(card => {
                    const negara = card.getAttribute('data-negara') || '';
                    const durasi = card.getAttribute('data-durasi') || '';

                    const matchNegara = (negaraVal === 'all') || (negara === negaraVal);
                    const matchDurasi = (durasiVal === 'all') || (durasi === durasiVal);

                    card.style.display = (matchNegara && matchDurasi) ? '' : 'none';
                });
            }

            if (filterNegara) filterNegara.addEventListener('change', applyFilter);
            if (filterDurasi) filterDurasi.addEventListener('change', applyFilter);
            if (resetBtn) resetBtn.addEventListener('click', () => {
                if (filterNegara) filterNegara.value = 'all';
                if (filterDurasi) filterDurasi.value = 'all';
                applyFilter();
            });

            // ---- COUNTDOWN KEBERANGKATAN TERDEKAT ----
            (function () {
                const jadwalBox = document.querySelector('.jadwal-countdown');

                function tick() {
                    if (jadwalBox) {
                        const target = new Date(jadwalBox.getAttribute('data-target')).getTime();
                        const diff = target - Date.now();
                        renderJadwal(diff);
                    }
                }

                function renderJadwal(diff) {
                    const daysEl = document.getElementById('jcdDays');
                    const hoursEl = document.getElementById('jcdHours');
                    const minEl = document.getElementById('jcdMinutes');
                    const secEl = document.getElementById('jcdSeconds');
                    if (!daysEl) return;
                    if (diff <= 0) {
                        daysEl.textContent = '00';
                        hoursEl.textContent = '00';
                        minEl.textContent = '00';
                        secEl.textContent = '00';
                        return;
                    }
                    const d = Math.floor(diff / 86400000);
                    const h = Math.floor((diff % 86400000) / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    daysEl.textContent = String(d).padStart(2, '0');
                    hoursEl.textContent = String(h).padStart(2, '0');
                    minEl.textContent = String(m).padStart(2, '0');
                    secEl.textContent = String(s).padStart(2, '0');
                }

                tick();
                setInterval(tick, 1000);
            })();

            // ---- LIVE CHAT WIDGET MENGAMBANG ----
            (function () {
                const widget = document.getElementById('livechatWidget');
                const toggleBtn = document.getElementById('livechatToggle');
                const closeBtn = document.getElementById('livechatClose');
                const panel = document.getElementById('livechatPanel');
                if (!widget || !toggleBtn) return;

                // Lacak setiap klik tombol WhatsApp mengambang sebagai sinyal "Contact"
                toggleBtn.addEventListener('click', function () {
                    try { if (typeof gtag === 'function') gtag('event', 'contact', { method: 'whatsapp_floating' }); } catch (err) { }
                    try { if (typeof fbq === 'function') fbq('track', 'Contact'); } catch (err) { }
                });

                function openChat() {
                    widget.classList.add('open');
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    if (panel) panel.setAttribute('aria-hidden', 'false');
                }

                function closeChat() {
                    widget.classList.remove('open');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    if (panel) panel.setAttribute('aria-hidden', 'true');
                }

                toggleBtn.addEventListener('click', function () {
                    widget.classList.contains('open') ? closeChat() : openChat();
                });
                if (closeBtn) closeBtn.addEventListener('click', closeChat);

                document.addEventListener('click', function (e) {
                    if (widget.classList.contains('open') && !widget.contains(e.target)) {
                        closeChat();
                    }
                });
                document.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape') closeChat();
                });

                // Auto-buka sekali setelah beberapa saat untuk menarik perhatian (hanya sekali per sesi)
                if (!sessionStorage.getItem('livechatAutoShown')) {
                    setTimeout(function () {
                        if (!widget.classList.contains('open')) {
                            toggleBtn.classList.add('livechat-attention');
                        }
                        sessionStorage.setItem('livechatAutoShown', '1');
                    }, 6000);
                }
            })();

            // ---- COPY NOMOR REKENING ----
            document.querySelectorAll('.rekening-copy-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const targetId = btn.getAttribute('data-copy-target');
                    const el = document.getElementById(targetId);
                    if (!el) return;
                    const text = el.textContent.trim();
                    const finish = function () {
                        const label = btn.querySelector('span');
                        const original = label ? label.textContent : '';
                        btn.classList.add('copied');
                        if (label) label.textContent = 'Tersalin!';
                        setTimeout(function () {
                            btn.classList.remove('copied');
                            if (label) label.textContent = original || 'Salin';
                        }, 1800);
                    };
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text).then(finish).catch(finish);
                    } else {
                        const tmp = document.createElement('textarea');
                        tmp.value = text;
                        document.body.appendChild(tmp);
                        tmp.select();
                        try { document.execCommand('copy'); } catch (e) { }
                        document.body.removeChild(tmp);
                        finish();
                    }
                });
            });

            // ---- WA BUTTON (pakai WhatsApp wa.me) ----
            function openWhatsApp(message) {
                const phone = '62817843531'; // <-- samakan dengan nomor di website kamu (tanpa +)
                const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
            }

            document.addEventListener('click', (e) => {
                const waBtn = e.target.closest('.btn-wa');
                if (waBtn) {
                    const msg = waBtn.getAttribute('data-wa-text') || 'Halo Khalifah Asia Bekasi, saya ingin konsultasi paket.';
                    openWhatsApp(msg);
                }

                const detailBtn = e.target.closest('.btn-detail');
                if (detailBtn) {
                    const title = detailBtn.getAttribute('data-detail-title') || 'Detail Paket';
                    const body = detailBtn.getAttribute('data-detail-body') || '';
                    showModal(title, body);
                }
            });

            // ---- MODAL DETAIL ----
            const modal = document.getElementById('detailModal');
            const modalTitle = document.getElementById('detailModalTitle');
            const modalBody = document.getElementById('detailModalBody');
            const closeBtn = document.getElementById('modalCloseBtn');

            function showModal(title, body) {
                if (!modal) return;
                modalTitle.textContent = title;
                modalBody.textContent = body;
                modal.classList.add('show');
                modal.setAttribute('aria-hidden', 'false');
            }

            function hideModal() {
                if (!modal) return;
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
            }

            if (closeBtn) closeBtn.addEventListener('click', hideModal);
            if (modal) modal.addEventListener('click', (e) => {
                if (e.target === modal) hideModal();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') hideModal();
            });

            // ---- FORM JELAJAH -> WA ----
            const form = document.getElementById('formJelajah');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();

                    const nama = document.getElementById('namaJ')?.value?.trim() || '';
                    const whatsapp = document.getElementById('whatsappJ')?.value?.trim() || '';
                    const tujuan = document.getElementById('negaraJ')?.value || '';
                    const durasi = document.getElementById('durasiJ')?.value || '';
                    const budget = document.getElementById('budgetJ')?.value?.trim() || '';

                    const msg =
                        `Halo Khalifah Asia Bekasi, saya ${nama}.\n` +
                        `No WA: ${whatsapp}\n` +
                        `Saya ingin rekomendasi paket Wisata Halal / Jelajah Dunya.\n` +
                        `Tujuan: ${tujuan}\n` +
                        `Durasi: ${durasi}\n` +
                        (budget ? `Budget: ${budget}\n` : '') +
                        `Mohon info ketersediaan jadwal dan estimasi biaya.`;

                    openWhatsApp(msg);
                });
            }

    // ===== Blok script #4 dari index.html =====
    const WA_PHONE = "62817843531";

            // ========== 3b. FILTER & SORT JADWAL KEBERANGKATAN ==========
            (function () {
                const filterBulan = document.getElementById("filterBulanJadwal");
                const filterJenis = document.getElementById("filterJenisJadwal");
                const filterHarga = document.getElementById("filterHargaJadwal");
                const sortPaket = document.getElementById("sortPaketJadwal");
                const resetBtn = document.getElementById("jadwalFilterReset");
                const emptyResetBtn = document.getElementById("jadwalEmptyReset");
                const emptyState = document.getElementById("jadwalEmptyState");
                const grid = document.getElementById("departureGrid");
                if (!grid) return;

                function getCards() {
                    return Array.from(grid.querySelectorAll(".departure-card"));
                }

                function applyJadwalFilter() {
                    const cards = getCards();
                    const bulanVal = filterBulan ? filterBulan.value : "";
                    const jenisVal = filterJenis ? filterJenis.value : "";
                    const hargaVal = filterHarga ? filterHarga.value : "";
                    const sortVal = sortPaket ? sortPaket.value : "";

                    let hargaMin = 0, hargaMax = Infinity;
                    if (hargaVal) {
                        const parts = hargaVal.split("-");
                        hargaMin = parseFloat(parts[0]);
                        hargaMax = parseFloat(parts[1]);
                    }

                    let visibleCount = 0;

                    cards.forEach(function (card) {
                        const bulan = (card.getAttribute("data-bulan") || "").toLowerCase();
                        const jenis = (card.getAttribute("data-jenis") || "").toLowerCase();
                        const harga = parseFloat(card.getAttribute("data-harga") || "0");

                        const matchBulan = !bulanVal || bulan.split(" ").includes(bulanVal);
                        const matchJenis = !jenisVal || jenis === jenisVal;
                        const matchHarga = harga >= hargaMin && harga <= hargaMax;

                        const visible = matchBulan && matchJenis && matchHarga;
                        card.classList.toggle("is-filtered-out", !visible);
                        if (visible) visibleCount++;
                    });

                    if (sortVal) {
                        const sorted = getCards().sort(function (a, b) {
                            const ha = parseFloat(a.getAttribute("data-harga") || "0");
                            const hb = parseFloat(b.getAttribute("data-harga") || "0");
                            return sortVal === "termurah" ? ha - hb : hb - ha;
                        });
                        sorted.forEach(function (card) { grid.appendChild(card); });
                    }

                    if (emptyState) emptyState.classList.toggle("is-visible", visibleCount === 0);
                }

                function resetJadwalFilter() {
                    [filterBulan, filterJenis, filterHarga, sortPaket].forEach(function (el) {
                        if (!el) return;
                        el.value = "";
                        el.dispatchEvent(new Event("change", { bubbles: true }));
                    });
                    applyJadwalFilter();

                    const toolbar = document.querySelector(".paket-toolbar");
                    if (resetBtn) {
                        resetBtn.classList.remove("is-resetting");
                        void resetBtn.offsetWidth;
                        resetBtn.classList.add("is-resetting");
                    }
                    if (toolbar) {
                        toolbar.classList.remove("is-reset-flash");
                        void toolbar.offsetWidth;
                        toolbar.classList.add("is-reset-flash");
                    }
                }

                [filterBulan, filterJenis, filterHarga, sortPaket].forEach(function (el) {
                    if (el) el.addEventListener("change", applyJadwalFilter);
                });
                if (resetBtn) resetBtn.addEventListener("click", resetJadwalFilter);
                if (emptyResetBtn) emptyResetBtn.addEventListener("click", resetJadwalFilter);
            })();

            // ========== 3c. CUSTOM ANIMATED DROPDOWN (menggantikan tampilan <select> filter) ==========
            (function () {
                const caretSvg = '<svg class="custom-select-caret" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

                function closeAllExcept(exceptWrapper) {
                    document.querySelectorAll(".custom-select.is-open").forEach(function (w) {
                        if (w === exceptWrapper) return;
                        w.classList.remove("is-open");
                        const t = w.querySelector(".custom-select-trigger");
                        if (t) t.setAttribute("aria-expanded", "false");
                    });
                }

                function enhanceSelect(select) {
                    if (!select || select.dataset.enhanced) return;
                    select.dataset.enhanced = "true";

                    const wrapper = document.createElement("div");
                    wrapper.className = "custom-select";

                    const trigger = document.createElement("button");
                    trigger.type = "button";
                    trigger.className = "custom-select-trigger";
                    trigger.setAttribute("aria-haspopup", "listbox");
                    trigger.setAttribute("aria-expanded", "false");
                    trigger.innerHTML = '<span class="custom-select-value"></span>' + caretSvg;

                    const label = select.closest(".paket-filter-field") ? select.closest(".paket-filter-field").querySelector("label") : null;
                    if (label) trigger.setAttribute("aria-label", label.textContent.trim());

                    const panel = document.createElement("ul");
                    panel.className = "custom-select-panel";
                    panel.setAttribute("role", "listbox");

                    function renderOptions() {
                        panel.innerHTML = "";
                        Array.from(select.options).forEach(function (opt, i) {
                            const li = document.createElement("li");
                            li.className = "custom-select-option";
                            li.setAttribute("role", "option");
                            li.setAttribute("tabindex", "-1");
                            li.dataset.value = opt.value;
                            li.textContent = opt.textContent;
                            li.style.transitionDelay = Math.min(i * 25, 200) + "ms";
                            if (opt.value === select.value) li.classList.add("is-selected");
                            panel.appendChild(li);
                        });
                    }
                    renderOptions();

                    select.insertAdjacentElement("afterend", wrapper);
                    select.classList.add("custom-select-native");
                    wrapper.appendChild(select);
                    wrapper.appendChild(trigger);
                    wrapper.appendChild(panel);

                    function updateTriggerLabel() {
                        const selectedOpt = select.options[select.selectedIndex];
                        trigger.querySelector(".custom-select-value").textContent = selectedOpt ? selectedOpt.textContent : "";
                    }
                    updateTriggerLabel();

                    function openPanel() {
                        closeAllExcept(wrapper);
                        wrapper.classList.add("is-open");
                        trigger.setAttribute("aria-expanded", "true");
                    }
                    function closePanel() {
                        wrapper.classList.remove("is-open");
                        trigger.setAttribute("aria-expanded", "false");
                    }

                    trigger.addEventListener("click", function () {
                        if (wrapper.classList.contains("is-open")) closePanel();
                        else openPanel();
                    });

                    panel.addEventListener("click", function (e) {
                        const li = e.target.closest(".custom-select-option");
                        if (!li) return;
                        select.value = li.dataset.value;
                        panel.querySelectorAll(".custom-select-option").forEach(function (o) {
                            o.classList.toggle("is-selected", o === li);
                        });
                        updateTriggerLabel();
                        closePanel();
                        trigger.classList.remove("is-pulsing");
                        void trigger.offsetWidth;
                        trigger.classList.add("is-pulsing");
                        select.dispatchEvent(new Event("change", { bubbles: true }));
                    });

                    trigger.addEventListener("keydown", function (e) {
                        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                            e.preventDefault();
                            openPanel();
                            const active = panel.querySelector(".custom-select-option.is-selected") || panel.querySelector(".custom-select-option");
                            if (active) active.focus();
                        } else if (e.key === "Escape") {
                            closePanel();
                        }
                    });

                    panel.addEventListener("keydown", function (e) {
                        const options = Array.from(panel.querySelectorAll(".custom-select-option"));
                        const idx = options.indexOf(document.activeElement);
                        if (e.key === "ArrowDown") {
                            e.preventDefault();
                            (options[idx + 1] || options[0]).focus();
                        } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            (options[idx - 1] || options[options.length - 1]).focus();
                        } else if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (document.activeElement && document.activeElement.classList.contains("custom-select-option")) {
                                document.activeElement.click();
                                trigger.focus();
                            }
                        } else if (e.key === "Escape") {
                            closePanel();
                            trigger.focus();
                        }
                    });

                    document.addEventListener("click", function (e) {
                        if (!wrapper.contains(e.target)) closePanel();
                    });

                    // sinkronkan tampilan jika value select diubah lewat kode lain (mis. tombol Reset Filter)
                    select.addEventListener("change", function () {
                        updateTriggerLabel();
                        panel.querySelectorAll(".custom-select-option").forEach(function (o) {
                            o.classList.toggle("is-selected", o.dataset.value === select.value);
                        });
                    });
                }

                document.querySelectorAll(".paket-filter-field select").forEach(enhanceSelect);
            })();

            // ========== 5. FAQ ACCORDION ==========
            (function () {
                const items = document.querySelectorAll(".faq-item");
                items.forEach(function (item) {
                    const head = item.querySelector(".faq-item-head");
                    const body = item.querySelector(".faq-item-body");
                    if (!head || !body) return;

                    head.addEventListener("click", function () {
                        const isOpen = head.getAttribute("aria-expanded") === "true";

                        items.forEach(function (other) {
                            const otherHead = other.querySelector(".faq-item-head");
                            const otherBody = other.querySelector(".faq-item-body");
                            if (otherHead && otherHead !== head) {
                                otherHead.setAttribute("aria-expanded", "false");
                                otherBody.style.maxHeight = null;
                            }
                        });

                        head.setAttribute("aria-expanded", isOpen ? "false" : "true");
                        body.style.maxHeight = isOpen ? null : body.scrollHeight + "px";
                    });
                });
            })();

            // ========== 6. STICKY MOBILE CTA BAR ==========
            (function () {
                const bar = document.getElementById("mobileStickyCta");
                if (!bar) return;
                const heroSection = document.querySelector(".hero") || document.querySelector("header");
                let hideTimeout = null;

                function handleScroll() {
                    const scrollY = window.scrollY;
                    const showThreshold = heroSection ? heroSection.offsetHeight * 0.6 : 400;
                    const nearBottom = (window.innerHeight + scrollY) >= (document.body.scrollHeight - 200);

                    if (scrollY > showThreshold && !nearBottom) {
                        bar.classList.add("is-visible");
                    } else {
                        bar.classList.remove("is-visible");
                    }
                }

                window.addEventListener("scroll", function () {
                    if (hideTimeout) return;
                    hideTimeout = requestAnimationFrame(function () {
                        handleScroll();
                        hideTimeout = null;
                    });
                });
                handleScroll();
            })();

            // ========== 8. CEK STATUS PENDAFTARAN ==========
            const DATA_STATUS_JAMAAH = {
                "KAB-2026-001": { nama: "Ahmad Fauzi", paket: "Umroh Plus Turki", step: 2 },
                "KAB-2026-002": { nama: "Siti Aminah", paket: "Umroh Special Maulid Nabi", step: 4 },
            };

            (function () {
                const kodeInput = document.getElementById('statusKode');
                const checkBtn = document.getElementById('statusCheckBtn');
                const errorEl = document.getElementById('statusCheckError');
                const resultEl = document.getElementById('statusResult');
                const namaEl = document.getElementById('statusResultNama');
                const paketEl = document.getElementById('statusResultPaket');
                const fillEl = document.getElementById('statusProgressFill');
                const stepEls = document.querySelectorAll('.status-step');
                if (!checkBtn || !kodeInput) return;

                function checkStatus() {
                    const kode = kodeInput.value.trim().toUpperCase();
                    errorEl.classList.remove('is-visible');
                    resultEl.classList.remove('is-visible');
                    if (!kode) {
                        kodeInput.focus();
                        return;
                    }
                    const data = DATA_STATUS_JAMAAH[kode];
                    if (!data) {
                        errorEl.classList.add('is-visible');
                        return;
                    }
                    namaEl.textContent = data.nama;
                    paketEl.textContent = data.paket;
                    const pct = ((data.step - 1) / 3) * 100;
                    fillEl.style.width = pct + '%';
                    stepEls.forEach(function (el) {
                        const s = parseInt(el.getAttribute('data-step'), 10);
                        el.classList.toggle('is-done', s < data.step);
                        el.classList.toggle('is-active', s === data.step);
                    });
                    resultEl.classList.add('is-visible');
                    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }

                checkBtn.addEventListener('click', checkStatus);
                kodeInput.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        checkStatus();
                    }
                });
                // Error hilang otomatis begitu user mulai mengetik ulang
                kodeInput.addEventListener('input', function () {
                    errorEl.classList.remove('is-visible');
                });
            })();

            // ========== 9. GALERI PER KEBERANGKATAN (TAB SWITCH) ==========
            (function () {
                const tabs = document.querySelectorAll('.kg-tab');
                const panels = document.querySelectorAll('.kg-panel');
                if (!tabs.length || !panels.length) return;

                function activateTab(tab) {
                    if (!tab) return;
                    const target = tab.getAttribute('data-kg');

                    tabs.forEach(function (t) {
                        const isTarget = t === tab;
                        t.classList.toggle('is-active', isTarget);
                        t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
                        t.setAttribute('tabindex', isTarget ? '0' : '-1');
                    });

                    panels.forEach(function (panel) {
                        const match = panel.getAttribute('data-kg-panel') === target;
                        panel.hidden = !match;
                        panel.classList.toggle('is-active', match);
                    });
                }

                tabs.forEach(function (tab, i) {
                    tab.setAttribute('tabindex', tab.classList.contains('is-active') ? '0' : '-1');

                    tab.addEventListener('click', function () {
                        activateTab(tab);
                    });

                    // Navigasi keyboard kiri/kanan antar tab (aksesibilitas)
                    tab.addEventListener('keydown', function (e) {
                        let newIndex = null;
                        if (e.key === 'ArrowRight') newIndex = (i + 1) % tabs.length;
                        if (e.key === 'ArrowLeft') newIndex = (i - 1 + tabs.length) % tabs.length;
                        if (newIndex !== null) {
                            e.preventDefault();
                            tabs[newIndex].focus();
                            activateTab(tabs[newIndex]);
                        }
                    });
                });
            })();
            // ========== 10. MODAL VIDEO TESTIMONI (embed Google Drive, mendukung lebih dari 1 video) ==========
            (function () {
                const overlay = document.getElementById('videoEmbedModalOverlay');
                const closeBtn = document.getElementById('videoEmbedModalClose');
                const titleEl = document.getElementById('videoEmbedModalTitle');
                const triggers = document.querySelectorAll('.video-testi-btn[data-drive-id]');
                const player = document.getElementById('testimoniVideoPlayer');
                const playerBody = player ? player.closest('.video-embed-modal-body') : null;
                if (!overlay || !triggers.length) return;

                function openVideoModal(btn) {
                    const driveId = btn.getAttribute('data-drive-id');
                    const title = btn.getAttribute('data-title') || 'Testimoni Jamaah Kami';
                    // data-orientation="portrait" untuk video rekaman HP (vertikal),
                    // default landscape kalau atribut ini tidak diisi.
                    const orientation = btn.getAttribute('data-orientation') === 'portrait' ? 'portrait' : 'landscape';

                    if (titleEl) titleEl.textContent = title;

                    if (playerBody) {
                        playerBody.classList.toggle('is-portrait', orientation === 'portrait');
                        playerBody.classList.toggle('is-landscape', orientation === 'landscape');
                    }

                    if (player && driveId) {
                        player.src = 'https://drive.google.com/file/d/' + driveId + '/preview?autoplay=1';
                    }

                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    closeBtn.focus();
                }

                function closeVideoModal() {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                    if (player) player.src = ''; // stop pemutaran video saat modal ditutup
                }

                triggers.forEach(function (trigger) {
                    trigger.addEventListener('click', function () {
                        openVideoModal(trigger);
                    });
                });
                closeBtn.addEventListener('click', closeVideoModal);
                overlay.addEventListener('click', function (e) {
                    if (e.target === overlay) closeVideoModal();
                });
                document.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape' && overlay.classList.contains('active')) closeVideoModal();
                });
            })();

            // ========== 11. TESTIMONI CAROUSEL 3D (drag & auto-rotate) ==========
            (function () {
                const wrap = document.getElementById('jcTestimonial');
                const track = document.getElementById('jcTestimonials');
                const nav = document.getElementById('jcNavigation');
                if (!wrap || !track || !nav || typeof gsap === 'undefined') return;

                // Ganti/tambah testimoni jamaah di sini (nama, peran/paket, isi cerita)
                const testimonials = [
                    {
                        content: "Pelayanannya rapi dari awal daftar sampai pulang. Muthowif sabar membimbing setiap manasik. Sangat recommended!",
                        name: "Hj. Ratna W.",
                        role: "Umroh Reguler, 2025",
                        initial: "R"
                    },
                    {
                        content: "Hotel sangat dekat dengan Masjidil Haram, jalan kaki lima menit. Sangat membantu jamaah lansia. Terima kasih Khalifah Asia!",
                        name: "H. Fajar N.",
                        role: "Umroh Plus Turki, 2025",
                        initial: "F"
                    },
                    {
                        content: "Alhamdulillah Program Umroh Plus Thaif memberikan pengalaman ibadah yang sangat berkesan. Pelayanan dari tim Khalifah Asia sangat ramah, selalu membantu kebutuhan jamaah.",
                        name: "Hj. Sari A.",
                        role: "Umroh Plus Thaif, 2026",
                        initial: "S"
                    }
                ];

                function createBubble(data, rotation) {
                    const el = document.createElement('div');
                    el.className = 'jc-bubble';
                    el.style.setProperty('--jc-rotation', rotation + 'deg');
                    el.innerHTML =
                        '<div class="jc-quote-icon"><svg viewBox="0 0 32 24" fill="currentColor"><path d="M0 24V14.4C0 6.4 4.8 1.2 12.8 0l1.6 3.2C9.6 4.4 6.8 7.2 6.4 11.2H12.8V24H0zM17.6 24V14.4C17.6 6.4 22.4 1.2 30.4 0L32 3.2c-4.8 1.2-7.6 4-8 8H30.4V24H17.6z"/></svg></div>' +
                        '<div class="jc-stars"></div>' +
                        '<div class="jc-content">' + data.content + '</div>' +
                        '<div class="jc-person">' +
                        '<div class="jc-avatar">' + data.initial + '</div>' +
                        '<div class="jc-name">' + data.name + '</div>' +
                        '<div class="jc-role">' + data.role + '</div>' +
                        '</div>';
                    return el;
                }

                const rotationAmt = 360 / testimonials.length;
                let focused = 0;
                let paused = false;

                wrap.addEventListener('mouseenter', () => { paused = true; });
                wrap.addEventListener('mouseleave', () => { paused = false; });
                window.addEventListener('blur', () => { paused = true; });
                window.addEventListener('focus', () => { paused = false; });

                function mod(a, b) { return ((a % b) + b) % b; }
                function getFocusedIndex() { return mod(focused, testimonials.length); }

                const radius = 400 / (2 * Math.sin(Math.PI / testimonials.length));
                const distToEdge = Math.round(Math.sqrt(Math.max(radius * radius - 200 * 200, 0)) + 30);
                wrap.style.setProperty('--jc-distance', distToEdge + 'px');

                testimonials.forEach((t, i) => {
                    track.appendChild(createBubble(t, i * rotationAmt));
                    const dot = document.createElement('button');
                    dot.type = 'button';
                    dot.className = 'jc-nav-dot';
                    dot.setAttribute('aria-label', 'Testimoni ' + (i + 1));
                    dot.addEventListener('click', () => select(i));
                    nav.appendChild(dot);
                });

                let timeout;
                function update() {
                    gsap.to(track, { rotationY: -focused * rotationAmt, duration: 1, ease: 'power2.out' });
                    const children = track.children;
                    for (let i = 0; i < children.length; i++) {
                        const isFocused = getFocusedIndex() === i;
                        children[i].classList.toggle('jc-focused', isFocused);
                        if (nav.children[i]) nav.children[i].classList.toggle('jc-focused', isFocused);
                    }
                    if (timeout) clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        if (!paused) focused++;
                        update();
                    }, 5000);
                }

                function diff(a, b, c, d) {
                    return d === -1 ? mod(b - a, c) : mod(a - b, c);
                }

                function select(index, dir) {
                    index = mod(index, testimonials.length);
                    if (dir) {
                        focused += diff(index, getFocusedIndex(), testimonials.length, dir) * dir;
                    } else {
                        focused += index - getFocusedIndex();
                    }
                    update();
                }

                update();

                const arrowRight = document.getElementById('jcArrowRight');
                const arrowLeft = document.getElementById('jcArrowLeft');
                if (arrowRight) arrowRight.addEventListener('click', () => { focused++; update(); });
                if (arrowLeft) arrowLeft.addEventListener('click', () => { focused--; update(); });

                if (typeof Draggable !== 'undefined') {
                    let xPos, dragStartPos;
                    Draggable.create(wrap, {
                        onDragStart: (e) => {
                            if (e.touches) e.clientX = e.touches[0].clientX;
                            xPos = dragStartPos = Math.round(e.clientX);
                        },
                        onDrag: (e) => {
                            if (e.touches) e.clientX = e.touches[0].clientX;
                            gsap.to(track, { rotationY: '+=' + ((Math.round(e.clientX) - xPos) % 360) });
                            xPos = Math.round(e.clientX);
                        },
                        onDragEnd: () => {
                            const currentRotation = gsap.getProperty(track, 'rotationY') * -1;
                            const index = mod(Math.round(currentRotation / rotationAmt), testimonials.length);
                            select(index, xPos < dragStartPos ? 1 : -1);
                            gsap.set(wrap, { x: 0, y: 0 });
                        }
                    });
                }
            })();
}

// ============================================================
// HALAMAN: tentang.html
// ============================================================
if (document.body.dataset.page === "tentang") {
    // ===== Blok script #1 dari tentang.html =====
    // ========== HEADER SCROLL ==========
            const header = document.getElementById('header');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
            (function () {
                const DURATION = 5000; // 5 detik per foto
                const carousel = document.getElementById("heroCarousel");
                const dotsWrap = document.getElementById("heroCarouselDots");
                if (!carousel || !dotsWrap) return;

                const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
                if (slides.length === 0) return;

                let index = slides.findIndex((s) => s.classList.contains("is-active"));
                if (index < 0) index = 0;
                let timer = null;

                // Bangun titik navigasi (dots) — hanya jika ada lebih dari 1 foto
                if (slides.length <= 1) {
                    dotsWrap.style.display = "none";
                }
                slides.forEach((_, i) => {
                    const dot = document.createElement("button");
                    dot.type = "button";
                    dot.setAttribute("aria-label", `Tampilkan foto ${i + 1}`);
                    if (i === index) dot.classList.add("is-active");
                    dot.addEventListener("click", () => goTo(i, true));
                    dotsWrap.appendChild(dot);
                });
                const dots = Array.from(dotsWrap.children);

                function goTo(next, manual = false) {
                    if (next === index) return;
                    slides[index].classList.remove("is-active");
                    dots[index].classList.remove("is-active");
                    index = next;
                    slides[index].classList.add("is-active");
                    dots[index].classList.add("is-active");
                    if (manual) restart();
                }

                function nextSlide() {
                    goTo((index + 1) % slides.length);
                }

                function restart() {
                    if (timer) clearInterval(timer);
                    if (slides.length > 1) {
                        timer = setInterval(nextSlide, DURATION);
                    }
                }

                restart();
            })();

            // ========== FLOATING WHATSAPP BUTTON ==========
            (function () {
                const widget = document.getElementById('livechatWidget');
                const toggleBtn = document.getElementById('livechatToggle');
                if (!widget || !toggleBtn) return;

                // Lacak setiap klik tombol WhatsApp mengambang sebagai sinyal "Contact"
                toggleBtn.addEventListener('click', function () {
                    try { if (typeof gtag === 'function') gtag('event', 'contact', { method: 'whatsapp_floating' }); } catch (err) { }
                    try { if (typeof fbq === 'function') fbq('track', 'Contact'); } catch (err) { }
                });

                // Auto-tarik perhatian sekali setelah beberapa saat (hanya sekali per sesi)
                if (!sessionStorage.getItem('livechatAutoShown')) {
                    setTimeout(function () {
                        toggleBtn.classList.add('livechat-attention');
                        sessionStorage.setItem('livechatAutoShown', '1');
                    }, 6000);
                }
            })();

            // ========== MOBILE MENU ==========
            const hamburger = document.getElementById('hamburger');
            const drawer = document.getElementById('mobileDrawer');
            const overlay = document.getElementById('mobileOverlay');

            function toggleMenu() {
                const isOpen = drawer.classList.toggle('active');
                hamburger.classList.toggle('active');
                overlay.classList.toggle('active');
                hamburger.setAttribute('aria-expanded', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            }

            hamburger.addEventListener('click', toggleMenu);
            overlay.addEventListener('click', toggleMenu);
            drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', toggleMenu));

            // ========== SCROLL REVEAL ==========
            const revealElements = document.querySelectorAll('.reveal');
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -30px 0px'
            });
            revealElements.forEach(el => revealObserver.observe(el));

            // ========== DASHBOARD PANEL (Profil / Visi / Misi) ==========
            const dashButtons = document.querySelectorAll('.dash-nav-btn');
            const dashPanels = document.querySelectorAll('.dash-panel');

            function activateDashPanel(name, scroll = false) {
                dashButtons.forEach(b => b.classList.toggle('active', b.dataset.panel === name));
                dashPanels.forEach(p => p.classList.toggle('active', p.id === `panel-${name}`));
                if (scroll) {
                    document.getElementById('dashboard').scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }

            dashButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    activateDashPanel(btn.dataset.panel);
                    history.replaceState(null, '', `#${btn.dataset.panel}`);
                });
            });

            // Support direct links from navbar dropdown: tentang.html#visi, #misi, #profil, #pemandu
            function handleHash() {
                const hash = window.location.hash.replace('#', '');
                if (['profil', 'visi', 'misi', 'pemandu'].includes(hash)) {
                    activateDashPanel(hash, true);
                }
            }
            window.addEventListener('hashchange', handleHash);
            handleHash();

            // ========== MODAL: EMAIL (Footer) ==========
            (function () {
                const emailOverlay = document.getElementById('emailModalOverlay');
                const emailClose = document.getElementById('emailModalClose');
                const copyBtn = document.getElementById('copyEmailBtn');
                const copyMsg = document.getElementById('emailCopyMsg');
                const gmailLink = document.getElementById('gmailWebLink');
                const mailtoLink = document.getElementById('mailtoLink');

                const emailAddress = 'info@khalifahasia.co.id';
                const subject = 'Pertanyaan mengenai Khalifah Asia Bekasi';
                const body = 'Assalamualaikum, saya ingin bertanya mengenai Khalifah Asia Bekasi.';

                mailtoLink.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                gmailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                let lastFocusedEl = null;

                function openEmailModal(e) {
                    e.preventDefault();
                    lastFocusedEl = document.activeElement;
                    emailOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }

                function closeEmailModal() {
                    emailOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    if (lastFocusedEl) lastFocusedEl.focus();
                }

                emailClose.addEventListener('click', closeEmailModal);
                emailOverlay.addEventListener('click', (e) => {
                    if (e.target === emailOverlay) closeEmailModal();
                });
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && emailOverlay.classList.contains('active')) closeEmailModal();
                });

                copyBtn.addEventListener('click', () => {
                    const fallbackCopy = () => {
                        const tmp = document.createElement('input');
                        tmp.value = emailAddress;
                        document.body.appendChild(tmp);
                        tmp.select();
                        try {
                            document.execCommand('copy');
                        } catch (err) { }
                        document.body.removeChild(tmp);
                        showCopyMsg();
                    };

                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(emailAddress).then(showCopyMsg).catch(fallbackCopy);
                    } else {
                        fallbackCopy();
                    }
                });

                function showCopyMsg() {
                    copyMsg.textContent = 'Alamat email berhasil disalin!';
                    setTimeout(() => {
                        copyMsg.textContent = '';
                    }, 3000);
                }

                document.querySelectorAll('[data-email-trigger]').forEach(btn => {
                    btn.addEventListener('click', openEmailModal);
                });
            })();

            (function () {
                const galleryData = {
                    asep: { name: 'Ustad Asep Masdinar LC', photos: ['Image/jamaahustadasep1.jpeg', 'Image/jamaahustadasep2.jpeg', 'Image/jamaahustadasep3.jpeg', 'Image/jamaahustadasep4.jpeg'] },
                    ropi: { name: 'Ustad Ropii', photos: ['Image/jamaahustadropii1.jpeg', 'Image/jamaahustadropii2.jpeg', 'Image/jamaahustadropii3.jpeg', 'Image/jamaahustadropii4.jpeg'] },
                    mahmud: { name: 'Mahmud Abdurachman Al-Hafizh', photos: ['Image/jamaahustadmahmud1.jpeg', 'Image/jamaahustadmahmud2.jpeg', 'Image/jamaahustadmahmud3.jpeg', 'Image/jamaahustadmahmud4.jpeg'] },
                    kodir: { name: 'Muhamad Kodir', photos: ['Image/jamaahustadkodir1.jpeg', 'Image/galeri-aburachman-2.jpg', 'Image/galeri-aburachman-3.jpg', 'Image/galeri-aburachman-4.jpg'] },
                    dindin: { name: 'Ustad Dindin Komarudin', photos: ['Image/jamaahustaddindin1.jpeg', 'Image/jamaahustaddindin2.jpeg', 'Image/jamaahustaddindin3.jpeg', 'Image/jamaahustaddindin4.jpeg'] }
                };

                const galleryOverlay = document.getElementById('galleryModalOverlay');
                const galleryClose = document.getElementById('galleryModalClose');
                const galleryNameTag = document.getElementById('galleryNameTag');
                const galleryGrid = document.getElementById('galleryGrid');
                const galleryEmptyNote = document.getElementById('galleryEmptyNote');

                const fallbackIconSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>';

                let lastFocusedEl = null;

                function buildGalleryGrid(photos) {
                    galleryGrid.innerHTML = '';
                    photos.forEach((src, i) => {
                        const item = document.createElement('div');
                        item.className = 'gallery-grid-item';
                        item.innerHTML = `
                            <div class="gallery-grid-photo">
                                <img src="${src}" alt="Foto bersama jamaah ${i + 1}"
                                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
                                <div class="gallery-fallback" style="display:none">
                                    ${fallbackIconSvg}
                                    <span>Foto menyusul</span>
                                </div>
                            </div>`;
                        galleryGrid.appendChild(item);
                    });
                }

                function openGalleryModal(ustadKey) {
                    const data = galleryData[ustadKey];
                    if (!data) return;

                    galleryNameTag.textContent = data.name;
                    buildGalleryGrid(data.photos);
                    galleryEmptyNote.style.display = data.photos.length ? 'none' : 'block';

                    lastFocusedEl = document.activeElement;
                    galleryOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }

                function closeGalleryModal() {
                    galleryOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    if (lastFocusedEl) lastFocusedEl.focus();
                }

                galleryClose.addEventListener('click', closeGalleryModal);
                galleryOverlay.addEventListener('click', (e) => {
                    if (e.target === galleryOverlay) closeGalleryModal();
                });
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && galleryOverlay.classList.contains('active')) closeGalleryModal();
                });

                document.querySelectorAll('.pemandu-gallery-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        openGalleryModal(btn.dataset.ustad);
                    });
                });
            })();
}

// ============================================================
// HALAMAN: kontak.html
// ============================================================
if (document.body.dataset.page === "kontak") {
    // ===== Blok script #1 dari kontak.html =====
    // ========== MODAL: EMAIL (Footer) ==========
            (function () {
                const emailOverlay = document.getElementById('emailModalOverlay');
                const emailClose = document.getElementById('emailModalClose');
                const copyBtn = document.getElementById('copyEmailBtn');
                const copyMsg = document.getElementById('emailCopyMsg');
                const gmailLink = document.getElementById('gmailWebLink');
                const mailtoLink = document.getElementById('mailtoLink');

                const emailAddress = 'info@khalifahasia.co.id';
                const subject = 'Pendaftaran Agent Khalifah Asia Bekasi';
                const body = 'Assalamualaikum, saya ingin bertanya/mendaftar sebagai Agent Khalifah Asia Bekasi.';

                mailtoLink.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                gmailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                let lastFocusedEl = null;

                function openEmailModal(e) {
                    e.preventDefault();
                    lastFocusedEl = document.activeElement;
                    emailOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }

                function closeEmailModal() {
                    emailOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    if (lastFocusedEl) lastFocusedEl.focus();
                }

                emailClose.addEventListener('click', closeEmailModal);
                emailOverlay.addEventListener('click', (e) => {
                    if (e.target === emailOverlay) closeEmailModal();
                });
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && emailOverlay.classList.contains('active')) closeEmailModal();
                });

                copyBtn.addEventListener('click', () => {
                    const fallbackCopy = () => {
                        const tmp = document.createElement('input');
                        tmp.value = emailAddress;
                        document.body.appendChild(tmp);
                        tmp.select();
                        try {
                            document.execCommand('copy');
                        } catch (err) { }
                        document.body.removeChild(tmp);
                        showCopyMsg();
                    };

                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(emailAddress).then(showCopyMsg).catch(fallbackCopy);
                    } else {
                        fallbackCopy();
                    }
                });

                function showCopyMsg() {
                    copyMsg.textContent = 'Alamat email berhasil disalin!';
                    setTimeout(() => {
                        copyMsg.textContent = '';
                    }, 3000);
                }

                document.querySelectorAll('[data-email-trigger]').forEach(btn => {
                    btn.addEventListener('click', openEmailModal);
                });
            })();

            // ========== PAGE HEADER PHOTO CAROUSEL ==========
            (function () {
                const images = [
                    "Image/galerikami16.jpeg"
                ];
                const DURATION = 9000; // 5 detik per foto
                const carousel = document.getElementById("pageHeaderCarousel");
                const dotsWrap = document.getElementById("pageHeaderDots");
                if (!carousel || !dotsWrap || images.length === 0) return;

                images.forEach((src, i) => {
                    const slide = document.createElement("div");
                    slide.className = "page-header-slide" + (i === 0 ? " active" : "");
                    slide.style.backgroundImage = `url("${src}")`;
                    carousel.appendChild(slide);

                    const dot = document.createElement("button");
                    dot.type = "button";
                    dot.className = "page-header-dot" + (i === 0 ? " active" : "");
                    dot.setAttribute("aria-label", `Foto ${i + 1}`);
                    dot.addEventListener("click", () => goToSlide(i));
                    dotsWrap.appendChild(dot);
                });

                const slides = carousel.querySelectorAll(".page-header-slide");
                const dots = dotsWrap.querySelectorAll(".page-header-dot");
                let index = 0;
                let timer;

                // Sembunyikan dots kalau cuma ada satu foto (tidak ada yang perlu dipilih)
                if (images.length <= 1) {
                    dotsWrap.style.display = "none";
                }

                function goToSlide(i) {
                    slides[index].classList.remove("active");
                    dots[index].classList.remove("active");
                    index = i;
                    slides[index].classList.add("active");
                    dots[index].classList.add("active");
                    resetTimer();
                }

                function nextSlide() {
                    goToSlide((index + 1) % slides.length);
                }

                function resetTimer() {
                    clearInterval(timer);
                    if (slides.length > 1) timer = setInterval(nextSlide, DURATION);
                }

                resetTimer();
            })();

            const header = document.getElementById('header');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });

            // ========== MOBILE MENU ==========
            const hamburger = document.getElementById('hamburger');
            const drawer = document.getElementById('mobileDrawer');
            const overlay = document.getElementById('mobileOverlay');

            function toggleMenu() {
                const isOpen = drawer.classList.toggle('active');
                hamburger.classList.toggle('active');
                overlay.classList.toggle('active');
                hamburger.setAttribute('aria-expanded', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            }

            hamburger.addEventListener('click', toggleMenu);
            overlay.addEventListener('click', toggleMenu);
            drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', toggleMenu));

            // ========== SCROLL REVEAL ==========
            const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.12,
                rootMargin: '0px 0px -30px 0px'
            });
            revealElements.forEach(el => revealObserver.observe(el));

            // ========== BACK TO TOP ==========
            const backToTop = document.getElementById('backToTop');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 500) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            });
            backToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            // ========== WA BUTTON (pakai WhatsApp wa.me) ==========
            // Nomor WhatsApp per kantor. GANTI '62XXXXXXXXXXX' dengan nomor WA Kantor Pusat yang benar.
            const WA_NUMBERS = {
                'Kantor Pusat - Tangerang': '62XXXXXXXXXXX',
                'Kantor Cabang - Bekasi': '62817843531'
            };
            const WA_DEFAULT = WA_NUMBERS['Kantor Cabang - Bekasi'];

            function openWhatsApp(message, phone) {
                const targetPhone = phone || WA_DEFAULT;
                const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
            }

            document.addEventListener('click', (e) => {
                const waBtn = e.target.closest('.btn-wa');
                if (waBtn) {
                    const msg = waBtn.getAttribute('data-wa-text') || 'Halo Khalifah Asia Bekasi, saya ingin konsultasi.';
                    openWhatsApp(msg);
                }
            });

            (function () {
                const widget = document.getElementById('livechatWidget');
                const toggleBtn = document.getElementById('livechatToggle');
                const closeBtn = document.getElementById('livechatClose');
                const panel = document.getElementById('livechatPanel');
                if (!widget || !toggleBtn) return;

                function openChat() {
                    widget.classList.add('open');
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    if (panel) panel.setAttribute('aria-hidden', 'false');
                }

                function closeChat() {
                    widget.classList.remove('open');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    if (panel) panel.setAttribute('aria-hidden', 'true');
                }

                toggleBtn.addEventListener('click', function () {
                    widget.classList.contains('open') ? closeChat() : openChat();
                });
                if (closeBtn) closeBtn.addEventListener('click', closeChat);

                document.addEventListener('click', function (e) {
                    if (widget.classList.contains('open') && !widget.contains(e.target)) {
                        closeChat();
                    }
                });
                document.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape') closeChat();
                });

                // Auto-buka sekali setelah beberapa saat untuk menarik perhatian (hanya sekali per sesi)
                if (!sessionStorage.getItem('livechatAutoShown')) {
                    setTimeout(function () {
                        if (!widget.classList.contains('open')) {
                            toggleBtn.classList.add('livechat-attention');
                        }
                        sessionStorage.setItem('livechatAutoShown', '1');
                    }, 6000);
                }
            })();
}

// ============================================================
// HALAMAN: agent.html
// ============================================================
if (document.body.dataset.page === "agent") {
    // ===== Blok script #1 dari agent.html =====
    // ========== HEADER SCROLL ==========
            const header = document.getElementById('header');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });

            // ========== HERO PHOTO CAROUSEL ==========
            // Foto-foto bergantian (crossfade + Ken Burns) — pola sama seperti
            // page-header-carousel di halaman Info Sosialisasi & Seminar.
            (function () {
                const track = document.getElementById("heroPhotoCarousel");
                const dotsWrap = document.getElementById("heroPhotoDots");
                if (!track) return;

                const slides = Array.from(track.querySelectorAll(".page-header-slide"));
                if (slides.length === 0) return;

                const DURATION = 6000; // 6 detik per foto

                // Bangun tombol dot navigasi
                slides.forEach(function (_, i) {
                    const dot = document.createElement("button");
                    dot.type = "button";
                    dot.className = "page-header-dot" + (i === 0 ? " active" : "");
                    dot.setAttribute("aria-label", "Foto " + (i + 1));
                    dot.addEventListener("click", function () {
                        goTo(i);
                        resetTimer();
                    });
                    if (dotsWrap) dotsWrap.appendChild(dot);
                });
                const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

                let index = 0;
                let timer;

                function goTo(i) {
                    slides[index].classList.remove("active");
                    if (dots[index]) dots[index].classList.remove("active");
                    index = i;
                    slides[index].classList.add("active");
                    if (dots[index]) dots[index].classList.add("active");
                }

                function next() {
                    goTo((index + 1) % slides.length);
                }

                function resetTimer() {
                    if (timer) clearInterval(timer);
                    if (slides.length > 1) timer = setInterval(next, DURATION);
                }

                resetTimer();
            })();

            // ========== MOBILE MENU ==========
            const hamburger = document.getElementById('hamburger');
            const drawer = document.getElementById('mobileDrawer');
            const overlay = document.getElementById('mobileOverlay');

            function toggleMenu() {
                const isOpen = drawer.classList.toggle('active');
                hamburger.classList.toggle('active');
                overlay.classList.toggle('active');
                hamburger.setAttribute('aria-expanded', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            }

            hamburger.addEventListener('click', toggleMenu);
            overlay.addEventListener('click', toggleMenu);
            drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', toggleMenu));

            // ========== SCROLL REVEAL ==========
            const revealElements = document.querySelectorAll('.reveal');
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -30px 0px'
            });
            revealElements.forEach(el => revealObserver.observe(el));

            // ========== DASHBOARD PANEL (Keuntungan / Cara Bergabung / Syarat) ==========
            const dashButtons = document.querySelectorAll('.dash-nav-btn');
            const dashPanels = document.querySelectorAll('.dash-panel');

            function activateDashPanel(name, scroll = false) {
                dashButtons.forEach(b => b.classList.toggle('active', b.dataset.panel === name));
                dashPanels.forEach(p => p.classList.toggle('active', p.id === `panel-${name}`));
                if (scroll) {
                    document.getElementById('dashboard').scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }

            dashButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    activateDashPanel(btn.dataset.panel);
                    history.replaceState(null, '', `#${btn.dataset.panel}`);
                });
            });

            function handleHash() {
                const hash = window.location.hash.replace('#', '');
                if (['keuntungan', 'cara', 'syarat'].includes(hash)) {
                    activateDashPanel(hash, true);
                }
            }
            window.addEventListener('hashchange', handleHash);
            handleHash();

            // ========== MODAL: EMAIL (Footer) ==========
            (function () {
                const emailOverlay = document.getElementById('emailModalOverlay');
                const emailClose = document.getElementById('emailModalClose');
                const copyBtn = document.getElementById('copyEmailBtn');
                const copyMsg = document.getElementById('emailCopyMsg');
                const gmailLink = document.getElementById('gmailWebLink');
                const mailtoLink = document.getElementById('mailtoLink');

                const emailAddress = 'info@khalifahasia.co.id';
                const subject = 'Pendaftaran Agent Khalifah Asia Bekasi';
                const body = 'Assalamualaikum, saya ingin bertanya/mendaftar sebagai Agent Khalifah Asia Bekasi.';

                mailtoLink.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                gmailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                let lastFocusedEl = null;

                function openEmailModal(e) {
                    e.preventDefault();
                    lastFocusedEl = document.activeElement;
                    emailOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }

                function closeEmailModal() {
                    emailOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    if (lastFocusedEl) lastFocusedEl.focus();
                }

                emailClose.addEventListener('click', closeEmailModal);
                emailOverlay.addEventListener('click', (e) => {
                    if (e.target === emailOverlay) closeEmailModal();
                });
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && emailOverlay.classList.contains('active')) closeEmailModal();
                });

                copyBtn.addEventListener('click', () => {
                    const fallbackCopy = () => {
                        const tmp = document.createElement('input');
                        tmp.value = emailAddress;
                        document.body.appendChild(tmp);
                        tmp.select();
                        try {
                            document.execCommand('copy');
                        } catch (err) { }
                        document.body.removeChild(tmp);
                        showCopyMsg();
                    };

                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(emailAddress).then(showCopyMsg).catch(fallbackCopy);
                    } else {
                        fallbackCopy();
                    }
                });

                function showCopyMsg() {
                    copyMsg.textContent = 'Alamat email berhasil disalin!';
                    setTimeout(() => {
                        copyMsg.textContent = '';
                    }, 3000);
                }

                document.querySelectorAll('[data-email-trigger]').forEach(btn => {
                    btn.addEventListener('click', openEmailModal);
                });
            })();

    // ===== Blok script #2 dari agent.html =====
    (function () {
                // ---------- Referensi elemen: Modal Daftar Agent ----------
                const authOverlay = document.getElementById('authModalOverlay');
                const authClose = document.getElementById('authModalClose');
                const authAlert = document.getElementById('authAlert');

                const registerForm = document.getElementById('registerForm');
                const regNama = document.getElementById('regNama');
                const regWhatsapp = document.getElementById('regWhatsapp');
                const regEmail = document.getElementById('regEmail');
                const regKota = document.getElementById('regKota');
                const regKotaLainnyaWrap = document.getElementById('regKotaLainnyaWrap');
                const regKotaLainnya = document.getElementById('regKotaLainnya');
                const regPekerjaan = document.getElementById('regPekerjaan');
                const regSumber = document.getElementById('regSumber');
                const registerSubmitBtn = document.getElementById('registerSubmitBtn');

                if (!authOverlay || !registerForm) return; // halaman tidak lengkap, jangan lanjut

                // ================= MODAL: buka / tutup =================
                let lastFocusedEl = null;

                function openAuthModal() {
                    clearAuthAlert();
                    lastFocusedEl = document.activeElement;
                    authOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    setTimeout(() => {
                        const firstInput = document.querySelector('.auth-panel.active input');
                        if (firstInput) firstInput.focus();
                    }, 150);
                }

                function closeAuthModal() {
                    authOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    clearAuthAlert();
                    if (lastFocusedEl) lastFocusedEl.focus();
                }

                document.querySelectorAll('[data-auth-trigger]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        openAuthModal();
                    });
                });

                authClose.addEventListener('click', closeAuthModal);
                authOverlay.addEventListener('click', (e) => {
                    if (e.target === authOverlay) closeAuthModal();
                });
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && authOverlay.classList.contains('active')) closeAuthModal();
                });

                // ================= ALERT (pesan sukses / error di dalam modal) =================
                function showAuthAlert(type, message) {
                    authAlert.textContent = message;
                    authAlert.className = `auth-alert show ${type}`;
                }

                function clearAuthAlert() {
                    authAlert.textContent = '';
                    authAlert.className = 'auth-alert';
                }

                // ================= VALIDASI SEDERHANA (mengikuti pola field WA di halaman ini) =================
                function markFieldError(input, message) {
                    const wrap = input.closest('.wa-field');
                    if (!wrap) return;
                    const err = wrap.querySelector('.wa-error');
                    if (err) err.textContent = message;
                    input.classList.add('invalid');
                }

                function clearFieldError(input) {
                    const wrap = input.closest('.wa-field');
                    if (!wrap) return;
                    const err = wrap.querySelector('.wa-error');
                    if (err) err.textContent = '';
                    input.classList.remove('invalid');
                }

                function validateRegisterForm() {
                    let valid = true;
                    [regNama, regWhatsapp, regEmail, regKota, regKotaLainnya, regPekerjaan, regSumber].forEach(clearFieldError);

                    if (!regNama.value.trim()) {
                        markFieldError(regNama, 'Nama lengkap wajib diisi.');
                        valid = false;
                    }
                    const digitsOnly = regWhatsapp.value.trim().replace(/[^0-9]/g, '');
                    if (digitsOnly.length < 9) {
                        markFieldError(regWhatsapp, 'Nomor WhatsApp tidak valid (minimal 9 digit angka).');
                        valid = false;
                    }
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!regEmail.value.trim() || !emailPattern.test(regEmail.value.trim())) {
                        markFieldError(regEmail, 'Masukkan email yang valid.');
                        valid = false;
                    }
                    if (!regKota.value) {
                        markFieldError(regKota, 'Kota domisili wajib dipilih.');
                        valid = false;
                    } else if (regKota.value === 'Lainnya' && !regKotaLainnya.value.trim()) {
                        markFieldError(regKotaLainnya, 'Sebutkan nama kota/kabupaten Anda.');
                        valid = false;
                    }
                    if (!regPekerjaan.value.trim()) {
                        markFieldError(regPekerjaan, 'Pekerjaan / profesi wajib diisi.');
                        valid = false;
                    }
                    if (!regSumber.value) {
                        markFieldError(regSumber, 'Silakan pilih salah satu.');
                        valid = false;
                    }
                    return valid;
                }

                [regNama, regWhatsapp, regEmail, regKota, regKotaLainnya, regPekerjaan, regSumber].forEach(input => {
                    input.addEventListener('input', () => clearFieldError(input));
                    input.addEventListener('change', () => clearFieldError(input));
                });

                // ---------- Tampilkan field manual saat kota "Lainnya" dipilih ----------
                if (regKota && regKotaLainnyaWrap) {
                    regKota.addEventListener('change', () => {
                        const isLainnya = regKota.value === 'Lainnya';
                        regKotaLainnyaWrap.style.display = isLainnya ? '' : 'none';
                        if (!isLainnya) {
                            regKotaLainnya.value = '';
                            clearFieldError(regKotaLainnya);
                        }
                    });
                }

                function setBtnLoading(btn, loading, loadingText, normalText) {
                    btn.disabled = loading;
                    btn.textContent = loading ? loadingText : normalText;
                }

                // ================= SUBMIT: DAFTAR JADI AGENT =================
                // Data pendaftar langsung dikirim ke WhatsApp admin (tanpa akun/database).
                registerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    clearAuthAlert();
                    if (!validateRegisterForm()) return;

                    const nama = regNama.value.trim();
                    const whatsapp = regWhatsapp.value.trim();
                    const email = regEmail.value.trim();
                    const kota = regKota.value === 'Lainnya' ? regKotaLainnya.value.trim() : regKota.value;
                    const pekerjaan = regPekerjaan.value.trim();
                    const sumber = regSumber.value;

                    setBtnLoading(registerSubmitBtn, true, 'Memproses...', 'Daftar Jadi Agent');

                    // ---- Kirim biodata pendaftar langsung ke WhatsApp admin ----
                    const pesanWA =
                        `Assalamualaikum, saya ingin daftar jadi Agent Khalifah Asia Bekasi. Berikut biodata diri saya:\n\n` +
                        `Nama Lengkap: ${nama}\n` +
                        `No. WhatsApp: ${whatsapp}\n` +
                        `Email: ${email}\n` +
                        `Kota Domisili: ${kota}\n` +
                        `Pekerjaan: ${pekerjaan}\n` +
                        `Tahu Program Dari: ${sumber}\n\n` +
                        `Mohon informasi langkah selanjutnya. Terima kasih.`;
                    const waUrl = `https://wa.me/62817843531?text=${encodeURIComponent(pesanWA)}`;

                    showAuthAlert('success', 'Data diterima! Mengarahkan ke WhatsApp...');
                    registerForm.reset();
                    setTimeout(() => {
                        setBtnLoading(registerSubmitBtn, false, 'Memproses...', 'Daftar Jadi Agent');
                        window.location.href = waUrl;
                    }, 700);
                });

            })();
}

// ============================================================
// HALAMAN: infososialisasi.html
// ============================================================
if (document.body.dataset.page === "infososialisasi") {
    // ===== Blok script #1 dari infososialisasi.html =====
    // ========== MODAL: EMAIL (Footer) ==========
            (function () {
                const emailOverlay = document.getElementById('emailModalOverlay');
                const emailClose = document.getElementById('emailModalClose');
                const copyBtn = document.getElementById('copyEmailBtn');
                const copyMsg = document.getElementById('emailCopyMsg');
                const gmailLink = document.getElementById('gmailWebLink');
                const mailtoLink = document.getElementById('mailtoLink');

                const emailAddress = 'info@khalifahasia.co.id';
                const subject = 'Pertanyaan Seputar Manasik';
                const body = 'Assalamualaikum, saya ingin bertanya seputar jadwal manasik umroh.';

                mailtoLink.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                gmailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                let lastFocusedEl = null;

                function openEmailModal(e) {
                    e.preventDefault();
                    lastFocusedEl = document.activeElement;
                    emailOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }

                function closeEmailModal() {
                    emailOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    if (lastFocusedEl) lastFocusedEl.focus();
                }

                emailClose.addEventListener('click', closeEmailModal);
                emailOverlay.addEventListener('click', (e) => {
                    if (e.target === emailOverlay) closeEmailModal();
                });
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && emailOverlay.classList.contains('active')) closeEmailModal();
                });

                copyBtn.addEventListener('click', () => {
                    const fallbackCopy = () => {
                        const tmp = document.createElement('input');
                        tmp.value = emailAddress;
                        document.body.appendChild(tmp);
                        tmp.select();
                        try { document.execCommand('copy'); } catch (err) { }
                        document.body.removeChild(tmp);
                        showCopyMsg();
                    };

                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(emailAddress).then(showCopyMsg).catch(fallbackCopy);
                    } else {
                        fallbackCopy();
                    }
                });

                function showCopyMsg() {
                    copyMsg.textContent = 'Alamat email berhasil disalin!';
                    setTimeout(() => { copyMsg.textContent = ''; }, 3000);
                }

                document.querySelectorAll('[data-email-trigger]').forEach(btn => {
                    btn.addEventListener('click', openEmailModal);
                });
            })();

            // ========== HEADER SCROLL ==========
            const header = document.getElementById('header');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });

            // ========== MOBILE MENU ==========
            const hamburger = document.getElementById('hamburger');
            const drawer = document.getElementById('mobileDrawer');
            const overlay = document.getElementById('mobileOverlay');

            function toggleMenu() {
                const isOpen = drawer.classList.toggle('active');
                hamburger.classList.toggle('active');
                overlay.classList.toggle('active');
                hamburger.setAttribute('aria-expanded', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            }

            hamburger.addEventListener('click', toggleMenu);
            overlay.addEventListener('click', toggleMenu);
            drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', toggleMenu));

            // ========== SCROLL REVEAL ==========
            const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
            revealElements.forEach(el => revealObserver.observe(el));

            // ========== BACK TO TOP ==========
            const backToTop = document.getElementById('backToTop');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 500) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            });
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            // ========== FLOATING WHATSAPP BUTTON ==========
            (function () {
                const widget = document.getElementById('livechatWidget');
                const toggleBtn = document.getElementById('livechatToggle');
                if (!widget || !toggleBtn) return;

                // Lacak setiap klik tombol WhatsApp mengambang sebagai sinyal "Contact"
                toggleBtn.addEventListener('click', function () {
                    try { if (typeof gtag === 'function') gtag('event', 'contact', { method: 'whatsapp_floating' }); } catch (err) { }
                    try { if (typeof fbq === 'function') fbq('track', 'Contact'); } catch (err) { }
                });

                // Auto-tarik perhatian sekali setelah beberapa saat (hanya sekali per sesi)
                if (!sessionStorage.getItem('livechatAutoShown')) {
                    setTimeout(function () {
                        toggleBtn.classList.add('livechat-attention');
                        sessionStorage.setItem('livechatAutoShown', '1');
                    }, 6000);
                }
            })();

            // ========== JADWAL MANASIK TERDEKAT (untuk navigasi & badge kartu) ==========
            (function () {
                const cards = Array.from(document.querySelectorAll('.manasik-card[data-manasik-date]'));
                if (!cards.length) return;

                const now = new Date();
                let nextCard = cards.find(c => new Date(c.dataset.manasikDate) >= now);
                if (!nextCard) nextCard = cards[cards.length - 1]; // semua sudah lewat -> tampilkan yang terakhir

                const tagEl = nextCard.querySelector('.manasik-tag');
                const dateEl = nextCard.querySelector('h3');
                const tagText = tagEl ? tagEl.textContent.trim() : '';
                const dateText = dateEl ? dateEl.textContent.trim() : '';
                const summary = tagText && dateText ? `${tagText} · ${dateText}` : (dateText || 'Lihat jadwal lengkap');

                // Update semua referensi navigasi (desktop dropdown + mobile submenu)
                document.querySelectorAll('[data-manasik-next]').forEach(el => {
                    el.textContent = summary;
                });

                // Tandai kartu terdekat dengan badge & outline emas
                nextCard.setAttribute('data-manasik-next', 'true');
                const badge = document.createElement('span');
                badge.className = 'im-badge-next';
                badge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg> Jadwal Terdekat';
                nextCard.insertBefore(badge, nextCard.firstChild);
            })();
}

// ============================================================
// HALAMAN: artikel.html
// ============================================================
if (document.body.dataset.page === "artikel") {
    // ===== Blok script #1 dari artikel.html =====
    // Tab switcher: Artikel Terbaru / Berita Terbaru
            (function () {
                var btns = document.querySelectorAll('.article-tab-btn');
                var panels = {
                    artikel: document.getElementById('tabArtikel'),
                    berita: document.getElementById('tabBerita')
                };

                function activate(tab) {
                    btns.forEach(function (b) {
                        var isActive = b.getAttribute('data-tab') === tab;
                        b.classList.toggle('active', isActive);
                        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
                    });
                    Object.keys(panels).forEach(function (key) {
                        panels[key].classList.toggle('active', key === tab);
                    });
                }

                btns.forEach(function (b) {
                    b.addEventListener('click', function () {
                        var tab = b.getAttribute('data-tab');
                        activate(tab);
                        history.replaceState(null, '', '#' + tab);
                    });
                });

                var hash = window.location.hash.replace('#', '');
                activate(hash === 'berita' ? 'berita' : 'artikel');
            })();

    // ===== Blok script #2 dari artikel.html =====
    // ========== HEADER SCROLL STATE ==========
            const header = document.getElementById('header');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });

            // ========== MOBILE MENU ==========
            const hamburger = document.getElementById('hamburger');
            const drawer = document.getElementById('mobileDrawer');
            const overlay = document.getElementById('mobileOverlay');

            function toggleMenu() {
                const isOpen = drawer.classList.toggle('active');
                hamburger.classList.toggle('active');
                overlay.classList.toggle('active');
                hamburger.setAttribute('aria-expanded', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            }

            hamburger.addEventListener('click', toggleMenu);
            overlay.addEventListener('click', toggleMenu);
            drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', toggleMenu));

            // ========== SCROLL REVEAL ==========
            const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.12,
                rootMargin: '0px 0px -30px 0px'
            });
            revealElements.forEach(el => revealObserver.observe(el));

            // ========== BACK TO TOP ==========
            const backToTop = document.getElementById('backToTop');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 500) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            });
            backToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            // ========== MODAL: EMAIL (Footer) ==========
            (function () {
                const emailOverlay = document.getElementById('emailModalOverlay');
                const emailClose = document.getElementById('emailModalClose');
                const copyBtn = document.getElementById('copyEmailBtn');
                const copyMsg = document.getElementById('emailCopyMsg');
                const gmailLink = document.getElementById('gmailWebLink');
                const mailtoLink = document.getElementById('mailtoLink');
                if (!emailOverlay || !mailtoLink) return;

                const emailAddress = 'info@khalifahasia.co.id';
                const subject = 'Pertanyaan dari Website Khalifah Asia Bekasi';
                const body = 'Assalamualaikum, saya ingin bertanya seputar paket Umroh & Haji Khusus Khalifah Asia Bekasi.';

                mailtoLink.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                gmailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                let lastFocusedEl = null;

                function openEmailModal(e) {
                    e.preventDefault();
                    lastFocusedEl = document.activeElement;
                    emailOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }

                function closeEmailModal() {
                    emailOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    if (lastFocusedEl) lastFocusedEl.focus();
                }

                emailClose.addEventListener('click', closeEmailModal);
                emailOverlay.addEventListener('click', (e) => {
                    if (e.target === emailOverlay) closeEmailModal();
                });
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && emailOverlay.classList.contains('active')) closeEmailModal();
                });

                copyBtn.addEventListener('click', () => {
                    const fallbackCopy = () => {
                        const tmp = document.createElement('input');
                        tmp.value = emailAddress;
                        document.body.appendChild(tmp);
                        tmp.select();
                        try {
                            document.execCommand('copy');
                        } catch (err) { }
                        document.body.removeChild(tmp);
                        showCopyMsg();
                    };

                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(emailAddress).then(showCopyMsg).catch(fallbackCopy);
                    } else {
                        fallbackCopy();
                    }
                });

                function showCopyMsg() {
                    copyMsg.textContent = 'Alamat email berhasil disalin!';
                    setTimeout(() => {
                        copyMsg.textContent = '';
                    }, 3000);
                }

                document.querySelectorAll('[data-email-trigger]').forEach(btn => {
                    btn.addEventListener('click', openEmailModal);
                });
            })();

            // ========== LIVE CHAT WIDGET ==========
            (function () {
                const widget = document.getElementById('livechatWidget');
                const toggleBtn = document.getElementById('livechatToggle');
                const closeBtn = document.getElementById('livechatClose');
                const panel = document.getElementById('livechatPanel');
                if (!widget || !toggleBtn) return;

                function openChat() {
                    widget.classList.add('open');
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    if (panel) panel.setAttribute('aria-hidden', 'false');
                }

                function closeChat() {
                    widget.classList.remove('open');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    if (panel) panel.setAttribute('aria-hidden', 'true');
                }

                toggleBtn.addEventListener('click', function () {
                    widget.classList.contains('open') ? closeChat() : openChat();
                });
                if (closeBtn) closeBtn.addEventListener('click', closeChat);

                document.addEventListener('click', function (e) {
                    if (widget.classList.contains('open') && !widget.contains(e.target)) {
                        closeChat();
                    }
                });
                document.addEventListener('keydown', function (e) {
                    if (e.key === 'Escape') closeChat();
                });

                if (!sessionStorage.getItem('livechatAutoShown')) {
                    setTimeout(function () {
                        if (!widget.classList.contains('open')) {
                            toggleBtn.classList.add('livechat-attention');
                        }
                        sessionStorage.setItem('livechatAutoShown', '1');
                    }, 6000);
                }
            })();
}