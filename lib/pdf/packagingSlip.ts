import PDFDocument from 'pdfkit';
import { PDFOrderData } from './receipt';

export async function generatePackagingSlipPDF(orderData: PDFOrderData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('error', err => reject(err));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fillColor('#000000')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('CROWNWING', { align: 'left' });
      
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Packaging Slip', { align: 'left' });
         
      doc.moveDown(2);

      // Order & Shipping Details
      doc.fillColor('#000000').fontSize(12).font('Helvetica-Bold').text('Shipping Details');
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10);
      
      const startX = doc.x;
      const startY = doc.y;
      
      doc.text(`Order ID: ${orderData.orderId}`);
      doc.text(`Date: ${orderData.date}`);

      doc.text(`Customer Name: ${orderData.customerName}`, 300, startY);
      doc.text(`Contact: ${orderData.contactNumber || 'N/A'}`, 300, doc.y);
      doc.text(`Address: ${orderData.address || 'N/A'}`, 300, doc.y, { width: 200 });
      
      // Move cursor below the columns
      doc.y = Math.max(doc.y, startY + 80);
      doc.x = startX;
      doc.moveDown(2);

      // Items Table Header
      doc.font('Helvetica-Bold').fontSize(12).text('Included Items');
      doc.moveDown(0.5);
      
      const tableTop = doc.y;
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Item', 50, tableTop);
      doc.text('Quantity', 450, tableTop);
      
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown(1);

      // Items Row
      doc.font('Helvetica');
      let currentY = doc.y;
      
      orderData.items.forEach(item => {
        doc.text(item.name, 50, currentY);
        doc.text(item.quantity.toString(), 450, currentY);
        currentY += 20;
      });
      
      doc.y = currentY; // Update the cursor!
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      
      // Footer
      doc.moveDown(4);
      doc.x = startX;
      doc.fontSize(10).font('Helvetica-Oblique').fillColor('#888888').text('Notes:', { underline: true });
      doc.moveDown(0.5);
      doc.font('Helvetica').text('Please ensure all items are carefully packed according to standard procedures.', { width: 400 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
