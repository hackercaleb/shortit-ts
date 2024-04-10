import { Router } from 'express';
import { createUrls, getUrls, deleteUrl } from '../controllers/shortener.controller';
import { urlValidatorRules } from '../middleware/urlvalidator';
import { validate } from '../middleware/validate';
const router: Router = Router();

router.post('/urls', urlValidatorRules, validate, createUrls);
router.get('/urls', getUrls);
router.delete('/urls/:id', deleteUrl);

export default router;
