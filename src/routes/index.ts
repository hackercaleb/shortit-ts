import { Router } from 'express';
import shortenerRoute from './shortener.route';

const router: Router = Router();

router.use('/', shortenerRoute);

export default router;
