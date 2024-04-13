import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): Response<any, Record<string, any>> | void => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const validationErrors: ValidationError[] = errors.array();

  return res.status(400).json({ errors: validationErrors });
};
