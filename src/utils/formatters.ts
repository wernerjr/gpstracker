export const safeToFixed = (num: number | null | undefined, decimals: number = 1): string => {
  if (num === null || num === undefined) return '0';
  return num.toFixed(decimals);
}; 