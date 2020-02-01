import React, { useCallback } from 'react';

const baseStyle = {
};

export default function Square({
	id,
	isOwned,
	claim,
	unclaim,
}) {
	const onClick = useCallback(() => {
		if (isOwned) {
			unclaim(id);
		} else {
			claim(id);
		}
	}, [claim, unclaim, id, isOwned]);

	const style = {
		...baseStyle,
		backgroundColor: isOwned ? 'green' : 'white',
	};

	return (
		<button onClick={onClick} style={style}>
			<div className="square">
			</div>
		</button>
	);
}
