// Bold saturated colors for NFL/sports aesthetic
export const PLAYER_COLORS: Record<string, { bg: string; text: string }> = {
  '0': { bg: '#166534', text: '#ffffff' }, // Forest green
  '1': { bg: '#dc2626', text: '#ffffff' }, // Crimson red
  '2': { bg: '#1e3a8a', text: '#ffffff' }, // Navy blue
  '3': { bg: '#ea580c', text: '#ffffff' }, // Burnt orange
  '4': { bg: '#7c3aed', text: '#ffffff' }, // Royal purple
};

// Legacy color mapping for backward compatibility
export const PLAYER_COLOR_MAP: Record<string, string> = {
  '0': '#166534',
  '1': '#dc2626',
  '2': '#1e3a8a',
  '3': '#ea580c',
  '4': '#7c3aed',
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

// Legacy colors array - updated first 5 to match bold saturated palette
const colors = [
  '#166534', // Forest green
  '#dc2626', // Crimson red
  '#1e3a8a', // Navy blue
  '#ea580c', // Burnt orange
  '#7c3aed', // Royal purple
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
