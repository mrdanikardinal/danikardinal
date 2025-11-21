async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const btn = document.getElementById("btnExport");

  try {
    // 1️⃣ Sembunyikan tombol sebelum render
    btn.style.display = "none";
    await new Promise(resolve => setTimeout(resolve, 200));

    // 2️⃣ Render seluruh halaman ke canvas
    const canvas = await html2canvas(document.body, {
      scale: window.devicePixelRatio || 2,
      useCORS: true
    });

    btn.style.display = "inline-block";

    // 3️⃣ Setup PDF A4
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const marginTop = 15;    // Margin atas
    const marginBottom = 15; // Margin bawah
    const marginLeft = 10;   // Margin kiri
    const marginRight = 10;  // Margin kanan

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const pdfWidth = pageWidth - marginLeft - marginRight;
    const ratio = pdfWidth / canvasWidth;
    const pdfHeight = canvasHeight * ratio;

    let position = 0; // Posisi di canvas
    const pageContentHeight = (pageHeight - marginTop - marginBottom) / ratio; // dalam pixel

    let pageNumber = 1;
    const totalPages = Math.ceil(pdfHeight / (pageHeight - marginTop - marginBottom));

    while (position < canvasHeight) {
      const canvasPageHeight = Math.min(pageContentHeight, canvasHeight - position);

      // Canvas sementara untuk memotong halaman
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvasWidth;
      pageCanvas.height = canvasPageHeight;

      const pageCtx = pageCanvas.getContext('2d');
      pageCtx.drawImage(
        canvas,
        0,
        position,
        canvasWidth,
        canvasPageHeight,
        0,
        0,
        canvasWidth,
        canvasPageHeight
      );

      const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      const imgPageHeight = canvasPageHeight * ratio;

      // Tambahkan header jika mau
      pdf.setFontSize(10);
      pdf.text(`Dokumen Halaman ${pageNumber}`, marginLeft, 10);

      // Tambahkan gambar
      pdf.addImage(imgData, 'JPEG', marginLeft, marginTop, pdfWidth, imgPageHeight);

      // Tambahkan footer jika mau
      pdf.setFontSize(10);
      pdf.text(`Halaman ${pageNumber} dari ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

      position += canvasPageHeight;
      if (position < canvasHeight) pdf.addPage();
      pageNumber++;
    }

    // 4️⃣ Simpan PDF
    pdf.save("Dani-Kardinal-CV.pdf");

  } catch (error) {
    console.error("Gagal membuat PDF:", error);
    btn.style.display = "inline-block";
  }
}

// Event listener
document.getElementById("btnExport").addEventListener("click", exportPDF);
