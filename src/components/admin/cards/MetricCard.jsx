import React from 'react';
import styles from '../styles/AdminDashboard.module.css';

export default function MetricCard({ icon, label, value, color }) {
  return (
    <div className={`${styles.card} ${styles.metricCard}`}>
      <div className={styles.metricIcon}>{icon}</div>
      <div>
        <h3 className={styles.metricLabel}>{label}</h3>
        <p className={styles.metricValue} style={color ? { color } : undefined}>
          {value}
        </p>
      </div>
    </div>
  );
}