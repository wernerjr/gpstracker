import styles from './styles.module.css';

interface SpeedCardProps {
  title: string;
  value: number;
}

export function SpeedCard({ title, value }: SpeedCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardValue}>
        {Number(value).toFixed(1)} <span className={styles.unit}>km/h</span>
      </p>
    </div>
  );
} 