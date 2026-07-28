function orderWhatsApp(packageName) {
    const phone = "62817843531";
    const text = `Assalamualaikum admin Khalifah Asia Bekasi, saya tertarik dan ingin berkonsultasi mengenai pemesanan program: [ ${packageName} ] ke Baitullah Musim 2026. Mohon info ketersediaan slot kursi reguler keluarga.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
}