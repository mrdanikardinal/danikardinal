async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const btn = document.getElementById("btnExport");

  try {
    // 1️⃣ Sembunyikan tombol sebelum render
    btn.style.display = "none";
    await new Promise(resolve => setTimeout(resolve, 200));

    // Ambil title dan URL halaman
    const pageTitle = document.title || "Dokumen Web";
    const pageURL = window.location.href;

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

    const marginTop = 25;    // Margin atas untuk header
    const marginBottom = 15; // Margin bawah
    const marginLeft = 10;   
    const marginRight = 10;  

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const pdfWidth = pageWidth - marginLeft - marginRight;
    const ratio = pdfWidth / canvasWidth;

    let position = 0;
    const pageContentHeight = (pageHeight - marginTop - marginBottom) / ratio; // pixel per page

    let pageNumber = 1;
    const totalPages = Math.ceil((canvasHeight * ratio) / (pageHeight - marginTop - marginBottom));

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

      // HEADER
      pdf.setFontSize(10);
      pdf.text(`${pageTitle}`, marginLeft, 10);

      pdf.setFontSize(9);
      const text = "This document has been automatically generated from the source: ";
      const textWidth = pdf.getTextWidth(text);

      // Tampilkan teks
      pdf.text(text, marginLeft, 20);

      // Tambahkan link klikable
      pdf.setTextColor(0, 0, 255); // biru seperti hyperlink
      pdf.textWithLink(pageURL, marginLeft + textWidth, 20, { url: pageURL });
      pdf.setTextColor(0, 0, 0); // kembalikan warna normal

      // GAMBAR konten
      pdf.addImage(imgData, 'JPEG', marginLeft, marginTop, pdfWidth, imgPageHeight);

      // FOOTER: halaman
      pdf.setFontSize(10);
      pdf.text(`Document ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

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


