import mongoose, { Document, Schema } from 'mongoose';

export interface IShortenedURL extends Document {
  customName?: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: Date;
}

const shortenedURLSchema: Schema = new mongoose.Schema({
  customName: {
    type: String,
    sparse: true,
    unique: true
  },
  shortUrl: {
    type: String,
    unique: true,
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Define toJSON option at the top level of the schema
shortenedURLSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const ShortenedURL = mongoose.model<IShortenedURL>('ShortenedURL', shortenedURLSchema);
export default ShortenedURL;
