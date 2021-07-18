import { Dispatch } from 'redux';

import { AUTH, IAuthType } from '../types/authType';
import { ALERT, IAlertType } from './../types/alertType';
import { IUserLogin, IUserRegister } from '../../utils/TypeScript';
import { postAPI } from '../../utils/FetchData';
import { validRegister } from '../../utils/Valid';

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
