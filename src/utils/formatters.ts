export const formatSpeed = (speed: number | null): string => {
  if (speed === null) return '0';
  return speed.toFixed(1);
};

export const formatAccuracy = (accuracy: number | null): string => {
  if (accuracy === null) return 'm';
  return `${accuracy.toFixed(1)}m`;
};

export const getAccuracyText = (accuracy: number | null): string => {
  if (accuracy === null) return 'Indisponível';
  if (accuracy <= 5) return 'Alta';
  if (accuracy <= 15) return 'Média';
  return 'Baixa';
};

export const getAccuracyColor = (accuracy: number | null): string => {
  if (accuracy === null) return '#7f8c8d';
  if (accuracy <= 5) return '#2ecc71';
  if (accuracy <= 15) return '#f1c40f';
  return '#e74c3c';
}; 