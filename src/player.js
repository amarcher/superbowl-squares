import React, { useCallback } from 'react';

const baseStyle = {
	minWidth: 100,
	minHeight: 40,
	borderRadius: 5,
	marginBottom: 10,
	flex: '1 1 auto',
};

export default function Player({
	id,
	ownedSquares,
	setActive,
	color,
	name
}) {
	const onClick = useCallback(() => {
		setActive(id);
	}, [setActive, id]);

	const style = {
		...baseStyle,
		backgroundColor: color,
	};

	return (
		<button onClick={onClick} style={style}>
			<div className="player">
				{name} ({ownedSquares.length})
			</div>
		</button>
	);
}
