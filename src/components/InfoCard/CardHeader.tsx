interface CardHeaderProps {
  title: string;
  icon: React.ReactNode;
  color: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, icon, color }) => (
  <div style={{
    position: 'absolute',
    top: '0',
    right: '0',
    backgroundColor: color,
    padding: '0.25rem 0.5rem',
    borderBottomLeftRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    zIndex: 1,
  }}>
    {icon}
    <span style={{ 
      color: '#fff', 
      fontWeight: 'bold',
      fontSize: '0.7rem',
    }}>
      {title}
    </span>
  </div>
); 