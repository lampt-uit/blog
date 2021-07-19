import React from 'react';
import { useDispatch } from 'react-redux';
import { GoogleLogin, GoogleLoginResponse } from 'react-google-login-lite';
import {
	FacebookLogin,
	FacebookLoginAuthResponse
} from 'react-facebook-login-lite';

import { googleLogin, facebookLogin } from '../../redux/actions/authAction';

const SocialLogin = () => {
	const dispatch = useDispatch();
	const onSuccess = (googleUser: GoogleLoginResponse) => {
		// console.log(googleUser);
		const id_token = googleUser.getAuthResponse().id_token;
		// console.log(id_token);
		dispatch(googleLogin(id_token));
	};

	const onFBSuccess = (response: FacebookLoginAuthResponse) => {
		// console.log(response);
		const { accessToken, userID } = response.authResponse;
		// console.log({ accessToken, userID });
		dispatch(facebookLogin(accessToken, userID));
	};

	return (
		<>
			<div className='my-2'>
				<GoogleLogin
					client_id='847063880150-4mf2jlbrbj93tkn9lbof1t5d175poq6l.apps.googleusercontent.com'
					cookiepolicy='single_host_origin'
					onSuccess={onSuccess}
				/>
			</div>

			<div className='my-2'>
				<FacebookLogin appId='818347965516477' onSuccess={onFBSuccess} />
			</div>
		</>
	);
};

export default SocialLogin;
