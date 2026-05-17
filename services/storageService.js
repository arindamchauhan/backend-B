import connectMongo from '../config/mongo.js';
import Invoice from '../models/Invoice.js';

function getPublicBaseUrl() {
  return String(process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
}

export async function uploadInvoice(buffer, order) {
  if (!buffer) {
    throw new Error('Invoice buffer is required');
  }

  if (!order || typeof order !== 'object') {
    throw new Error('Order data is required to store an invoice');
  }

  await connectMongo();

  const invoice = await Invoice.create({
    orderId: String(order.id || order.orderId),
    customerName: String(order.name || order.customer?.name || 'Customer'),
    customerEmail: String(order.email || order.customer?.email || ''),
    total: Number(order.total || 0),
    items: Array.isArray(order.items) ? order.items : [],
    pdf: buffer,
    contentType: 'application/pdf',
  });

  const publicBaseUrl = getPublicBaseUrl();
  const invoicePath = `/api/invoices/${invoice._id}`;

  return publicBaseUrl ? `${publicBaseUrl}${invoicePath}` : invoicePath;
}
