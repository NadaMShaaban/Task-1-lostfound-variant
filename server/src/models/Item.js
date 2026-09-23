import mongoose from 'mongoose';

// TODO: define the Item schema per README.md section 1.

export const CATEGORIES = ['electronics', 'clothing', 'documents', 'accessories', 'other'];
export const STATUSES = ['lost', 'found', 'claimed'];

const itemSchema = new mongoose.Schema(
  {
     title: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String, enum: CATEGORIES, default: 'other' },
    status: { type: String, enum: STATUSES, default: 'lost' },
    location: { type: String },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// TODO: add the uniqueness constraint described in README.md section 1.
itemSchema.index({ title: 1, location: 1 }, { unique: true });

export const Item = mongoose.model('Item', itemSchema);
