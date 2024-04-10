import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ShortenedURL from '../models/shortener.model';
import nanoidGenerator from '../utils/nanogenerator';
import { HTTP_STATUS_CODES } from '../constant/httpcodes';

const { OK, BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = HTTP_STATUS_CODES;

function handleCustomName(customName: string): string {
  if (customName && customName.includes(' ')) {
    return customName.replace(/\s+/g, '-');
  }
  return customName;
}

export const createUrls = async (req: Request, res: Response): Promise<Response> => {
  const { originalUrl, customName } = req.body;

  try {
    const existingUrl = await ShortenedURL.findOne({ originalUrl });
    if (existingUrl) {
      return res.status(OK).json({
        message: 'Original URL already exists',
        data: { shortUrl: existingUrl.shortUrl }
      });
    }

    let shortUrl: string;
    if (customName) {
      shortUrl = handleCustomName(customName);
      const existingShortUrl = await ShortenedURL.findOne({ customName });
      if (existingShortUrl) {
        return res.status(BAD_REQUEST).json({ message: 'Custom name already in use' });
      }
    } else {
      shortUrl = nanoidGenerator();
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
    return res.status(INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

export const getUrls = async (req: Request, res: Response) => {
  try {
    const getAllUrls = await ShortenedURL.find();

    if (!getAllUrls || getAllUrls.length === 0) {
      return res.status(OK).json([]);
    }
    return res.status(OK).json(getAllUrls);
  } catch {
    return res.status(INTERNAL_SERVER_ERROR).json({ error: 'internal server error' });
  }
};

export const deleteUrl = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const objectId = id.trim();

    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(BAD_REQUEST).json({ error: 'Invalid ID format' });
    }

    const originalUrlFind = await ShortenedURL.findById(objectId);

    if (!originalUrlFind) {
      return res.status(NOT_FOUND).json({ error: 'Original URL not found' });
    }

    await ShortenedURL.findByIdAndDelete(objectId);

    return res.status(OK).json({
      message: 'URL deleted successfully',
      data: originalUrlFind
    });
  } catch {
    return res.status(INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};
