// src/utils/pdfGenerators.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns'); // npm install date-fns

// For simplicity we'll generate files locally first.
// In production → upload to S3 / Cloudinary / Supabase Storage and return public URL

/**
 * @param {Object} license - full license row from DB
 * @param {Object} order - full order row
 * @param {Object} buyer - user row of buyer
 * @param {Object} seller - user row of seller
 * @param {Object} artwork - artwork row
 * @returns {Promise<string>} public URL of the generated PDF
 */
async function generateLicensePDF(license, order, buyer, seller, artwork) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // For production: stream to S3 or temp file
    const fileName = `license_${license.id}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../../storage/licenses', fileName);
    
    // Make sure directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ─── Header ───
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('LICENSE AGREEMENT', { align: 'center' })
      .moveDown(1.5);

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`License ID: ${license.id}`)
      .text(`Issued on: ${format(new Date(license.created_at), 'PPP')}`)
      .moveDown();

    // ─── Parties ───
    doc.fontSize(14).font('Helvetica-Bold').text('Parties:').moveDown(0.5);
    doc.font('Helvetica').text(`Licensor (Seller): ${seller.username || seller.email}`);
    doc.text(`Licensee (Buyer): ${buyer.username || buyer.email}`);
    doc.moveDown();

    // ─── Artwork details ───
    doc.fontSize(14).font('Helvetica-Bold').text('Licensed Work:').moveDown(0.5);
    doc.font('Helvetica').text(`Title: ${artwork.title || 'Untitled Artwork'}`);
    doc.text(`Artwork ID: ${artwork.id}`);
    doc.text(`License Type: ${license.license_type.toUpperCase()}`);
    doc.moveDown();

    // ─── License terms (customize heavily based on your legal needs) ───
    doc.fontSize(14).font('Helvetica-Bold').text('Grant of License').moveDown(0.5);
    doc.font('Helvetica').text(
      `The Licensor hereby grants to the Licensee a ${license.license_type} license to use the Artwork subject to the following terms:`,
      { continued: true }
    );

    const terms = {
      personal: [
        "• For non-commercial, personal use only",
        "• No resale, distribution, or public display",
        "• Attribution required where feasible",
        "• Non-transferable",
      ],
      commercial: [
        "• For commercial purposes including advertising, products, websites",
        "• Worldwide, non-exclusive",
        "• No resale of the raw artwork file",
        "• Attribution optional",
      ],
      exclusive: [
        "• Exclusive worldwide rights",
        "• Licensor may not license or use the work further",
        "• Full transfer of copyright (if agreed)",
        "• High-value transaction – consult legal counsel",
      ],
    };

    (terms[license.license_type] || terms.personal).forEach((line) => {
      doc.text(`  ${line}`);
    });

    doc.moveDown(1);

    // ─── Payment & validity ───
    doc.text(`Payment: ${order.currency.toUpperCase()} ${(order.total_cents / 100).toFixed(2)}`);
    doc.text(`Order ID: ${order.order_number || order.id}`);

    if (license.expires_at) {
      doc.text(`Valid until: ${format(new Date(license.expires_at), 'PPP')}`);
    } else {
      doc.text('This is a perpetual license (no expiry).');
    }

    doc.moveDown(2);

    // ─── Signatures (placeholder) ───
    doc.fontSize(12).text('___________________________', 50, doc.y);
    doc.text('Licensor Signature (Digital)', 50, doc.y + 5);
    
    doc.moveDown(2);
    doc.text('___________________________', 300, doc.y - 40);
    doc.text('Licensee Acknowledgement', 300, doc.y - 35);

    doc.end();

    stream.on('finish', () => {
      // In production: upload to S3 / storage and get public URL
      const publicUrl = `/storage/licenses/${fileName}`; // ← change to real CDN URL
      resolve(publicUrl);
    });

    stream.on('error', reject);
  });
}

/**
 * @param {Object} order - full order row with items
 * @returns {Promise<string>} public URL of invoice PDF
 */
async function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const fileName = `invoice_${order.id}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../../storage/invoices', fileName);
    
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ─── Invoice Header ───
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('INVOICE', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .text(`Invoice # ${order.invoice_number || `INV-${order.id.slice(0,8)}`}`)
      .text(`Date: ${format(new Date(order.paid_at || order.created_at), 'PPP')}`)
      .moveDown();

    // Platform name
    doc.text('Artverse Platform', 50, 140);
    doc.text('Delhi, India', 50, 155);
    doc.text('support@artverse.com', 50, 170);

    // Buyer info
    doc.text('Bill To:', 350, 140);
    doc.text(`User ID: ${order.buyer_id}`, 350, 155);

    doc.moveDown(2);

    // ─── Table header ───
    const tableTop = 240;
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Description', 50, tableTop);
    doc.text('Amount', 450, tableTop, { width: 100, align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // ─── Line items ───
    let y = tableTop + 35;
    doc.font('Helvetica').fontSize(11);

    // Assuming one item for simplicity
    doc.text('Artwork License Purchase', 50, y);
    doc.text(`${(order.subtotal_cents / 100).toFixed(2)} ${order.currency.toUpperCase()}`, 450, y, { width: 100, align: 'right' });

    y += 20;
    doc.text('Platform Fee (10%)', 50, y);
    doc.text(`-${(order.platform_fee_cents / 100).toFixed(2)} ${order.currency.toUpperCase()}`, 450, y, { width: 100, align: 'right' });

    if (order.tax_cents > 0) {
      y += 20;
      doc.text('GST (18%)', 50, y);
      doc.text(`${(order.tax_cents / 100).toFixed(2)} ${order.currency.toUpperCase()}`, 450, y, { width: 100, align: 'right' });
    }

    // Total
    y += 30;
    doc.font('Helvetica-Bold').fontSize(14);
    doc.text('Total Paid:', 350, y);
    doc.text(`${(order.total_cents / 100).toFixed(2)} ${order.currency.toUpperCase()}`, 450, y, { width: 100, align: 'right' });

    doc.end();

    stream.on('finish', () => {
      const publicUrl = `/storage/invoices/${fileName}`; // ← replace with real URL
      resolve(publicUrl);
    });

    stream.on('error', reject);
  });
}

module.exports = {
  generateLicensePDF,
  generateInvoicePDF,
};