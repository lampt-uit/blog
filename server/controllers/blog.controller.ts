import { Request, Response } from 'express';

import Blogs from '../models/blog.model';
import { IReqAuth } from '../config/interface';

const blogController = {
	createBlog: async (req: IReqAuth, res: Response) => {
		if (!req.user)
			return res.status(400).json({ msg: 'Invalid Authentication.' });

		try {
			const { title, content, description, thumbnail, category } = req.body;

			const newBlog = new Blogs({
				user: req.user._id,
				title: title.toLowerCase(),
				content,
				description,
				thumbnail,
				category
			});

			await newBlog.save();
			res.json({ newBlog });
		} catch (error) {
			return res.status(500).json({ msg: error.message });
		}
	},
	getHomeBlogs: async (req: Request, res: Response) => {
		try {
			const blogs = await Blogs.aggregate([
				//Find user from user_id on Blogs
				{
					$lookup: {
						from: 'users',
						let: { user_id: '$user' },
						pipeline: [
							{
								$match: { $expr: { $eq: ['$_id', '$$user_id'] } }
							},
							{
								$project: { password: 0 }
							}
						],
						as: 'user'
					}
				},
				//user : array => object
				{
					$unwind: '$user'
				},
				//Find Category from category_id on Blogs
				{
					$lookup: {
						from: 'categories',
						localField: 'category',
						foreignField: '_id',
						as: 'category'
					}
				},
				// =>object
				{
					$unwind: '$category'
				},
				//Sorting
				{
					$sort: { createdAt: -1 }
				},
				//Group by category
				{
					$group: {
						_id: '$category._id',
						name: { $first: '$category.name' },
						blogs: { $push: '$$ROOT' },
						count: { $sum: 1 }
					}
				},
				//Pagination for blogs
				{
					$project: {
						blogs: {
							$slice: ['$blogs', 0, 4]
						},
						count: 1,
						name: 1
					}
				}
			]);
			res.json(blogs);
		} catch (error: any) {
			return res.status(400).json({ msg: error.message });
		}
	}
};

export default blogController;
