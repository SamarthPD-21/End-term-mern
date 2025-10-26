import mongoose from 'mongoose';

const { Schema } = mongoose;

const ReplySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  profileImage: { type: String, default: null },
  text: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const CommentSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  profileImage: { type: String, default: null },
  rating: { type: Number, default: 0 },
  text: { type: String, default: '' },
  replies: { type: [ReplySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
