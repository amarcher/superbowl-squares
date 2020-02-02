import React from 'react';

const style = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
};

export default function Score({
	digit,
	backgroundColor,
	color,
}) {
	return (
		<div style={{...style, backgroundColor, color }}>
			{digit}
		</div>
	);
}
