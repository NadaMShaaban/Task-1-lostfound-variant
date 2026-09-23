import Joi from 'joi';
import { Item, CATEGORIES, STATUSES } from '../models/Item.js';

// TODO: write a validation schema for create/update per README.md section 2.
const createSchema = Joi.object({
  title: Joi.string().min(2).max(120).required(),
  description: Joi.string().max(1000).allow('', null),
  category: Joi.string().valid(...CATEGORIES),
  status: Joi.string().valid(...STATUSES),
  location: Joi.string().max(120).allow('', null),
  reportedBy: Joi.string().hex().length(24) 
});

const updateSchema = Joi.object({
  title: Joi.string().min(2).max(120),
  description: Joi.string().max(1000).allow('', null),
  category: Joi.string().valid(...CATEGORIES),
  status: Joi.string().valid(...STATUSES),
  location: Joi.string().max(120).allow('', null),
  reportedBy: Joi.string().hex().length(24)
});



// GET /api/items
// TODO: implement per README.md section 3.
export async function getAllItems(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
 
    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email'); // 2nd query: swap the id for {name, email}
    res.json({ items });
  } catch (err) { next(err); }
}
 
// GET /api/items/:id
export async function getItem(req, res, next) {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ item });
  } catch (err) { next(err); }
}
 
// POST /api/items
export async function createItem(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) return res.status(400).json({ message: error.message });
 
    const item = await Item.create(value);
    res.status(201).json({ item });
  } catch (err) {
    // 11000 = Mongo duplicate-key error, thrown by the compound index
    // when the same title+location pair is inserted twice.
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This item was already reported at this location' });
    }
    next(err);
  }
}
 
// PATCH /api/items/:id
export async function updateItem(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) return res.status(400).json({ message: error.message });
 
    const doc = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ message: 'Item not found' });
    res.json({ item: doc });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This item was already reported at this location' });
    }
    next(err);
  }
}
 
// DELETE /api/items/:id
export async function deleteItem(req, res, next) {
  try {
    const doc = await Item.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Item not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
}