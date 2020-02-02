import React, { useCallback } from 'react';

const baseStyle = {
	minWidth: 100,
	minHeight: 40,
	borderRadius: 5,
	marginBottom: 10,
	marginRight: 5,
	flex: '1 1 auto',
	outline: 'none',

	':focus': {
		outline: 'none',
	},
};

export default function Player({
	id,
	ownedSquares,
	setActive,
	color,
	name,
	isActive,
}) {
	const onClick = useCallback(() => {
		setActive(id);
	}, [setActive, id]);

	const style = {
		...baseStyle,
		backgroundColor: color,
		boxShadow: isActive ? 'black 0px 0px 5pt 1pt' : 'none',
	};

	return (
		<button onClick={onClick} style={style}>
			<div className="player">
				{name} ({ownedSquares.length})
			</div>
		</button>
	);
}
