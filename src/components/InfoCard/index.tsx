import { CardHeader } from './CardHeader';
import { CardContent } from './CardContent';

interface InfoCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  color?: string;
  size?: 'normal' | 'large';
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  unit,
  icon,
  color = '#3498db',
  size = 'normal'
}) => (
  <div style={{
    backgroundColor: '#2d2d2d',
    padding: '1rem',
    borderRadius: '8px',
    border: `2px solid ${color}`,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    minHeight: '75px',
    display: 'flex',
    flexDirection: 'column',
    margin: '0.5rem',
  }}>
    <CardHeader title={title} icon={icon} color={color} />
    <CardContent value={value} unit={unit} color={color} size={size} />
  </div>
); 