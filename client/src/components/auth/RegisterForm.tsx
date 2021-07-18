import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { FormSubmit, InputChange } from '../../utils/TypeScript';
import { register } from '../../redux/actions/authAction';

const RegisterForm = () => {
	const initialState = { name: '', account: '', password: '', cf_password: '' };
	const [userRegister, setUserRegister] = useState(initialState);
	const { name, account, password, cf_password } = userRegister;

	const [typePass, setTypePass] = useState(false);
	const [typeCfPass, setTypeCfPass] = useState(false);

	const dispatch = useDispatch();

	const handleChangeInput = (e: InputChange) => {
		const { value, name } = e.target;
		setUserRegister({ ...userRegister, [name]: value });
	};

	const handleSubmit = (e: FormSubmit) => {
		e.preventDefault();
		dispatch(register(userRegister));
	};

	return (
		<form className='form-group' onSubmit={handleSubmit}>
			<div className='form-group mb-3'>
				<label htmlFor='name' className='form-label'>
					Name
				</label>
				<input
					type='text'
					className='form-control'
					id='name'
					name='name'
					value={name}
					onChange={handleChangeInput}
					placeholder='Your name up to 20 chars.'
				/>
			</div>
			<div className='form-group mb-3'>
				<label htmlFor='account' className='form-label'>
					Email / Phone number
				</label>
				<input
					type='text'
					className='form-control'
					id='account'
					name='account'
					onChange={handleChangeInput}
					placeholder='Example@gmail.com / + 84948549877'
				/>
			</div>
			<div className='form-group mb-3'>
				<label htmlFor='password' className='form-label'>
					Password
				</label>
				<div className='pass'>
					<input
						type={typePass ? 'text' : 'password'}
						className='form-control'
						id='password'
						name='password'
						onChange={handleChangeInput}
						value={password}
						placeholder='Password must be at least 6 chars.'
					/>

					<small onClick={() => setTypePass(!typePass)}>
						{typePass ? 'Hide' : 'Show'}
					</small>
				</div>
			</div>
			<div className='form-group mb-3'>
				<label htmlFor='cf_password' className='form-label'>
					Confirm Password
				</label>
				<div className='pass'>
					<input
						type={typeCfPass ? 'text' : 'password'}
						className='form-control'
						id='cf_password'
						name='cf_password'
						onChange={handleChangeInput}
						value={cf_password}
						placeholder='Must be match your password.'
					/>

					<small onClick={() => setTypeCfPass(!typeCfPass)}>
						{typeCfPass ? 'Hide' : 'Show'}
					</small>
				</div>
			</div>
			<button
				type='submit'
				className='btn btn-dark w-100 my-1'
				disabled={name && account && password && cf_password ? false : true}
			>
				Register
			</button>
		</form>
	);
};

export default RegisterForm;
