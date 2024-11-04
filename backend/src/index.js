import express from 'express';
import * as apiConfig from '../constant';
import manageKohaOpacRouter from './manage-koha-opac';

const router = express.Router();

router.use((req, res, next) => {
  console.log('All Route Are Configuring');
  next();
});

router.use(apiConfig.APPLICATION_URL, manageKohaOpacRouter);

export default router;
