import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import WarrantyDocument from '../models/WarrantyDocument.js';

const router = express.Router();

const isValidObjectId = (value = '') => mongoose.Types.ObjectId.isValid(value);
const sanitizeFilename = (name = 'document.pdf') =>
  String(name)
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '_')
    .substring(0, 100) || 'document.pdf';

router.get('/users/:userId/scan-info', async (req, res) => {
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
});

router.get('/users/:userId/warranties', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const warranties = await WarrantyDocument.find({ userId }).sort({ createdAt: -1 });
    return res.json({
      total: warranties.length,
      items: warranties.map((warranty) => ({
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
});

router.get('/warranties/:warrantyId/download', async (req, res) => {
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
});

export default router;
