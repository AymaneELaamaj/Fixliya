import React from 'react';
import styles from '../styles/AdminDashboard.module.css';

export default function StudentCard({ student, onToggleStatus }) {
  const handleToggle = () => {
    onToggleStatus(student.id, student.isActive);
  };

  return (
    <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '12px'
      }}>
        <div style={{ fontSize: '28px' }}>👨‍🎓</div>
        <span className={student.isActive ? styles.badgeActive : styles.badgeInactive}
          style={{ padding: '6px 12px', borderRadius: '20px' }}>
          {student.isActive ? '✓ Actif' : '✗ Inactif'}
        </span>
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
          {student.prenom} {student.nom}
        </h3>
        <p style={{ margin: '6px 0', fontSize: '13px', color: '#64748b' }}>
          <strong>Email:</strong> {student.email}
        </p>
        <p style={{ margin: '6px 0', fontSize: '13px', color: '#64748b' }}>
          <strong>Tél:</strong> {student.telephone || 'N/A'}
        </p>
      </div>

      {/* Stats */}
      <div className={styles.ticketsStats}>
        <StatItem label="Total" value={student.totalTickets} />
        <StatItem label="En attente" value={student.pendingTickets} color="#f59e0b" />
        <StatItem label="En cours" value={student.inProgressTickets} color="#3b82f6" />
        <StatItem label="Complétés" value={student.completedTickets} color="#10b981" />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleToggle}
          className={`${styles.btn} ${student.isActive ? styles.btnDanger : styles.btnSuccess}`}
        >
          {student.isActive ? '🔒 Désactiver' : '✓ Activer'}
        </button>
      </div>
    </div>
  );
}

function StatItem({ label, value, color = '#005596' }) {
  return (
    <div className={styles.statItem}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue} style={{ color }}>{value}</span>
    </div>
  );
}