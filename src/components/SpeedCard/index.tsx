import styles from './styles.module.css';
import { memo, useMemo } from 'react';

interface SpeedCardProps {
  title: string;
  value: number;
}

export const SpeedCard = memo(({ title, value }: SpeedCardProps) => {
  const formattedValue = useMemo(() => 
    Number(value).toFixed(1), 
    [value]
  );

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardValue}>
        {formattedValue} <span className={styles.unit}>km/h</span>
      </p>
    </div>
  );
}); 