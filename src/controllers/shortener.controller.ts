import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ShortenedURL from '../models/shortener.model';
import nanoidGenerator from '../utils/nanogenerator';
import { HTTP_STATUS_CODES } from '../constant/httpcodes';

const { OK, BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = HTTP_STATUS_CODES;

function handleCustomName(customName: string): string {
  if (customName && customName.includes(' ')) {
    return customName.replaceAll(/\s+/g, '-');
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

interface GetSingleUrlRequest extends Request {
  params: {
    id: string;
  };
}

export const getSingleUrl = async (req: GetSingleUrlRequest, res: Response) => {
  try {
    const { id } = req.params;
    const objectids = id.trim();

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(objectids)) {
      return res.status(400).json({ error: 'invalid id format' });
    }

    // Query the database to find the URL by ID
    const findOneUrl = await ShortenedURL.findById(objectids);

    // If the URL with the given ID is not found, return an error
    if (!findOneUrl) {
      return res.status(404).json({ error: 'url not found' });
    }

    // Return the URL
    return res.status(200).json(findOneUrl);
  } catch {
    return res.status(500).json({ error: 'internal server error' });
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

interface UpdateURLRequest extends Request {
  body: {
    objectid: string;
    originalUrl?: string;
    customName?: string;
  };
}

export const updateURL = async (req: UpdateURLRequest, res: Response) => {
  const { objectid, originalUrl, customName } = req.body;

  try {
    // Query the database to find the URL by ID
    const urlToUpdate = await ShortenedURL.findById(objectid);

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
