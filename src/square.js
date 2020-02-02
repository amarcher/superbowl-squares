import React, { useCallback } from 'react';

const baseStyle = {
};

export default function Square({
	id,
	ownerColor,
	ownerName,
	claim,
	unclaim,
}) {
	const onClick = useCallback(() => {
		if (ownerColor) {
			unclaim(id);
		} else {
			claim(id);
		}
	}, [claim, unclaim, id, ownerColor]);

	const style = {
		...baseStyle,
		backgroundColor: ownerColor ? ownerColor : 'white',
	};

	return (
		<button onClick={onClick} style={style}>
			<div className="square">
				{ownerName}
			</div>
		</button>
	);
}
