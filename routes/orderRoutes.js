import express from 'express';
import { generateInvoice } from '../services/invoiceService.js';
import { uploadInvoice } from '../services/storageService.js';
import connectMongo from '../config/mongo.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

function extractOrderPayload(body) {
  return body?.order && typeof body.order === 'object' ? body.order : body;
}

function normalizeItems(order) {
  if (Array.isArray(order.items)) {
    return order.items;
  }

  if (Array.isArray(order.products)) {
    return order.products;
  }

  return [];
}

function validateOrderPayload(req, res, next) {
  try {
    const order = extractOrderPayload(req.body);

    if (!order || typeof order !== 'object') {
      return res.status(400).json({ success: false, error: 'Order payload is required' });
    }

    const id = String(order.id || order.orderId || '').trim();
    const name = String(order.name || order.customer?.name || '').trim();
    const email = String(order.email || order.customer?.email || '').trim();
    const total = Number(order.total ?? order.summary?.total);
    const items = normalizeItems(order);

    if (!id) {
      return res.status(400).json({ success: false, error: 'Order id is required' });
    }

    if (!name) {
      return res.status(400).json({ success: false, error: 'Customer name is required' });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid customer email is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one order item is required' });
    }

    if (!Number.isFinite(total) || total < 0) {
      return res.status(400).json({ success: false, error: 'Order total must be a valid positive number' });
    }

    req.validatedOrder = {
      ...order,
      id,
      orderId: order.orderId || id,
      name,
      email,
      items,
      total,
      date: order.date || order.createdAt || new Date().toISOString(),
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

router.post('/order', validateOrderPayload, async (req, res, next) => {
  try {
    const order = req.validatedOrder;
    const invoiceBuffer = generateInvoice(order);
    const invoiceUrl = await uploadInvoice(invoiceBuffer, order);

    return res.status(201).json({
      success: true,
      invoiceUrl,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/invoices/:invoiceId', async (req, res, next) => {
  try {
    await connectMongo();

    const invoice = await Invoice.findById(req.params.invoiceId).lean();

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    res.setHeader('Content-Type', invoice.contentType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${invoice.orderId}.pdf"`);
    return res.send(Buffer.from(invoice.pdf));
  } catch (error) {
    return next(error);
  }
});

export default router;
