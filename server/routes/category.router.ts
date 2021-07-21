import express from 'express';

import categoryController from '../controllers/category.controller';
import auth from '../middleware/auth';

const router = express.Router();

router
	.route('/category')
	.post(auth, categoryController.createCategory)
	.get(categoryController.getCategories);

router
	.route('/category/:id')
	.patch(auth, categoryController.updateCategory)
	.delete(auth, categoryController.deleteCategory);

export default router;
