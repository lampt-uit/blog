import { Request, Response } from 'express';
import Users from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch';

import {
	generateActiveToken,
	generateAccessToken,
	generateRefreshToken
} from '../config/generateToken';
import sendMail from '../config/sendMail';
import { validateEmail, validatePhone } from '../middleware/valid';

import { sendSMS } from './../config/sendSMS';
import {
	IDecodedToken,
	IUser,
	IGgPayload,
	IUserParams
} from '../config/interface';

const client = new OAuth2Client(`${process.env.MAIL_CLIENT_ID}`);
const CLIENT_URL = `${process.env.BASE_URL}`;

const authController = {
	register: async (req: Request, res: Response) => {
		try {
			const { name, account, password } = req.body;

			const user = await Users.findOne({ account });
			if (user)
				return res
					.status(400)
					.json({ msg: 'Email or Phone number already exists.' });

			const passwordHash = await bcrypt.hash(password, 12);

			const newUser = {
				name,
				account,
				password: passwordHash
			};

			const active_token = generateActiveToken({ newUser });
			const url = `${CLIENT_URL}/active/${active_token}`;

			if (validateEmail(account)) {
				sendMail(account, url, 'Verify your email address');
				return res.json({ msg: 'Success! Please check your email.' });
			} else if (validatePhone(account)) {
				sendSMS(account, url, 'Verify your phone number');
				return res.json({ msg: 'Success! Please check your phone.' });
			}
		} catch (error: any) {
			return res.status(500).json({ msg: error.message });
		}
	},
	activeAccount: async (req: Request, res: Response) => {
		try {
			const { active_token } = req.body;
			const decoded = <IDecodedToken>(
				jwt.verify(active_token, `${process.env.ACTIVE_TOKEN_SECRET}`)
			);

			// console.log(decoded);

			const { newUser } = decoded;
			if (!newUser)
				return res.status(400).json({ msg: 'Invalid authentication.' });

			const user = await Users.findOne({ account: newUser.account });
			if (user) return res.status(400).json({ msg: 'Account already exists.' });

			const new_user = new Users(newUser);
			await new_user.save();

			res.json({ msg: 'Account has been activated.' });
		} catch (error: any) {
			// let errorMsg;

			// if (error.code === 11000) {
			// 	errorMsg = Object.keys(error.keyValue)[0] + ' already exists.';
			// } else {
			// 	let name = Object.keys(error.errors)[0];
			// 	errorMsg = error.errors[`${name}`].message;
			// }
			return res.status(500).json({ msg: error.message });
		}
	},
	login: async (req: Request, res: Response) => {
		try {
			const { account, password } = req.body;

			const user = await Users.findOne({ account });
			if (!user)
				return res.status(400).json({ msg: 'This account does not exits.' });

			//if user exists
			loginUser(user, password, res);
		} catch (error: any) {
			return res.status(500).json({ msg: error.message });
		}
	},
	logout: async (req: Request, res: Response) => {
		try {
			res.clearCookie('refreshtoken', { path: `/api/refresh_token` });

			return res.json({ msg: 'Logged Out.' });
		} catch (error: any) {
			return res.status(500).json({ msg: error.message });
		}
	},
	refreshToken: async (req: Request, res: Response) => {
		try {
			const rf_token = req.cookies.refreshtoken;
			if (!rf_token) return res.status(400).json({ msg: 'Please login now.' });

			const decoded = <IDecodedToken>(
				jwt.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`)
			);
			if (!decoded.id)
				return res.status(400).json({ msg: 'Please login now.' });

			const user = await Users.findById(decoded.id).select('-password');
			if (!user)
				return res.status(400).json({ msg: 'This account does not exist.' });

			const access_token = generateAccessToken({ id: user._id });

			res.json({ access_token, user });
		} catch (error: any) {
			return res.status(500).json({ msg: error.message });
		}
	},
	googleLogin: async (req: Request, res: Response) => {
		try {
			const { id_token } = req.body;
			// console.log(id_token);
			const verify = await client.verifyIdToken({
				idToken: id_token,
				audience: `${process.env.MAIL_CLIENT_ID}`
			});
			// console.log(verify);
			const { email, email_verified, name, picture } = <IGgPayload>(
				verify.getPayload()
			);
			// console.log({ email, email_verified, name, picture });

			if (!email_verified) {
				return res.status(400).json({ msg: 'Email verification failed.' });
			}

			const password = email + `${process.env.MAIL_CLIENT_SECRET}`;
			const passwordHash = await bcrypt.hash(password, 12);

			const user = await Users.findOne({ account: email });
			if (user) {
				loginUser(user, password, res);
			} else {
				const user = {
					name,
					account: email,
					password: passwordHash,
					avatar: picture,
					type: 'login'
				};
				registerUser(user, res);
			}
		} catch (error: any) {
			return res.status(500).json({ msg: error.message });
		}
	},
	facebookLogin: async (req: Request, res: Response) => {
		try {
			const { accessToken, userID } = req.body;
			// console.log({ accessToken, userID });

			const URL = `https://graph.facebook.com/v3.0/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;
			const data = await fetch(URL)
				.then((res) => res.json())
				.then((res) => {
					return res;
				});
			// console.log(data);

			const { id, email, name, picture } = data;
			const password = email + `${process.env.FACEBOOK_SECRET}`;
			const passwordHash = await bcrypt.hash(password, 12);

			const user = await Users.findOne({ account: email });
			if (user) {
				loginUser(user, password, res);
			} else {
				const user = {
					name,
					account: email,
					password: passwordHash,
					avatar: picture.data.url,
					type: 'login'
				};
				registerUser(user, res);
			}
		} catch (error: any) {
			return res.status(500).json({ msg: error.message });
		}
	}
};

const loginUser = async (user: IUser, password: string, res: Response) => {
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) return res.status(400).json({ msg: 'Password is incorrect.' });

	const access_token = generateAccessToken({ id: user._id });
	const refresh_token = generateRefreshToken({ id: user._id });

	res.cookie('refreshtoken', refresh_token, {
		httpOnly: true,
		path: `/api/refresh_token`,
		maxAge: 30 * 24 * 60 * 60 * 1000 //30days
	});

	res.json({
		msg: 'Login Success.',
		access_token,
		user: { ...user._doc, password: '' }
	});
};

const registerUser = async (user: IUserParams, res: Response) => {
	const newUser = new Users(user);
	await newUser.save();

	const access_token = generateAccessToken({ id: newUser._id });
	const refresh_token = generateRefreshToken({ id: newUser._id });

	res.cookie('refreshtoken', refresh_token, {
		httpOnly: true,
		path: `/api/refresh_token`,
		maxAge: 30 * 24 * 60 * 60 * 1000 //30days
	});

	res.json({
		msg: 'Login Success.',
		access_token,
		user: { ...newUser._doc, password: '' }
	});
};

export default authController;
