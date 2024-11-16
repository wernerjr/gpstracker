export const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    width: '100%',
    maxWidth: '800px',
  },
  cardContainer: {
    width: '100%',
    marginBottom: '3.5rem',
  },
  icon: {
    width: '16px',
    height: '16px',
    color: '#fff',
  },
  coordinatesContainer: {
    gridColumn: '1 / -1',
    width: '100%',
    marginBottom: '1rem',
  },
} as const; 