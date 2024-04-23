import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import route from './routes';
import connectDB from './db';
import logger from './utils/logger';
//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8001;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Shortit URL Shortner API');
});

app.listen(port, () => {
  return logger.info(`Server live at http://localhost:${port}`);
});

connectDB();
app.use(express.json());
app.use('/', route);
