import { Request, Response } from 'express';
import mongoose from 'mongoose';

import Blogs from '../models/blog.model';
import { IReqAuth } from '../config/interface';

const Pagination = (req: IReqAuth) => {
	let page = Number(req.query.page) * 1 || 1;
	let limit = Number(req.query.limit) * 1 || 4;
	let skip = (page - 1) * limit;

	return { page, limit, skip };
};

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
	},
	getBlogsByCategory: async (req: Request, res: Response) => {
		const { limit, skip } = Pagination(req);
		try {
			const Data = await Blogs.aggregate([
				{
					$facet: {
						totalData: [
							{
								$match: {
									category: mongoose.Types.ObjectId(req.params.category_id)
								}
							},
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
							{
								$sort: { createdAt: -1 }
							},
							{
								$skip: skip
							},
							{
								$limit: limit
							}
						],
						totalCount: [
							{
								$match: {
									category: mongoose.Types.ObjectId(req.params.category_id)
								}
							},
							{
								$count: 'count'
							}
						]
					}
				},
				{
					$project: {
						count: { $arrayElemAt: ['$totalCount.count', 0] },
						totalData: 1
					}
				}
			]);

			const blogs = Data[0].totalData;
			const count = Data[0].count;

			//Pagination
			let total = 0;

			if (count % limit === 0) {
				total = count / limit;
			} else {
				total = Math.floor(count / limit) + 1;
			}

			res.json({ blogs, total });
		} catch (error) {
			return res.status(500).json({ msg: error.message });
		}
	}
};

export default blogController;
