const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateQRCode = async (data) => {
    try {
        return await QRCode.toDataURL(data);
    } catch (err) {
        console.error('QR Code error:', err);
        throw err;
    }
};

const generateInvoicePDF = async (orderData, outputPath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(outputPath);

        doc.pipe(stream);

        doc.fontSize(25).text('DriveLedger Invoice', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Order ID: ${orderData.id}`);
        doc.text(`Buyer: ${orderData.buyer}`);
        doc.text(`Product ID: ${orderData.productId}`);
        doc.text(`Amount: ${orderData.amount} wei`);
        doc.text(`Transaction: ${orderData.txHash}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);

        doc.moveDown();
        doc.text('Thank you for your purchase with DriveLedger!', { italic: true });

        doc.end();

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
    });
};

module.exports = { generateQRCode, generateInvoicePDF };
