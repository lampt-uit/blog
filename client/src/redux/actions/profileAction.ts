import { Dispatch } from 'redux';

import { IAuth, IAuthType, AUTH } from '../types/authType';
import { IAlertType, ALERT } from '../types/alertType';
import { checkImage, imageUpload } from '../../utils/ImageUpload';
import { patchAPI } from './../../utils/FetchData';

export const updateUser =
	(avatar: File, name: string, auth: IAuth) =>
	async (dispatch: Dispatch<IAlertType | IAuthType>) => {
		// console.log({ avatar, name, auth });
		//Check auth
		if (!auth.access_token || !auth.user) return;

		let url = '';
		try {
			dispatch({ type: ALERT, payload: { loading: true } });
			if (avatar) {
				const check = checkImage(avatar);
				if (check) return dispatch({ type: ALERT, payload: { errors: check } });
				const photo = await imageUpload(avatar);
				// console.log(photo);

				url = photo.url;
			}
			dispatch({
				type: AUTH,
				payload: {
					access_token: auth.access_token,
					user: {
						...auth.user,
						avatar: url ? url : auth.user.avatar,
						name: name ? name : auth.user.name
					}
				}
			});

			const res = await patchAPI(
				'user',
				{
					avatar: url ? url : auth.user.avatar,
					name: name ? name : auth.user.name
				},
				auth.access_token
			);
			// console.log(res);

			dispatch({ type: ALERT, payload: { success: res.data.msg } });
		} catch (error) {
			dispatch({ type: ALERT, payload: { errors: error.response.data.msg } });
		}
	};
