import React, { useReducer, useCallback, useState } from 'react';
import { getRandomDigits } from './utils';
import Square from './square';
import Player from './player';
import Score from './score';
import Legend from './legend';

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
	height: '90vh',
	width: '90vw',
	display: 'grid',
	gridTemplateColumns: `repeat(11, [col-start] 1fr)`,
	justifyItems: 'stretch',
};

const lockButtonStyle = {
	minWidth: 50,
	minHeight: 40,
	borderRadius: 5,
	marginBottom: 10,
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
	const [isLocked, setIsLocked] = useState(false);
	const [sfScore, setSfScore] = useState(Array(10).fill('?'));
	const [kcScore, setKcScore] = useState(Array(10).fill('?'));

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

	const lock = useCallback(() => {
		setIsLocked(true);
		setSfScore(getRandomDigits());
		setKcScore(getRandomDigits());
	}, []);

 	const unlock = useCallback(() => {
		setIsLocked(false);
		setSfScore(Array(10).fill('?'));
		setKcScore(Array(10).fill('?'));
	}, []);

 	const getSquaresOwnedByPlayer = useCallback((ownerId) => {
 		return Object.keys(grid).filter((id) => grid[id].ownerId === ownerId);
 	}, [grid]);

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
				<button onClick={isLocked ? unlock : lock } style={lockButtonStyle}>
					{isLocked ? 'Unlock' : 'Lock'}
				</button>
			</div>

			<div style={style}>
				<Legend x="SF" y="KC" />
				{sfScore.map((digit, index) => (
					<Score key={`sfDigit_${index}`} digit={digit} color="#AA0000" backgroundColor="#B3995D" />
				))}
				{fullIds.map((id) => {
					const { color, name } = players[grid[id].ownerId] || {};
					const square = <Square key={id} ownerColor={color} id={id} ownerName={name} claim={claim} unclaim={unclaim} />
					if (id[1] === '0') {
						const digit = kcScore[id[0]];
						const key = `kcDigit_${digit === '?' ? id[0] : digit}`
						return (
							<React.Fragment key={key}>
								<Score digit={digit} color="#FFB81C" backgroundColor="#E31837" />
								{square}
							</React.Fragment>
						)
					}

					return square;
				})}
			</div>
		</div>
	);
}
