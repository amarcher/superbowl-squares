// New soft player colors for better readability
export const PLAYER_COLORS: Record<string, { bg: string; text: string }> = {
  '0': { bg: '#86efac', text: '#166534' }, // Clint - soft green
  '1': { bg: '#fca5a5', text: '#991b1b' }, // Mike - soft red
  '2': { bg: '#a5b4fc', text: '#3730a3' }, // Andy - soft blue
  '3': { bg: '#67e8f9', text: '#164e63' }, // Matt - soft cyan
  '4': { bg: '#fde047', text: '#854d0e' }, // James - soft yellow
};

// Legacy color mapping for backward compatibility
export const PLAYER_COLOR_MAP: Record<string, string> = {
  '0': '#86efac',
  '1': '#fca5a5',
  '2': '#a5b4fc',
  '3': '#67e8f9',
  '4': '#fde047',
};

// Axis styling colors
export const AXIS_COLORS = {
  default: { bg: '#1f2937', text: '#ffffff' },
  active: { bg: 'gradient', text: '#ffffff' }, // Will use gradient from gradients.ts
};

// Winning square highlight colors
export const WINNER_COLORS = {
  bg: '#fef3c7',
  border: '#fbbf24',
  shadow: 'rgba(251, 191, 36, 0.3)',
};

// Probability indicator colors
export const PROBABILITY_COLORS = {
  high: '#22c55e',    // green
  medium: '#eab308',  // yellow
  low: '#ef4444',     // red
};

// Legacy colors array - updated first 5 to match new palette
const colors = [
  '#86efac', // Clint
  '#fca5a5', // Mike
  '#a5b4fc', // Andy
  '#67e8f9', // Matt
  '#fde047', // James
  '#d40707',
  '#ccccff',
  '#FF9AA2',
  '#FFB7B2',
  '#FFDAC1',
  '#E2F0CB',
  '#B5EAD7',
  '#C7CEEA',
  '#FFCECE',
  '#FFC8F2',
  '#FFC8E3',
  '#FFCAF9',
  '#F5CAFF',
  '#F0CBFE',
  '#DDCEFF',
  '#FFCEFF',
  '#F0C4F0',
  '#E8C6FF',
  '#E1CAF9',
  '#D7D1F8',
  '#CEDEF4',
  '#B8E2EF',
  '#CACAFF',
  '#D0E6FF',
  '#D9F3FF',
  '#C0F7FE',
  '#CEFFFD',
  '#BEFEEB',
  '#CAFFD8',
  '#D6F8DE',
  '#DBEADC',
  '#DDFED1',
  '#B3FF99',
  '#DFFFCA',
  '#FFFFC8',
  '#F7F9D0',
  '#F7F7CE',
  '#FFF7B7',
  '#FFF1C6',
  '#FFEAB7',
  '#FFEAC4',
  '#FFE1C6',
  '#FFE2C8',
  '#EEEECE',
  '#EFE7CF',
  '#EEDCC8',
  '#F0DCD5',
  '#EACDC1',
  '#F0DDD5',
  '#ECD9D9',
  '#FFC8C8',
  '#F4CAD6',
  '#FFA8FF',
  '#EFCDF8',
  '#C6C6FF',
  '#C0E7F3',
  '#DCEDEA',
  '#93EEAA',
  '#A6CAA9',
  '#AAFD8E',
  '#6FFF44',
  '#ABFF73',
  '#FFFF84',
  '#EEF093',
  '#AAAAFF',
  '#A8CFFF',
  '#BBEBFF',
  '#8CEFFD',
  '#A5FEFA',
  '#8FFEDD',
  '#A3FEBA',
  '#EEEEA2',
  '#FFE920',
  '#FFDD75',
  '#FFC848',
  '#FFD586',
  '#FFC48E',
  '#FFC895',
  '#FF8E8E',
  '#E994AB',
  '#BA2DFF',
  '#CB59E8',
  '#9191FF',
  '#67C7E2',
  '#A5D3CA',
  '#AAAAFF',
  '#A8CFFF',
  '#BBEBFF',
  '#8CEFFD',
  '#A5FEFA',
  '#8FFEDD',
  '#A3FEBA',
  '#A5FE8A',
  '#8AAE2D',
  '#A2FEBA',
];

export default colors;
