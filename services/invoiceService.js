import { jsPDF } from 'jspdf';

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function toValidDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function normalizeItems(order) {
  const sourceItems = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.products)
      ? order.products
      : [];

  return sourceItems.map((item, index) => {
    if (typeof item === 'string') {
      return {
        name: item,
        quantity: 1,
        price: Number(order.total || 0),
        total: Number(order.total || 0),
        index,
      };
    }

    const quantity = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const total = Number(item.total || price * quantity);

    return {
      name: item.name || item.productName || `Item ${index + 1}`,
      quantity,
      price,
      total,
      index,
    };
  });
}

export function generateInvoice(order) {
  if (!order || (!order.id && !order.orderId)) {
    throw new Error('Order id is required to generate an invoice');
  }

  const orderId = String(order.id || order.orderId);
  const customerName = String(order.name || order.customer?.name || 'Customer');
  const items = normalizeItems(order);
  const total = Number(order.total ?? order.summary?.total ?? 0);
  const invoiceDate = toValidDate(order.date || order.createdAt);

  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const left = 48;
  const pageWidth = 504;
  let cursorY = 56;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('INVOICE', left, cursorY);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  cursorY += 24;
  doc.text(`Order ID: ${orderId}`, left, cursorY);
  cursorY += 16;
  doc.text(`Customer: ${customerName}`, left, cursorY);
  cursorY += 16;
  doc.text(`Date: ${invoiceDate.toLocaleString('en-IN')}`, left, cursorY);
  cursorY += 22;

  doc.setFont('helvetica', 'bold');
  doc.text('Items', left, cursorY);
  cursorY += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  if (items.length === 0) {
    doc.text('No line items provided.', left, cursorY + 10);
    cursorY += 18;
  } else {
    items.forEach((item, index) => {
      const line = `${index + 1}. ${item.name} | Qty: ${item.quantity} | Price: ${money(item.price)} | Total: ${money(item.total)}`;
      const wrapped = doc.splitTextToSize(line, pageWidth);
      doc.text(wrapped, left, cursorY + 10);
      cursorY += wrapped.length * 12 + 6;
    });
  }

  cursorY += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Grand Total: ${money(total)}`, left, cursorY);

  cursorY += 26;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const footerLines = doc.splitTextToSize('Thank you for your order. Please keep this invoice for your records.', pageWidth);
  doc.text(footerLines, left, cursorY);

  return Buffer.from(doc.output('arraybuffer'));
}
