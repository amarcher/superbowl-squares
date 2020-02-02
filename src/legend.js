import React from 'react';

const containerStyle = {
	position: 'relative',
};

const xStyle = {
	position: 'absolute',
	top: 0,
	bottom: 0,
	right: 0,
	textAlign: 'center',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
}

const rotate = {
	transformOrigin: 'center',
	transform: 'rotate(-90deg)',
}

const yStyle = {
	position: 'absolute',
	bottom: 0,
	left: 0,
	right: 0,
	textAlign: 'center',
}

export default function Legend({
	x,
	y,
}) {
	return (
		<div style={containerStyle}>
			<div style={xStyle}>
				<div style={rotate}>
					{x}
				</div>
			</div>
			<div style={yStyle}>
				{y}
			</div>
		</div>
	);
}
