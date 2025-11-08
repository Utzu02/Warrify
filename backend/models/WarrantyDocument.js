import mongoose from 'mongoose';

const warrantyDocumentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gmailMessageId: { type: String, required: true },
    attachmentId: { type: String, required: true },
    filename: { type: String, required: true },
    size: { type: Number, default: 0 },
    subject: { type: String, default: '' },
    from: { type: String, default: '' },
    messageDate: { type: Date },
    productName: { type: String, default: '' },
    purchaseDate: { type: Date },
    expirationDate: { type: Date },
    provider: { type: String, default: '' },
    pdfData: { type: Buffer, required: true },
    contentType: { type: String, default: 'application/pdf' }
  },
  { timestamps: true }
);

warrantyDocumentSchema.index({ userId: 1, attachmentId: 1 }, { unique: true });

export default mongoose.model('WarrantyDocument', warrantyDocumentSchema);
