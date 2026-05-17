import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    total: { type: Number, required: true },
    items: { type: [itemSchema], default: [] },
    pdf: { type: Buffer, required: true },
    contentType: { type: String, default: 'application/pdf' },
  },
  { timestamps: true }
);

invoiceSchema.index({ orderId: 1, createdAt: -1 });

export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
export default Invoice;