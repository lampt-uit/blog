import express from 'express';
import authController from '../controllers/auth.controller';
import { validRegister } from '../middleware/valid';

const router = express.Router();

router.post('/register', validRegister, authController.register);

export default router;
