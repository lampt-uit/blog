import { Dispatch } from 'redux';

import { AUTH, IAuthType } from '../types/authType';
import { ALERT, IAlertType } from './../types/alertType';
import { IUserLogin, IUserRegister } from '../../utils/TypeScript';
import { postAPI, getAPI } from '../../utils/FetchData';
import { validRegister, validatePhone } from '../../utils/Valid';

export const login =
	(userLogin: IUserLogin) =>
	async (dispatch: Dispatch<IAuthType | IAlertType>) => {
		// console.log(userLogin);
		try {
			dispatch({ type: ALERT, payload: { loading: true } });
			const res = await postAPI('login', userLogin);
			// console.log(res);

			dispatch({
				type: AUTH,
				payload: res.data
			});

			dispatch({ type: ALERT, payload: { success: res.data.msg } });

			localStorage.setItem('logged', 'ls');
		} catch (error: any) {
			dispatch({ type: ALERT, payload: { errors: error.response.data.msg } });
		}
	};
export const register =
	(userRegister: IUserRegister) =>
	async (dispatch: Dispatch<IAuthType | IAlertType>) => {
		// console.log(userRegister);
		const check = validRegister(userRegister);
		// console.log(check);
		if (check.errLength > 0) {
			return dispatch({ type: ALERT, payload: { errors: check.errMsg } });
		}

		try {
			dispatch({ type: ALERT, payload: { loading: true } });

			const res = await postAPI('register', userRegister);
			console.log(res);

			dispatch({ type: ALERT, payload: { success: res.data.msg } });
		} catch (error: any) {
			dispatch({ type: ALERT, payload: { errors: error.response.data.msg } });
		}
	};
export const refreshToken =
	() => async (dispatch: Dispatch<IAuthType | IAlertType>) => {
		const logged = localStorage.getItem('logged');
		if (logged !== 'ls') return;

		try {
			dispatch({ type: ALERT, payload: { loading: true } });
			const res = await getAPI('refresh_token');
			// console.log(res);

			dispatch({ type: AUTH, payload: res.data });
			dispatch({ type: ALERT, payload: {} });
		} catch (error: any) {
			dispatch({ type: ALERT, payload: { errors: error.response.data.msg } });
		}
	};
export const logout =
	() => async (dispatch: Dispatch<IAuthType | IAlertType>) => {
		try {
			localStorage.removeItem('logged');
			await getAPI('logout');
			window.location.href = '/';
		} catch (error: any) {
			dispatch({ type: ALERT, payload: { errors: error.response.data.msg } });
		}
	};
export const googleLogin =
	(id_token: string) => async (dispatch: Dispatch<IAuthType | IAlertType>) => {
		try {
			dispatch({ type: ALERT, payload: { loading: true } });
			const res = await postAPI('google_login', { id_token });
			// console.log(res);

			dispatch({
				type: AUTH,
				payload: res.data
			});

			dispatch({ type: ALERT, payload: { success: res.data.msg } });

			localStorage.setItem('logged', 'ls');
		} catch (error: any) {
			dispatch({ type: ALERT, payload: { errors: error.response.data.msg } });
		}
	};
export const facebookLogin =
	(accessToken: string, userID: string) =>
	async (dispatch: Dispatch<IAuthType | IAlertType>) => {
		try {
			dispatch({ type: ALERT, payload: { loading: true } });
			const res = await postAPI('facebook_login', { accessToken, userID });

			dispatch({
				type: AUTH,
				payload: res.data
			});

			dispatch({ type: ALERT, payload: { success: res.data.msg } });

			localStorage.setItem('logged', 'ls');
		} catch (error: any) {
			dispatch({ type: ALERT, payload: { errors: error.response.data.msg } });
		}
	};
export const loginSMS =
	(phone: string) => async (dispatch: Dispatch<IAuthType | IAlertType>) => {
		const check = validatePhone(phone);
		// console.log(check);
		if (!check)
			return dispatch({
				type: ALERT,
				payload: { errors: 'Phone number format is incorrect.' }
			});
		try {
			dispatch({ type: ALERT, payload: { loading: true } });
			const res = await postAPI('login_sms', { phone });
			// console.log(res);
			if (!res.data.valid) {
				verifySMS(phone, dispatch);
			}
		} catch (error: any) {
			dispatch({ type: ALERT, payload: { errors: error.response.data.msg } });
		}
	};
export const verifySMS = async (
	phone: string,
	dispatch: Dispatch<IAuthType | IAlertType>
) => {
	const code = prompt('Enter your code');
	if (!code) return;
	try {
		dispatch({ type: ALERT, payload: { loading: true } });
		const res = await postAPI('sms_verify', { phone, code });
		// console.log(res);
		dispatch({
			type: AUTH,
			payload: res.data
		});

		dispatch({ type: ALERT, payload: { success: res.data.msg } });

		localStorage.setItem('logged', 'ls');
	} catch (error: any) {
		dispatch({ type: ALERT, payload: { errors: error.response.data.msg } });
		setTimeout(() => {
			verifySMS(phone, dispatch);
		}, 100);
	}
};
