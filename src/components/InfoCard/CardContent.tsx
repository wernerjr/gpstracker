interface CardContentProps {
  value: string;
  unit: string;
  color: string;
  size: 'normal' | 'large';
}

export const CardContent: React.FC<CardContentProps> = ({
  value,
  unit,
  color,
  size
}) => (
  <div style={{
    marginTop: '1.5rem',
    textAlign: 'center',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }}>
    <div style={{
      fontSize: size === 'large' ? '1.2rem' : '1rem',
      fontWeight: 'bold',
      color: color,
      fontFamily: 'monospace',
      wordBreak: 'break-word',
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '0.75rem',
      color: '#7f8c8d',
      marginTop: '0.25rem',
    }}>
      {unit}
    </div>
  </div>
); 