async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const btn = document.getElementById("btnExport");
  const body = document.body;

  // Ambil semua ikon untuk freeze/restore animasi
  const icons = document.querySelectorAll(".icon");

  try {
    // MODE EXPORT
    body.classList.add("export-pdf");
    btn.style.display = "none";
    await new Promise(r => setTimeout(r, 150));

    // ✅ Freeze posisi animasi bintang
    icons.forEach(icon => {
      const style = window.getComputedStyle(icon);
      const matrix = style.transform; // ambil posisi transform terakhir
      icon.style.transform = matrix;
      icon.style.animation = "none"; // matikan animasi sementara
    });

    const pageTitle = document.title || "Dokumen Web";
    const pageURL = window.location.href;

    // RENDER HALAMAN KE CANVAS (OPTIMIZED)
    const canvas = await html2canvas(body, {
      scale: 2,          
      useCORS: true,
      logging: false
    });

    // SETUP PDF A4
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = {
      top: 28,
      bottom: 15,
      left: 10,
      right: 10
    };

    const pdfWidth = pageWidth - margin.left - margin.right;
    const ratio = pdfWidth / canvas.width;

    const pageCanvasHeight =
      (pageHeight - margin.top - margin.bottom) / ratio;

    let position = 0;
    let pageNumber = 1;
    const totalPages = Math.ceil(canvas.height / pageCanvasHeight);

    while (position < canvas.height) {
      const sliceHeight = Math.min(
        pageCanvasHeight,
        canvas.height - position
      );

      // CANVAS POTONGAN (OPTIMIZED)
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const ctx = pageCanvas.getContext("2d", { willReadFrequently: true });

      ctx.drawImage(
        canvas,
        0,
        position,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      const imgHeight = sliceHeight * ratio;
      const imgData = pageCanvas.toDataURL("image/jpeg", 0.85);

      // HEADER
      pdf.setFontSize(10);
      pdf.text(pageTitle, margin.left, 10);

      pdf.setFontSize(9);
      pdf.text(
        "Generated automatically from:",
        margin.left,
        18
      );

      pdf.setTextColor(0, 0, 255);
      pdf.textWithLink(
        pageURL,
        margin.left + 45,
        18,
        { url: pageURL }
      );
      pdf.setTextColor(0, 0, 0);

      // CONTENT
      pdf.addImage(
        imgData,
        "JPEG",
        margin.left,
        margin.top,
        pdfWidth,
        imgHeight
      );

      // FOOTER
      pdf.setFontSize(9);
      pdf.text(
        `Page ${pageNumber} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 6,
        { align: "center" }
      );

      position += sliceHeight;
      if (position < canvas.height) pdf.addPage();
      pageNumber++;
    }

    // SIMPAN
    pdf.save("Resume-Dani-Kardinal.pdf");

  } catch (err) {
    console.error("Export PDF gagal:", err);
  } finally {
    // Restore tombol & kelas export
    btn.style.display = "inline-block";
    body.classList.remove("export-pdf");

    // ✅ Restore animasi bintang
    icons.forEach(icon => {
      icon.style.animation = ""; // kembalikan ke CSS asli
    });
  }
}

// EVENT
document
  .getElementById("btnExport")
  .addEventListener("click", exportPDF);
