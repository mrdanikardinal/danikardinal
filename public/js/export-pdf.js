// File: public/js/export-pdf.js

async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const btn = document.getElementById("btnExport");

  try {
    // 1️⃣ Sembunyikan tombol sebelum ambil screenshot
    btn.style.display = "none";

    // 2️⃣ Tunggu sedikit agar re-render selesai
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 3️⃣ Screenshot halaman
    const canvas = await html2canvas(document.body, {
      scale: 2, // kualitas tinggi
      useCORS: true
    });

    // 4️⃣ Kembalikan tombol seperti semula
    btn.style.display = "inline-block";

    // 5️⃣ Buat PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "p",
      unit: "px",
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("halaman.pdf");
  } catch (error) {
    console.error("Gagal membuat PDF:", error);
    btn.style.display = "inline-block";
  }
}

// Event listener
document.getElementById("btnExport").addEventListener("click", exportPDF);
