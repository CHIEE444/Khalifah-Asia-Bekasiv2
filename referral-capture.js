/* =====================================================================
   REFERRAL-CAPTURE.JS — Khalifah Asia Bekasi
   ---------------------------------------------------------------------
   Tugas file ini:
   1. Menangkap kode referral dari URL (?ref=KODE) saat calon jamaah
      membuka website lewat link milik seorang Agent, lalu menyimpannya
      di localStorage (bertahan meski pindah halaman / tutup tab).
   2. Mengambil nama Agent pemilik kode tersebut dari Supabase (tabel
      `agents`), supaya bisa ditampilkan/disisipkan otomatis.
   3. Menyediakan potongan teks siap-tempel untuk pesan WhatsApp, supaya
      begitu customer klik "Kirim", pesan WhatsApp otomatis memuat nama
      Agent yang mereferensikannya.
   4. Mencatat referral ke tabel `referrals` saat customer benar-benar
      melakukan booking, supaya komisi Agent bisa dilacak di dashboard.

   File ini AMAN dimuat di halaman mana pun:
   - Kalau tidak ada parameter ?ref= dan tidak ada kode tersimpan, semua
     fungsi akan diam-diam tidak melakukan apa-apa.
   - Kalau Supabase (window.supabaseClient) belum siap/tidak dimuat di
     halaman ini, fungsi tetap jalan dengan fallback (kode referral saja
     tanpa nama), tidak akan error / mengganggu proses WhatsApp.

   Cara pakai di halaman lain (index.html dsb):
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="assets/js/supabase-client.js"></script>
   <script src="assets/js/referral-capture.js"></script>
   ===================================================================== */

(function () {
    'use strict';

    const STORAGE_KEY = 'khalifah_referral';
    const NAME_CACHE_KEY = 'khalifah_referral_agent_name_cache';
    const EXPIRY_MS = 60 * 24 * 60 * 60 * 1000; // kode referral berlaku 60 hari sejak link diklik

    function getSupabase() {
        return window.supabaseClient || null;
    }

    // ---------- SIMPAN / BACA KODE REFERRAL DI LOCALSTORAGE ----------
    function readStored() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || !data.code || !data.capturedAt) return null;
            if (Date.now() - data.capturedAt > EXPIRY_MS) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            return data;
        } catch (err) {
            return null;
        }
    }

    function storeCode(code) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                code: code,
                capturedAt: Date.now()
            }));
        } catch (err) { /* localStorage tidak tersedia, abaikan dengan aman */ }
    }

    // Tangkap ?ref=KODE dari URL begitu file ini dimuat.
    // Referral terbaru yang diklik akan menimpa yang lama (last-click attribution).
    function captureFromUrl() {
        try {
            const params = new URLSearchParams(window.location.search);
            const ref = params.get('ref');
            if (ref && ref.trim()) {
                storeCode(ref.trim().toUpperCase());
            }
        } catch (err) { /* abaikan dengan aman */ }
    }
    captureFromUrl();

    function getCode() {
        const stored = readStored();
        return stored ? stored.code : null;
    }

    function clear() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(NAME_CACHE_KEY);
        } catch (err) { /* abaikan dengan aman */ }
    }

    // ---------- CACHE NAMA AGENT (biar tidak query Supabase berulang kali) ----------
    function readNameCache(code) {
        try {
            const raw = localStorage.getItem(NAME_CACHE_KEY);
            if (!raw) return null;
            const cache = JSON.parse(raw);
            if (!cache || cache.code !== code || !cache.cachedAt) return null;
            if (Date.now() - cache.cachedAt > EXPIRY_MS) return null;
            return cache.nama || null;
        } catch (err) {
            return null;
        }
    }

    function writeNameCache(code, nama) {
        try {
            localStorage.setItem(NAME_CACHE_KEY, JSON.stringify({
                code: code,
                nama: nama,
                cachedAt: Date.now()
            }));
        } catch (err) { /* abaikan dengan aman */ }
    }

    // Ambil nama Agent pemilik kode referral yang tersimpan.
    // callback(nama, kode) -> nama bisa null kalau belum ketemu / Supabase belum siap.
    function getAgentName(callback) {
        const code = getCode();
        if (!code) {
            callback(null, null);
            return;
        }

        const cachedName = readNameCache(code);
        if (cachedName) {
            callback(cachedName, code);
            return;
        }

        const sb = getSupabase();
        if (!sb) {
            callback(null, code);
            return;
        }

        sb.from('agents').select('nama').eq('kode_referral', code).maybeSingle()
            .then(({ data, error }) => {
                if (error || !data) {
                    callback(null, code);
                    return;
                }
                writeNameCache(code, data.nama);
                callback(data.nama, code);
            })
            .catch(() => callback(null, code));
    }

    // Potongan teks siap ditempel ke akhir pesan WhatsApp, contoh hasilnya:
    // "\n\nDireferensikan oleh Agent: Budi Santoso (BUDI1234)"
    // Kalau tidak ada referral tersimpan, hasilnya string kosong ('').
    function getMessageSuffix(callback) {
        getAgentName((nama, code) => {
            if (!code) {
                callback('');
                return;
            }
            const label = nama ? `${nama} (${code})` : code;
            callback(`\n\nDireferensikan oleh Agent: ${label}`);
        });
    }

    // Simpan riwayat referral ke tabel `referrals` saat customer melakukan booking,
    // supaya tercatat di dashboard Agent dan bisa dihitung komisinya.
    // payload: { nama, whatsapp, email, paket }
    // Diam-diam dilewati kalau tidak ada referral / Supabase belum siap / agent tidak ditemukan
    // (tidak melempar error, tidak mengganggu proses kirim WhatsApp).
    function saveBookingReferral(payload) {
        payload = payload || {};
        const code = getCode();
        if (!code) return;

        const sb = getSupabase();
        if (!sb) return;

        sb.from('agents').select('id').eq('kode_referral', code).maybeSingle()
            .then(({ data: agent, error }) => {
                if (error || !agent) return;
                return sb.from('referrals').insert({
                    agent_id: agent.id,
                    nama_calon_jamaah: payload.nama || null,
                    whatsapp: payload.whatsapp || null,
                    email: payload.email || null,
                    paket: payload.paket || null,
                    status: 'baru'
                });
            })
            .catch(() => { /* abaikan dengan aman, jangan ganggu alur WhatsApp */ });
    }

    window.KhalifahReferral = {
        getCode: getCode,
        getAgentName: getAgentName,
        getMessageSuffix: getMessageSuffix,
        saveBookingReferral: saveBookingReferral,
        clear: clear
    };
})();
