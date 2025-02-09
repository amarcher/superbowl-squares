const hues = [
  120, 6, 242, 199, 58, 0, 240, 355, 4, 24, 83, 158, 228, 0, 314, 331, 307, 289,
  284, 258, 300, 300, 276, 269, 249, 215, 194, 240, 212, 199, 187, 178, 162,
  136, 134, 124, 104, 105, 96, 60, 63, 60, 53, 45, 43, 39, 28, 28, 60, 45, 32,
  16, 18, 18, 0, 0, 343, 300, 287, 240, 194, 169, 135, 125, 105, 106, 96, 60,
  61, 240, 213, 198, 187, 177, 162, 135, 60, 54, 45, 42, 39, 29, 29, 0, 344,
  280, 288, 240, 193, 168, 240, 213, 198, 187, 177, 162, 135, 106, 77, 136,
];

// Generate an array of 100 CSS gradient background values
export const gradients = Array.from({ length: 100 }, (_, i) => {
  // Calculate an angle from 0 to 360 degrees for the gradient direction
  const angle = 90;

  // Use the index to calculate three hues.
  // Adjust the multipliers and offsets for different color progressions.
  const hue1 = hues[i] % 360;
  const hue2 = (hue1 + 1) % 360;
  const hue3 = (hue1 + 1) % 360;

  // Build the gradient string using hsl colors for smooth transitions.
  // The percentages define where the colors start, middle, and end.
  return `linear-gradient(${angle}deg, hsl(${hue1}, 80%, 45%) 0%, hsl(${hue2}, 80%, 50%) 50%, hsl(${hue3}, 80%, 60%) 100%)`;
});

export default gradients;
