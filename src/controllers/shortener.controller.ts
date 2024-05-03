import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ShortenedURL from '../models/shortener.model';
import nanoidGenerator from '../utils/nanogenerator';
import { HTTP_STATUS_CODES } from '../constant/httpcodes';
import logger from '../utils/logger';

const { OK, BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = HTTP_STATUS_CODES;

function handleCustomName(customName: string): string {
  if (customName && customName.includes(' ')) {
    return customName.replaceAll(/\s+/g, '-');
  }
  return customName;
}

export const createUrls = async (req: Request, res: Response): Promise<Response> => {
  const { originalUrl, customName } = req.body;

  // Check if the request body is empty
  if (!originalUrl) {
    return res.status(BAD_REQUEST).json({ message: 'Original URL is required' });
  }

  try {
    const existingUrl = await ShortenedURL.findOne({ originalUrl });
    if (existingUrl) {
      return res.status(BAD_REQUEST).json({
        message: 'Original URL already exists',
        data: { id: existingUrl._id, shortUrl: existingUrl.shortUrl }
      });
    }

    if (customName) {
      // Handle custom name formatting
      const formattedCustomName = handleCustomName(customName);

      // Check for duplicate custom names
      const existingShortUrl = await ShortenedURL.findOne({ customName: formattedCustomName });
      if (existingShortUrl) {
        return res.status(BAD_REQUEST).json({ message: 'Custom name already in use' });
      }
    }

    // Generate short URL
    const shortUrl = customName ? handleCustomName(customName) : nanoidGenerator();

    // Save shortened URL to database
    const shortenedUrl = new ShortenedURL({
      customName,
      shortUrl: `https://shortit/${shortUrl}`,
      originalUrl
    });
    const savedUrl = await shortenedUrl.save();

    return res.json({
      message: 'URL shortened successfully',
      data: { id: savedUrl._id, shortUrl: `https://shortit/${shortUrl}` }
    });
  } catch (error) {
    logger.error('Error creating shortened URL:', error);
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

export const getSingleUrl = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const objectids = id.trim();

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(objectids)) {
      return res.status(BAD_REQUEST).json({ error: 'invalid id format' });
    }

    // Query the database to find the URL by ID
    const findOneUrl = await ShortenedURL.findById(objectids);

    // If the URL with the given ID is not found, return an error
    if (!findOneUrl) {
      return res.status(NOT_FOUND).json({ error: 'url not found' });
    }

    // Return the URL
    return res.status(OK).json(findOneUrl);
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

export const updateURL = async (req: Request, res: Response) => {
  const { id } = req.params;
  const ID = id.trim();
  const { originalUrl, customName } = req.body;

  try {
    // Query the database to find the URL by ID
    const urlToUpdate = await ShortenedURL.findById(ID);

    // If the URL with the given ID is not found, return an error
    if (!urlToUpdate) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Update the originalUrl if provided
    if (originalUrl) {
      urlToUpdate.originalUrl = originalUrl;
    }

    // Handle customName if provided
    if (customName) {
      const formattedCustomName = customName.replaceAll(' ', '-');

      // Check if the custom name already exists for another entry
      const customNameExists = await ShortenedURL.findOne({
        customName: formattedCustomName,
        _id: { $ne: urlToUpdate._id }
      });

      if (customNameExists) {
        return res.status(400).json({ error: 'Custom name already exists' });
      }

      urlToUpdate.customName = formattedCustomName;
      urlToUpdate.shortUrl = `https://shortit/${formattedCustomName}`;
    }

    await urlToUpdate.save();

    return res.json({
      message: 'URL updated successfully',
      data: {
        originalUrl: urlToUpdate.originalUrl,
        customName: urlToUpdate.customName,
        shortUrl: urlToUpdate.shortUrl
      }
    });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
