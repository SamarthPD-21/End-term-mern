import Contact from '../models/contact.model.js';

// Public endpoint: accept contact form submissions
export const submitContact = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, productInterest, message, source } = req.body || {};
    if (!firstName || !email || !message) {
      return res.status(400).json({ error: 'firstName, email and message are required' });
    }

    const doc = await Contact.create({ firstName, lastName, email, phone, productInterest, message, source });
    return res.status(201).json({ message: 'Contact received', id: doc._id });
  } catch (err) {
    next(err);
  }
};

// Admin endpoint: list contacts (paginated)
export const listContacts = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.max(10, Math.min(200, Number(req.query.pageSize) || 50));
    const q = req.query.q ? String(req.query.q).trim() : '';

    const filter = {};
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { firstName: re },
        { lastName: re },
        { email: re },
        { phone: re },
        { message: re },
        { productInterest: re },
      ];
    }

    const total = await Contact.countDocuments(filter);
    const items = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    res.json({ page, pageSize, total, items });
  } catch (err) {
    next(err);
  }
};

// Admin endpoint: delete a contact message
export const deleteContact = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const doc = await Contact.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
