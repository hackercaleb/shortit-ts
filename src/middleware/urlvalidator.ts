import { body, ValidationChain } from 'express-validator';

export const urlValidatorRules: ValidationChain[] = [
  body('originalUrl', 'URL should be a valid URL').isURL().notEmpty(),
  body('customName', 'Custom name should be atleast 5 letters').optional().isLength({ min: 5 })
];

export const updateUrlValidatorRules: ValidationChain[] = [
  body('originalUrl', 'URL should be a valid URL').optional().isURL(),
  body('customName', 'Custom name should be atleast 5 letters').optional().isLength({ min: 5 })
];
