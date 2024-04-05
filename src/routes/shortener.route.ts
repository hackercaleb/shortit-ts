import { Router } from 'express';
import { createUrls, getUrls, deleteUrl } from '../controllers/shortener.controller';
//import {
// urlValidatorRules,
// updateUrlValidatorRules,
//} from '../middleware/urlValidator';
//import { validate } from '../middleware/validate';

const router: Router = Router();

router.post('/urls', createUrls);
router.get('/urls', getUrls);
router.delete('/urls/:id', deleteUrl);

export default router;
