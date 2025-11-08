import Warranty from '../schemas/Warranty.js';

export const createWarranty = async (req, res) => {
  try {
    const warranty = new Warranty(req.body);
    await warranty.save();
    res.status(201).send(warranty);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

export const listWarranties = async (req, res) => {
  try {
    const { fiscalCode, companyName, sortBy } = req.query;
    const filter = {};
    if (fiscalCode) filter.fiscalCode = fiscalCode;
    if (companyName) filter.companyName = { $regex: companyName, $options: 'i' };

    const sort = {};
    if (sortBy) {
      const sortFields = sortBy.split(',');
      sortFields.forEach((field) => {
        if (field.startsWith('-')) {
          sort[field.slice(1)] = -1;
        } else {
          sort[field] = 1;
        }
      });
    }

    const warranties = await Warranty.find(filter).sort(sort);
    res.status(200).send(warranties);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const getWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findById(req.params.id);
    if (!warranty) {
      return res.status(404).send();
    }
    res.status(200).send(warranty);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const updateWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warranty) {
      return res.status(404).send();
    }
    res.status(200).send(warranty);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

export const deleteWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findByIdAndDelete(req.params.id);
    if (!warranty) {
      return res.status(404).send();
    }
    res.status(200).send(warranty);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
