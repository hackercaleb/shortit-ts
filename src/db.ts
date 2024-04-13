import mongoose from 'mongoose';
import logger from './utils/logger';
const connectDB = async (): Promise<void> => {
  try {
    const mongoURL = process.env.MONGO_URL;
    if (!mongoURL) {
      throw new Error('MONGO_URL is not defined');
    }

    await mongoose.connect(mongoURL);

    logger.info('MongoDB Atlas Connected');
  } catch (error) {
    logger.error('Error connecting to MongoDB Atlas:', error);
  }
};
export default connectDB;
