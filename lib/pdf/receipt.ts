import PDFDocument from 'pdfkit';

export interface PDFOrderData {
  orderId: string;
  paymentId: string;
  date: string;
  customerName: string;
  email: string;
  amount: string;
  items: Array<{ name: string; quantity: number; price?: string }>;
  address?: string;
  contactNumber?: string;
}

export async function generateReceiptPDF(orderData: PDFOrderData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fillColor('#333333')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('CROWNWING', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Payment Receipt', { align: 'center' });
         
      doc.moveDown(2);

      // Order Details
      doc.fillColor('#000000').fontSize(12).font('Helvetica-Bold').text('Order Information');
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10);
      
      const startX = doc.x;
      const startY = doc.y;
      
      doc.text(`Order ID: ${orderData.orderId}`);
      doc.text(`Payment ID: ${orderData.paymentId}`);
      doc.text(`Date: ${orderData.date}`);
      doc.text(`Status: Paid`, { stroke: true });

      doc.text(`Customer Name: ${orderData.customerName}`, 300, startY);
      doc.text(`Email: ${orderData.email}`, 300, doc.y);
      
      // Move cursor below the columns
      doc.y = Math.max(doc.y, startY + 60);
      doc.x = startX;
      doc.moveDown(2);

      // Items Table Header
      doc.font('Helvetica-Bold').fontSize(12).text('Item Summary');
      doc.moveDown(0.5);
      
      const tableTop = doc.y;
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Item', 50, tableTop);
      doc.text('Quantity', 300, tableTop);
      doc.text('Price', 400, tableTop);
      
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown(1);

      // Items Row
      doc.font('Helvetica');
      let currentY = doc.y;
      
      orderData.items.forEach(item => {
        doc.text(item.name, 50, currentY);
        doc.text(item.quantity.toString(), 300, currentY);
        doc.text(item.price || '-', 400, currentY);
        currentY += 20;
      });
      
      doc.moveTo(50, currentY + 5).lineTo(550, currentY + 5).stroke();
      
      // Total
      doc.moveDown(2);
      doc.x = startX;
      doc.font('Helvetica-Bold').fontSize(14).text(`Total Paid: ${orderData.amount}`, { align: 'right' });

      // Footer
      doc.moveDown(4);
      doc.fontSize(10).font('Helvetica').fillColor('#888888').text('Thank you for shopping with CrownWing.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
