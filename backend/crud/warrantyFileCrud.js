import mongoose from 'mongoose';
import ManualWarranty from '../schemas/Warranty2.js';

const isValidObjectId = (value = '') => mongoose.Types.ObjectId.isValid(value);
const serializeWarranty = (doc) => ({
  id: doc._id,
  name: doc.name,
  contentType: doc.contentType,
  uploadedAt: doc.createdAt
});

export const uploadWarrantyFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded' });
    }

    const warranty = new ManualWarranty({
      userId: req.userId,
      name: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype
    });

    await warranty.save();
    res.status(201).send({ message: 'File uploaded successfully', warranty: serializeWarranty(warranty) });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).send({ error: 'Failed to upload file' });
  }
};

export const getWarrantyFile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).send({ error: 'Invalid file identifier' });
    }

    const warranty = await ManualWarranty.findOne({ _id: id, userId: req.userId });
    if (!warranty) {
      return res.status(404).send('File not found.');
    }

    res.set('Content-Type', warranty.contentType);
    res.set('Content-Disposition', `attachment; filename="${warranty.name}"`);
    res.send(warranty.data);
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).send('Failed to retrieve file.');
  }
};
