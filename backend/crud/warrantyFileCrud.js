import Warranty from '../schemas/Warranty2.js';

export const uploadWarrantyFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded' });
    }

    const warranty = new Warranty({
      name: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype
    });

    await warranty.save();
    res.status(201).send({ message: 'File uploaded successfully', warranty });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).send({ error: 'Failed to upload file' });
  }
};

export const getWarrantyFile = async (req, res) => {
  try {
    const warranty = await Warranty.findById(req.params.id);
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
