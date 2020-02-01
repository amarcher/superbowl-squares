import React, { useReducer, useCallback } from 'react';
import Square from './square';

const emptySquare = {
	isOwned: false,
};

function getEmptySquare(id) {
	return {
		...emptySquare,
		id: id,
	};
}

const ids = '0123456789'.split('');
const fullIds = ids.reduce((grid, rowNumber) => ([
	...grid,
	...ids.reduce((row, columnNumber) => ([
		...row,
		`${rowNumber}${columnNumber}`,
	]), []),
]), []);

const initialGrid = fullIds.reduce((grid, id) => ({
	...grid,
	[id]: getEmptySquare(id),
}), {});

function reducer(state, { type, payload }) {
	switch (type) {
		case 'claim':
			return {
				...state,
				[payload.id]: {
					isOwned: true,
				},
			};
		case 'unclaim':
			return {
				...state,
				[payload.id]: {
					isOwned: false,
				},
			};
		default:
			throw new Error();
	}
}

const style = {
	display: 'grid',
	height: '80vh',
	width: '80vw',
	gridTemplateColumns: `repeat(10, [col-start] 1fr)`,
	justifyItems: 'stretch',
};

export default function Grid({
	isOwned,
	onClick,
}) {
	const [grid, dispatch] = useReducer(reducer, initialGrid);

 	const claim = useCallback((id) => {
		dispatch({
			type: 'claim',
			payload: {
				id,
			},
		});
 	}, [dispatch]);
 	const unclaim = useCallback((id) => {
		dispatch({
			type: 'unclaim',
			payload: {
				id,
			},
		});
 	}, [dispatch]);

	return (
		<div style={style}>
			{fullIds.map((id) => (
				<Square key={id} {...grid[id]} claim={claim} unclaim={unclaim} />
			))}
		</div>
	);
}
