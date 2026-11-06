// Renders page 1 of a PDF to a PNG buffer for use as a thumbnail.
// Returns null (never throws) so a bad/corrupt PDF degrades to no
// thumbnail instead of failing the whole upload.
async function renderPdfThumbnail(pdfPath) {
  try {
    const { pdf } = await import("pdf-to-img");
    const document = await pdf(pdfPath, { scale: 2 });
    return await document.getPage(1); // Buffer (PNG)
  } catch (err) {
    console.error("PDF thumbnail generation failed:", err);
    return null;
  }
}

module.exports = { renderPdfThumbnail };