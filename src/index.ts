import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import route from './routes';
//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Shortit URL Shortner API');
});

app.listen(port, () => {
  console.log(`Server live at http://localhost:${port}`);
});

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

connectDB();
app.use(express.json());
app.use('/', route);
