import { Dispatch } from 'redux';

import { IBlog } from '../../utils/TypeScript';
import { ALERT, IAlertType } from '../types/alertType';
import { imageUpload } from '../../utils/ImageUpload';
import { postAPI, getAPI } from '../../utils/FetchData';
import { GET_HOME_BLOGS, IGetHomeBlogsType } from '../types/blogType';

export const createBlog =
	(blog: IBlog, token: string) => async (dispatch: Dispatch<IAlertType>) => {
		let url = '';
		try {
			dispatch({ type: ALERT, payload: { loading: true } });

			if (typeof blog.thumbnail !== 'string') {
				const photo = await imageUpload(blog.thumbnail);
				url = photo.url;
			} else {
				url = blog.thumbnail;
			}

			const newBlog = { ...blog, thumbnail: url };
			await postAPI('blog', newBlog, token);

			dispatch({ type: ALERT, payload: { loading: false } });
		} catch (error: any) {
			dispatch({ type: ALERT, payload: { errors: error.response.data.msg } });
		}
	};

export const getHomeBlogs =
	() => async (dispatch: Dispatch<IAlertType | IGetHomeBlogsType>) => {
		try {
			dispatch({ type: ALERT, payload: { loading: true } });
			const res = await getAPI('home/blogs');
			// console.log(res);
			dispatch({ type: GET_HOME_BLOGS, payload: res.data });
			dispatch({ type: ALERT, payload: { loading: false } });
		} catch (error: any) {
			dispatch({ type: ALERT, payload: { errors: error.response.data.msg } });
		}
	};
