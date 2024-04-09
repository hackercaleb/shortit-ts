import mongoose from 'mongoose';
const connectDB = async (): Promise<void> => {
  try {
    const mongoURL = process.env.MONGO_URL;
    if (!mongoURL) {
      throw new Error('MONGO_URL is not defined');
    }

    await mongoose.connect(mongoURL);

    console.log('MongoDB Atlas Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
  }
};
export default connectDB;
