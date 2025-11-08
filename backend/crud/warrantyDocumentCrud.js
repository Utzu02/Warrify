import mongoose from 'mongoose';
import User from '../schemas/User.js';
import WarrantyDocument from '../schemas/WarrantyDocument.js';
import { sanitizeFilename } from '../utils/fileUtils.js';

const isValidObjectId = (value = '') => mongoose.Types.ObjectId.isValid(value);

export const getScanInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const user = await User.findById(userId).select('lastScanAt');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ lastScanAt: user.lastScanAt });
  } catch (error) {
    console.error('scan-info error', error);
    return res.status(500).json({ error: 'Failed to load scan info' });
  }
};

export const listUserWarranties = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const warranties = await WarrantyDocument.find({ userId }).sort({ createdAt: -1 });
    const uniqueWarranties = [];
    const seenKeys = new Set();

    warranties.forEach((warranty) => {
      const key = `${warranty.gmailMessageId}:${warranty.attachmentId}`;
      if (seenKeys.has(key)) {
        return;
      }
      seenKeys.add(key);
      uniqueWarranties.push(warranty);
    });

    return res.json({
      total: uniqueWarranties.length,
      items: uniqueWarranties.map((warranty) => ({
        id: warranty._id,
        productName: warranty.productName || warranty.subject || 'Unknown',
        purchaseDate: warranty.purchaseDate,
        expirationDate: warranty.expirationDate,
        provider: warranty.provider || warranty.from || 'Unknown',
        filename: warranty.filename,
        size: warranty.size
      }))
    });
  } catch (error) {
    console.error('list warranties error', error);
    return res.status(500).json({ error: 'Failed to load warranties' });
  }
};

export const downloadWarrantyFile = async (req, res) => {
  try {
    const { warrantyId } = req.params;
    const { userId } = req.query;

    if (!isValidObjectId(warrantyId) || !isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid identifiers' });
    }

    const warranty = await WarrantyDocument.findById(warrantyId);
    if (!warranty || String(warranty.userId) !== String(userId)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.set('Content-Type', warranty.contentType || 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${sanitizeFilename(warranty.filename)}"`);
    return res.send(warranty.pdfData);
  } catch (error) {
    console.error('download warranty error', error);
    return res.status(500).json({ error: 'Failed to download warranty' });
  }
};
