// Bold saturated colors for NFL/sports aesthetic with A11Y compliant text contrast
export const PLAYER_COLORS: Record<string, { bg: string; text: string }> = {
  '0': { bg: '#166534', text: '#ffffff' },  // Forest green
  '1': { bg: '#dc2626', text: '#ffffff' },  // Crimson red
  '2': { bg: '#1e3a8a', text: '#ffffff' },  // Navy blue
  '3': { bg: '#ea580c', text: '#ffffff' },  // Burnt orange
  '4': { bg: '#7c3aed', text: '#ffffff' },  // Royal purple
  '5': { bg: '#0891b2', text: '#ffffff' },  // Cyan
  '6': { bg: '#be185d', text: '#ffffff' },  // Pink
  '7': { bg: '#4d7c0f', text: '#ffffff' },  // Lime green
  '8': { bg: '#b91c1c', text: '#ffffff' },  // Dark red
  '9': { bg: '#1d4ed8', text: '#ffffff' },  // Blue
  '10': { bg: '#9333ea', text: '#ffffff' }, // Purple
  '11': { bg: '#0d9488', text: '#ffffff' }, // Teal
  '12': { bg: '#c2410c', text: '#ffffff' }, // Deep orange
  '13': { bg: '#4338ca', text: '#ffffff' }, // Indigo
  '14': { bg: '#15803d', text: '#ffffff' }, // Green
  '15': { bg: '#a21caf', text: '#ffffff' }, // Fuchsia
  '16': { bg: '#0369a1', text: '#ffffff' }, // Sky blue
  '17': { bg: '#b45309', text: '#ffffff' }, // Amber
  '18': { bg: '#6d28d9', text: '#ffffff' }, // Violet
  '19': { bg: '#059669', text: '#ffffff' }, // Emerald
  '20': { bg: '#db2777', text: '#ffffff' }, // Hot pink
  '21': { bg: '#2563eb', text: '#ffffff' }, // Royal blue
  '22': { bg: '#ca8a04', text: '#1f2937' }, // Yellow (dark text)
  '23': { bg: '#7c2d12', text: '#ffffff' }, // Brown
  '24': { bg: '#5b21b6', text: '#ffffff' }, // Deep purple
  '25': { bg: '#047857', text: '#ffffff' }, // Dark emerald
  '26': { bg: '#e11d48', text: '#ffffff' }, // Rose
  '27': { bg: '#1e40af', text: '#ffffff' }, // Dark blue
  '28': { bg: '#c026d3', text: '#ffffff' }, // Magenta
  '29': { bg: '#65a30d', text: '#1f2937' }, // Lime (dark text)
  '30': { bg: '#9f1239', text: '#ffffff' }, // Dark rose
  '31': { bg: '#0284c7', text: '#ffffff' }, // Light blue
  '32': { bg: '#d97706', text: '#1f2937' }, // Orange (dark text)
  '33': { bg: '#7e22ce', text: '#ffffff' }, // Bright purple
  '34': { bg: '#0f766e', text: '#ffffff' }, // Dark teal
  '35': { bg: '#dc2626', text: '#ffffff' }, // Red
  '36': { bg: '#4f46e5', text: '#ffffff' }, // Bright indigo
  '37': { bg: '#16a34a', text: '#ffffff' }, // Bright green
  '38': { bg: '#d946ef', text: '#ffffff' }, // Bright fuchsia
  '39': { bg: '#0e7490', text: '#ffffff' }, // Dark cyan
  '40': { bg: '#ea580c', text: '#ffffff' }, // Bright orange
  '41': { bg: '#8b5cf6', text: '#ffffff' }, // Light purple
  '42': { bg: '#14532d', text: '#ffffff' }, // Very dark green
  '43': { bg: '#f43f5e', text: '#ffffff' }, // Bright rose
  '44': { bg: '#1d4ed8', text: '#ffffff' }, // Medium blue
  '45': { bg: '#a16207', text: '#ffffff' }, // Dark yellow
  '46': { bg: '#6366f1', text: '#ffffff' }, // Periwinkle
  '47': { bg: '#166534', text: '#ffffff' }, // Forest
  '48': { bg: '#be123c', text: '#ffffff' }, // Dark pink
  '49': { bg: '#0891b2', text: '#ffffff' }, // Bright cyan
  '50': { bg: '#92400e', text: '#ffffff' }, // Rust
  '51': { bg: '#7c3aed', text: '#ffffff' }, // Violet
  '52': { bg: '#115e59', text: '#ffffff' }, // Dark teal
  '53': { bg: '#ef4444', text: '#ffffff' }, // Bright red
  '54': { bg: '#3730a3', text: '#ffffff' }, // Deep indigo
  '55': { bg: '#22c55e', text: '#1f2937' }, // Bright green (dark text)
  '56': { bg: '#a855f7', text: '#ffffff' }, // Medium purple
  '57': { bg: '#0c4a6e', text: '#ffffff' }, // Dark sky
  '58': { bg: '#f97316', text: '#1f2937' }, // Bright orange (dark text)
  '59': { bg: '#4c1d95', text: '#ffffff' }, // Very dark purple
  '60': { bg: '#065f46', text: '#ffffff' }, // Dark emerald
  '61': { bg: '#ec4899', text: '#ffffff' }, // Pink
  '62': { bg: '#1e3a8a', text: '#ffffff' }, // Navy
  '63': { bg: '#eab308', text: '#1f2937' }, // Yellow (dark text)
  '64': { bg: '#581c87', text: '#ffffff' }, // Deep violet
  '65': { bg: '#14b8a6', text: '#1f2937' }, // Bright teal (dark text)
  '66': { bg: '#991b1b', text: '#ffffff' }, // Dark red
  '67': { bg: '#2563eb', text: '#ffffff' }, // Blue
  '68': { bg: '#ca8a04', text: '#1f2937' }, // Gold (dark text)
  '69': { bg: '#86198f', text: '#ffffff' }, // Dark fuchsia
  '70': { bg: '#047857', text: '#ffffff' }, // Emerald
  '71': { bg: '#e11d48', text: '#ffffff' }, // Rose red
  '72': { bg: '#1d4ed8', text: '#ffffff' }, // Royal blue
  '73': { bg: '#84cc16', text: '#1f2937' }, // Bright lime (dark text)
  '74': { bg: '#831843', text: '#ffffff' }, // Dark pink
  '75': { bg: '#0284c7', text: '#ffffff' }, // Sky blue
  '76': { bg: '#78350f', text: '#ffffff' }, // Dark amber
  '77': { bg: '#6d28d9', text: '#ffffff' }, // Violet
  '78': { bg: '#166534', text: '#ffffff' }, // Green
  '79': { bg: '#db2777', text: '#ffffff' }, // Hot pink
  '80': { bg: '#1e40af', text: '#ffffff' }, // Dark blue
  '81': { bg: '#b45309', text: '#ffffff' }, // Amber brown
  '82': { bg: '#9333ea', text: '#ffffff' }, // Purple
  '83': { bg: '#0f766e', text: '#ffffff' }, // Teal
  '84': { bg: '#dc2626', text: '#ffffff' }, // Red
  '85': { bg: '#4338ca', text: '#ffffff' }, // Indigo
  '86': { bg: '#15803d', text: '#ffffff' }, // Medium green
  '87': { bg: '#c026d3', text: '#ffffff' }, // Magenta
  '88': { bg: '#0369a1', text: '#ffffff' }, // Medium blue
  '89': { bg: '#c2410c', text: '#ffffff' }, // Burnt orange
  '90': { bg: '#5b21b6', text: '#ffffff' }, // Deep purple
  '91': { bg: '#059669', text: '#ffffff' }, // Emerald
  '92': { bg: '#be185d', text: '#ffffff' }, // Deep pink
  '93': { bg: '#1d4ed8', text: '#ffffff' }, // Blue
  '94': { bg: '#a16207', text: '#ffffff' }, // Dark gold
  '95': { bg: '#7e22ce', text: '#ffffff' }, // Bright purple
  '96': { bg: '#0d9488', text: '#ffffff' }, // Teal
  '97': { bg: '#b91c1c', text: '#ffffff' }, // Dark red
  '98': { bg: '#4f46e5', text: '#ffffff' }, // Indigo
  '99': { bg: '#16a34a', text: '#ffffff' }, // Green
};

// Legacy color mapping for backward compatibility
export const PLAYER_COLOR_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(PLAYER_COLORS).map(([key, value]) => [key, value.bg])
);

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

// Legacy colors array - now pulls from PLAYER_COLORS for consistency
const colors = Object.values(PLAYER_COLORS).map(c => c.bg);

export default colors;
