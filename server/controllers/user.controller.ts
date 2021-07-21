import { Response } from 'express';
import bcrypt from 'bcrypt';

import { IReqAuth } from '../config/interface';
import Users from '../models/user.model';

const userController = {
	updateUser: async (req: IReqAuth, res: Response) => {
		if (!req.user)
			return res.status(400).json({ msg: 'Invalid Authentication.' });
		try {
			// console.log(req.user);

			const { avatar, name } = req.body;

			await Users.findOneAndUpdate(
				{ _id: req.user._id },
				{
					avatar,
					name
				}
			);
			res.json({ msg: 'Updated success.' });
		} catch (error) {
			return res.status(500).json({ msg: error.message });
		}
	},
	resetPassword: async (req: IReqAuth, res: Response) => {
		if (!req.user)
			return res.status(400).json({ msg: 'Invalid Authentication.' });

		//User use HTML cheat
		if (req.user.type !== 'register') {
			return res.status(400).json({
				msg: `Quick login account with ${req.user.type} can't use this function.`
			});
		}
		try {
			// console.log(req.user)

			const { password } = req.body;
			const passwordHash = await bcrypt.hash(password, 12);

			await Users.findOneAndUpdate(
				{ _id: req.user._id },
				{
					password: passwordHash
				}
			);
			res.json({ msg: 'Reset password success.' });
		} catch (error) {
			return res.status(500).json({ msg: error.message });
		}
	}
};

export default userController;
