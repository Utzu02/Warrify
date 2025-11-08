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
    contentHash: { type: String, default: null },
    pdfData: { type: Buffer, required: true },
    contentType: { type: String, default: 'application/pdf' }
  },
  { timestamps: true }
);

warrantyDocumentSchema.index({ userId: 1, gmailMessageId: 1, attachmentId: 1 }, { unique: true });
warrantyDocumentSchema.index({ userId: 1, contentHash: 1 }, { unique: true, sparse: true });

export default mongoose.model('WarrantyDocument', warrantyDocumentSchema);
