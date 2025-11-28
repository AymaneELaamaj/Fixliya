import React from 'react';
import MetricCard from '../cards/MetricCard';
import styles from '../styles/AdminDashboard.module.css';

export default function StatisticsTab({ statistics }) {
  if (!statistics) {
    return (
      <div className={styles.section}>
        <div className={styles.loadingContainer}>
          Chargement des statistiques...
        </div>
      </div>
    );
  }

  const { totalTickets, averageResponseTime, statusCounts, topCategories, interventionsByMonth } = statistics;

  return (
    <div className={styles.section}>
      {/* Metrics Overview */}
      <div className={styles.metricsGrid}>
        <MetricCard
          icon="📌"
          label="Total Interventions"
          value={totalTickets}
        />
        <MetricCard
          icon="⏳"
          label="Temps Moyen Réponse"
          value={`${averageResponseTime}h`}
        />
        <MetricCard
          icon="✅"
          label="Complétées"
          value={statusCounts.completed}
        />
        <MetricCard
          icon="⚙️"
          label="En Cours"
          value={statusCounts.in_progress}
        />
      </div>

      {/* Charts */}
      <div className={styles.statisticsContainer}>
        {/* Status Distribution */}
        <StatusDistribution statusCounts={statusCounts} totalTickets={totalTickets} />

        {/* Top Categories */}
        <TopCategories categories={topCategories} />

        {/* Monthly Chart */}
        <MonthlyChart interventionsByMonth={interventionsByMonth} />
      </div>
    </div>
  );
}

function StatusDistribution({ statusCounts, totalTickets }) {
  const statuses = [
    { key: 'pending', label: 'En Attente', color: '#fbbf24' },
    { key: 'in_progress', label: 'En Cours', color: '#3b82f6' },
    { key: 'termine_artisan', label: 'Terminé (Artisan)', color: '#10b981' },
    { key: 'completed', label: 'Clôturé', color: '#06b6d4' }
  ];

  return (
    <div className={styles.chartSection}>
      <h3 className={styles.chartTitle}>📊 Distribution des Statuts</h3>
      <div className={styles.statusGrid}>
        {statuses.map(({ key, label, color }) => {
          const count = statusCounts[key] || 0;
          const percentage = totalTickets > 0 ? (count / totalTickets * 100) : 0;

          return (
            <div key={key} className={styles.statusItem}>
              <span className={styles.statusLabel}>{label}</span>
              <div className={styles.statusBar}>
                <div
                  className={styles.statusFill}
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                />
              </div>
              <span className={styles.statusCount}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopCategories({ categories }) {
  if (!categories || categories.length === 0) {
    return (
      <div className={styles.chartSection}>
        <h3 className={styles.chartTitle}>🏆 Top 5 Catégories de Pannes</h3>
        <div className={styles.emptyState}>
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const maxCount = categories[0]?.count || 1;

  return (
    <div className={styles.chartSection}>
      <h3 className={styles.chartTitle}>🏆 Top 5 Catégories de Pannes</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {categories.map((item, idx) => {
          const percentage = (item.count / maxCount) * 100;

          return (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px',
              backgroundColor: 'white',
              borderRadius: '6px'
            }}>
              <span style={{
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#005596',
                minWidth: '30px'
              }}>
                {idx + 1}.
              </span>
              <span style={{
                minWidth: '100px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#475569'
              }}>
                {item.category}
              </span>
              <div style={{
                flex: 1,
                height: '20px',
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${percentage}%`,
                  backgroundColor: '#3b82f6',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span style={{
                minWidth: '40px',
                textAlign: 'right',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#1e293b'
              }}>
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthlyChart({ interventionsByMonth }) {
  if (!interventionsByMonth || Object.keys(interventionsByMonth).length === 0) {
    return (
      <div className={styles.chartSection}>
        <h3 className={styles.chartTitle}>📈 Interventions par Mois</h3>
        <div className={styles.emptyState}>
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const sortedEntries = Object.entries(interventionsByMonth)
    .sort()
    .slice(-6);

  const maxCount = Math.max(...sortedEntries.map(([, count]) => count), 1);

  return (
    <div className={styles.chartSection}>
      <h3 className={styles.chartTitle}>📈 Interventions par Mois</h3>
      <div className={styles.monthlyContainer}>
        {sortedEntries.map(([month, count]) => {
          const height = (count / maxCount) * 150;

          return (
            <div key={month} className={styles.barContainer}>
              <div
                className={styles.bar}
                style={{ height: `${height}px` }}
              />
              <span className={styles.monthLabel}>{month}</span>
              <span className={styles.barValue}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}