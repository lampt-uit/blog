import { Request, Response } from 'express';

import Categories from '../models/category.model';
import { IReqAuth } from '../config/interface';

const categoryController = {
	createCategory: async (req: IReqAuth, res: Response) => {
		if (!req.user)
			return res.status(400).json({ msg: 'Invalid Authentication.' });
		if (req.user.role !== 'admin')
			return res.status(400).json({ msg: 'Invalid Authentication.' });
		try {
			const name = req.body.name.toLowerCase();
			// console.log({ name });

			const newCategory = new Categories({ name });
			await newCategory.save();

			res.json({ newCategory });
		} catch (error: any) {
			let errMsg;

			if (error.code === 11000) {
				// console.log(error);
				errMsg = Object.values(error.keyValue)[0] + ' already exists.';
			} else {
				let name = Object.keys(error.errors)[0];
				errMsg = error.errors[`${name}`].message;
			}
			return res.status(500).json({ msg: errMsg });
		}
	},
	getCategories: async (req: IReqAuth, res: Response) => {
		try {
			const categories = await Categories.find().sort('-createdAt');
			res.json({ categories });
		} catch (error: any) {
			return res.status(500).json({ msg: error.message });
		}
	},
	updateCategory: async (req: IReqAuth, res: Response) => {
		if (!req.user)
			return res.status(400).json({ msg: 'Invalid Authentication.' });
		if (req.user.role !== 'admin')
			return res.status(400).json({ msg: 'Invalid Authentication.' });
		try {
			const category = await Categories.findByIdAndUpdate(
				{
					_id: req.params.id
				},
				{ name: req.body.name }
			);

			res.json({ msg: 'Update success.' });
		} catch (error: any) {
			let errMsg;

			if (error.code === 11000) {
				// console.log(error);
				errMsg = Object.values(error.keyValue)[0] + ' already exists.';
			} else {
				let name = Object.keys(error.errors)[0];
				errMsg = error.errors[`${name}`].message;
			}
			return res.status(500).json({ msg: errMsg });
		}
	},
	deleteCategory: async (req: IReqAuth, res: Response) => {
		if (!req.user)
			return res.status(400).json({ msg: 'Invalid Authentication.' });
		if (req.user.role !== 'admin')
			return res.status(400).json({ msg: 'Invalid Authentication.' });
		try {
			const category = await Categories.findByIdAndDelete(req.params.id);

			res.json({ msg: 'Delete success.' });
		} catch (error: any) {
			let errMsg;

			if (error.code === 11000) {
				// console.log(error);
				errMsg = Object.values(error.keyValue)[0] + ' already exists.';
			} else {
				let name = Object.keys(error.errors)[0];
				errMsg = error.errors[`${name}`].message;
			}
			return res.status(500).json({ msg: errMsg });
		}
	}
};

export default categoryController;
