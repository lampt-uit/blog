import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import NotFound from '../components/global/NotFound';
import { FormSubmit, RootStore, ICategory } from '../utils/TypeScript';
import {
	createCategory,
	updateCategory,
	deleteCategory
} from '../redux/actions/categoryAction';

const Category = () => {
	const dispatch = useDispatch();
	const { auth, categories } = useSelector((state: RootStore) => state);

	const [name, setName] = useState('');
	const [edit, setEdit] = useState<ICategory | null>(null);

	useEffect(() => {
		if (edit) setName(edit.name);
	}, [edit]);

	const handleSubmit = (e: FormSubmit) => {
		e.preventDefault();

		if (!auth.access_token || !name) return;

		if (edit) {
			if (edit.name === name) return;
			const data = { ...edit, name };
			// console.log(data);

			dispatch(updateCategory(data, auth.access_token));
		} else {
			dispatch(createCategory(name, auth.access_token));
		}
		setName('');
		setEdit(null);
	};

	const handleDelete = (id: string) => {
		// console.log(id);
		if (!auth.access_token) return;
		dispatch(deleteCategory(id, auth.access_token));
	};

	if (auth.user?.role !== 'admin') return <NotFound />;
	return (
		<div className='category'>
			<form onSubmit={handleSubmit}>
				<label htmlFor='category'>Category</label>
				<div className='d-flex align-items-center'>
					{edit && (
						<i
							className='fas fa-times me-2 text-danger'
							style={{ cursor: 'pointer' }}
							onClick={() => setEdit(null)}
						></i>
					)}
					<input
						type='text'
						name='category'
						id='category'
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<button type='submit'>{edit ? 'Update' : 'Create'}</button>
				</div>
			</form>

			<div>
				{categories.map((category) => (
					<div className='category_row' key={category._id}>
						<p className='m-0 text-capitalize'>{category.name}</p>
						<div>
							<i
								className='fas fa-edit mx-2'
								onClick={() => setEdit(category)}
							></i>
							<i
								className='fas fa-trash-alt'
								onClick={() => handleDelete(category._id)}
							></i>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Category;
