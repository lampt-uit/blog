import { Dispatch } from 'redux';

import { AUTH, IAuthType } from '../types/authType';
import { ALERT, IAlertType } from './../types/alertType';
import { IUserLogin } from '../../utils/TypeScript';
import { postAPI } from '../../utils/FetchData';

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
				payload: {
					token: res.data.access_token,
					user: res.data.user
				}
			});

			dispatch({ type: ALERT, payload: { success: 'Login Success!' } });
		} catch (error: any) {
			dispatch({ type: ALERT, payload: { errors: error.response.data.msg } });
		}
	};
