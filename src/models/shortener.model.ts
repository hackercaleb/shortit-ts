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
    unique: true,
    sparse: true
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true
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

// Define the middleware function
shortenedURLSchema.pre(/^find/, function (this: any, next) {
  // Excluding the '__v' field from the query results
  this.select('-__v');
  next();
});

const ShortenedURL = mongoose.model<IShortenedURL>('ShortenedURL', shortenedURLSchema);
export default ShortenedURL;
