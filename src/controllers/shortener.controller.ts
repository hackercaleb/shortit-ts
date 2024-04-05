import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ShortenedURL, { IShortenedURL } from '../models/shortener.model';

// Create a custom nanoid generator for generating short URLs
const nanoidGenerator = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  5
);

interface CreateUrlBody {
  originalUrl: string;
  customName?: string;
}

export const createUrls = async (req: Request, res: Response): Promise<void> => {
  const { originalUrl, customName } = req.body as CreateUrlBody;
  console.log('Received request body:', req.body);

  try {
    const existingUrl = await ShortenedURL.findOne({ originalUrl });
    console.log('Existing URL:', existingUrl);

    if (existingUrl) {
      res.json({
        message: 'Original url already exists',
        data: { shortUrl: existingUrl.shortUrl }
      });
      return;
    }

    const shortUrl = customName || nanoidGenerator();
    console.log('Generated shortUrl:', shortUrl);

    const existingShortUrl = await ShortenedURL.findOne({ shortUrl });
    console.log('Existing shortUrl:', existingShortUrl);

    if (existingShortUrl) {
      res.status(400).json({ message: 'Custom name already in use' });
      return;
    }

    const shortenedUrl = new ShortenedURL({
      customName,
      shortUrl: `https://shortit/${shortUrl}`,
      originalUrl
    });
    console.log('Saving shortenedUrl:', shortenedUrl);
    await shortenedUrl.save();
    console.log('Saved shortenedUrl:', shortenedUrl);

    res.json({
      message: 'URL shortened successfully',
      data: { shortUrl: `https://shortit/${shortUrl}` }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUrls = async (req: Request, res: Response) => {
  try {
    const getAllUrls = await ShortenedURL.find({});

    // if there are no url in the database return empty array
    if (!getAllUrls || getAllUrls.length === 0) {
      return res.status(200).json([]);
    }
    // to get all urls
    return res.status(200).json(getAllUrls);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'internal server error' });
  }
};

export const deleteUrl = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const objectId = id.trim();

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Query the database to find the URL by ID
    const originalUrlFind = await ShortenedURL.findById(objectId);

    if (!originalUrlFind) {
      return res.status(404).json({ error: 'Original URL not found' });
    }

    // Remove the document from the database
    await ShortenedURL.findByIdAndDelete(objectId);

    return res.status(200).json({
      message: 'URL deleted successfully',
      data: null
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
