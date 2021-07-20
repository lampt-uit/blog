import { Response } from 'express';
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
	}
};

export default userController;
