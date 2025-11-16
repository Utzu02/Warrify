import mongoose from 'mongoose';
import User from '../schemas/User.js';
import WarrantyDocument from '../schemas/WarrantyDocument.js';
import ManualWarranty from '../schemas/Warranty2.js';
import { sanitizeFilename } from '../utils/fileUtils.js';

const isValidObjectId = (value = '') => mongoose.Types.ObjectId.isValid(value);

export const getScanInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    if (String(req.userId) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
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
    if (String(req.userId) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const [gmailDocs, manualDocs] = await Promise.all([
      WarrantyDocument.find({ userId })
        .select('productName subject purchaseDate expirationDate provider from filename size gmailMessageId attachmentId createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      ManualWarranty.find({ userId })
        .select('name size createdAt')
        .sort({ createdAt: -1 })
        .lean()
    ]);
    const uniqueWarranties = [];
    const seenKeys = new Set();

    gmailDocs.forEach((warranty) => {
      const key = `${warranty.gmailMessageId}:${warranty.attachmentId}`;
      if (seenKeys.has(key)) {
        return;
      }
      seenKeys.add(key);
      uniqueWarranties.push({
        id: warranty._id,
        productName: warranty.productName || warranty.subject || 'Unknown',
        purchaseDate: warranty.purchaseDate,
        expirationDate: warranty.expirationDate,
        provider: warranty.provider || warranty.from || 'Unknown',
        filename: warranty.filename,
        size: warranty.size,
        createdAt: warranty.createdAt || new Date(0)
      });
    });

    const manualEntries = manualDocs.map((doc) => ({
      id: doc._id,
      productName: doc.name || 'Manual upload',
      purchaseDate: null,
      expirationDate: null,
      provider: 'Manual upload',
      filename: doc.name,
      size: doc.size || 0,
      createdAt: doc.createdAt || new Date(0)
    }));

    const combined = [...uniqueWarranties, ...manualEntries].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.json({
      total: combined.length,
      items: combined.map(({ createdAt, ...rest }) => rest)
    });
  } catch (error) {
    console.error('list warranties error', error);
    return res.status(500).json({ error: 'Failed to load warranties' });
  }
};

export const downloadWarrantyFile = async (req, res) => {
  try {
    const { warrantyId } = req.params;
    const { preview } = req.query;

    if (!isValidObjectId(warrantyId)) {
      return res.status(400).json({ error: 'Invalid identifiers' });
    }

    const warranty = await WarrantyDocument.findOne({ _id: warrantyId, userId: req.userId });
    const disposition = preview === 'true' ? 'inline' : 'attachment';

    if (warranty) {
      res.set('Content-Type', warranty.contentType || 'application/pdf');
      res.set('Content-Disposition', `${disposition}; filename="${sanitizeFilename(warranty.filename)}"`);
      return res.send(warranty.pdfData);
    }

    const manualWarranty = await ManualWarranty.findOne({ _id: warrantyId, userId: req.userId });
    if (!manualWarranty) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.set('Content-Type', manualWarranty.contentType || 'application/pdf');
    res.set('Content-Disposition', `${disposition}; filename="${sanitizeFilename(manualWarranty.name)}"`);
    return res.send(manualWarranty.data);
  } catch (error) {
    console.error('download warranty error', error);
    return res.status(500).json({ error: 'Failed to download warranty' });
  }
};

export const deleteWarrantyDocument = async (req, res) => {
  try {
    const { warrantyId } = req.params;

    if (!isValidObjectId(warrantyId)) {
      return res.status(400).json({ error: 'Invalid identifiers' });
    }

    const deleted = await WarrantyDocument.findOneAndDelete({
      _id: warrantyId,
      userId: req.userId
    });

    if (deleted) {
      return res.json({ success: true });
    }

    const manualDeleted = await ManualWarranty.findOneAndDelete({
      _id: warrantyId,
      userId: req.userId
    });

    if (!manualDeleted) {
      return res.status(404).json({ error: 'File not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('delete warranty error', error);
    return res.status(500).json({ error: 'Failed to delete warranty' });
  }
};
