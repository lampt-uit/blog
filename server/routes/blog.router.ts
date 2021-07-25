import express from 'express';

import blogController from '../controllers/blog.controller';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/blog', auth, blogController.createBlog);

export default router;
