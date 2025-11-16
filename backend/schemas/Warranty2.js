import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // ****************** Import UUID library

const manualWarrantySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  guaranteeId: { type: String, default: uuidv4, unique: true }, // ****************** Add guaranteeId with a default UUID
  name: String, // Original file name
  data: Buffer, // Binary data of the PDF
  contentType: String, // MIME type of the file
}, { timestamps: true });

const ManualWarranty = mongoose.model('ManualWarranty', manualWarrantySchema);

export default ManualWarranty;
