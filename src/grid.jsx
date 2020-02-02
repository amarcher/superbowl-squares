import React, { useReducer, useCallback, useState } from 'react';
import Square from './square';
import Player from './player';

const emptySquare = {
	ownerId: undefined,
};

const emptyPlayer = {
};

function getEmptySquare(id) {
	return {
		...emptySquare,
		id: id,
	};
}

const names = ['AMA', 'AYA', 'FB', 'JB', 'ZM', 'MZ'];
const colors = ['#b7d4b7', '#0023b7', '#231F92', '#331F92', '#931F92', '#07d4b7'];

function getEmptyPlayer(id) {
	return {
		...emptyPlayer,
		color: colors[id],
		id: id,
		name: names[id],
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

function gridReducer(state, { type, payload }) {
	switch (type) {
		case 'claim':
			console.log({
				[payload.id]: {
					...state[payload.id],
					ownerId: payload.ownerId,
				},
			})
			return {
				...state,
				[payload.id]: {
					...state[payload.id],
					ownerId: payload.ownerId,
				},
			};
		case 'unclaim':
			return {
				...state,
				[payload.id]: {
					...state[payload.id],
					ownerId: undefined,
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
	const [grid, dispatch] = useReducer(gridReducer, initialGrid);
	const [players, setPlayers] = useState('012345'.split('').reduce((players, playerId) => ({
		...players,
		[playerId]: getEmptyPlayer(playerId),
	}), {}));
	const [activePlayerId, setActivePlayerId] = useState('0'); 

 	const claim = useCallback((id) => {
		dispatch({
			type: 'claim',
			payload: {
				id,
				ownerId: activePlayerId,
			},
		});
 	}, [dispatch, activePlayerId]);
 	const unclaim = useCallback((id) => {
		dispatch({
			type: 'unclaim',
			payload: {
				id,
			},
		});
 	}, [dispatch]);
 	const getSquaresOwnedByPlayer = useCallback((ownerId) => {
 		return Object.keys(grid).filter((id) => grid[id].ownerId === ownerId);
 	}, [grid]);


 	const sanFrancisco = {};
 	const kansaCity = {};
 	const container = {};

	return (
		<div style={{
			display: 'flex',
  			justifyContent: 'center',
  			flexDirection: 'column',
		}}>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				{Object.values(players).map(({ id, name, color }) => (
					<Player key={id} id={id} name={name} color={color} ownedSquares={getSquaresOwnedByPlayer(id)} setActive={setActivePlayerId} />
				))}
			</div>
			<div>
				<div style={sanFrancisco}>
				</div>
				<div style={container}>
					<div style={kansaCity}>
					</div>
					<div style={style}>
						{fullIds.map((id) => {
							const { color, name } = players[grid[id].ownerId] || {};
							return (
								<Square key={id} ownerColor={color} id={id} ownerName={name} claim={claim} unclaim={unclaim} />
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
