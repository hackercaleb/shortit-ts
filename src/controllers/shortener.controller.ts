import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ShortenedURL from '../models/shortener.model';
import nanoidGenerator from '../middleware/nanogenerator';

interface CreateUrlBody {
  originalUrl: string;
  customName?: string;
}

export const createUrls = async (req: Request, res: Response): Promise<Response> => {
  const { originalUrl, customName } = req.body as CreateUrlBody;

  try {
    const existingUrl = await ShortenedURL.findOne({ originalUrl });

    if (existingUrl) {
      return res.json({
        message: 'Original url already exists',
        data: { shortUrl: existingUrl.shortUrl }
      });
    }

    const shortUrl = customName || nanoidGenerator();

    const existingShortUrl = await ShortenedURL.findOne({ shortUrl });

    if (existingShortUrl) {
      return res.status(400).json({ message: 'Custom name already in use' });
    }

    const shortenedUrl = new ShortenedURL({
      customName,
      shortUrl: `https://shortit/${shortUrl}`,
      originalUrl
    });

    await shortenedUrl.save();

    return res.json({
      message: 'URL shortened successfully',
      data: { shortUrl: `https://shortit/${shortUrl}` }
    });
  } catch {
    return res.status(500).json({ message: 'Server error' });
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
  } catch {
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
      data: originalUrlFind
    });
  } catch {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
