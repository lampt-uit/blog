import express from 'express';

import auth from '../middleware/auth';
import userController from '../controllers/user.controller';

const router = express.Router();

router.patch('/user', auth, userController.updateUser);

export default router;
