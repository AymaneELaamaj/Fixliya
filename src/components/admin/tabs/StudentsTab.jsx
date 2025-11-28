import React, { useState, useMemo } from 'react';
import StudentCard from '../cards/StudentCard';
import styles from '../styles/AdminDashboard.module.css';

export default function StudentsTab({ students, onToggleStatus }) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredStudents = useMemo(() => {
    if (filterStatus === 'active') {
      return students.filter(s => s.isActive);
    }
    if (filterStatus === 'inactive') {
      return students.filter(s => !s.isActive);
    }
    return students;
  }, [students, filterStatus]);

  const handleToggle = async (studentId, currentStatus) => {
    try {
      await onToggleStatus(studentId, currentStatus);
      alert(currentStatus ? 'Compte désactivé' : 'Compte activé');
    } catch (err) {
      alert('Erreur lors de la mise à jour: ' + err.message);
    }
  };

  if (students.length === 0) {
    return (
      <div className={styles.section}>
        <div className={styles.emptyState}>
          <p>📭 Aucun étudiant trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      {/* Filter */}
      <div className={styles.filterBar}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">Tous les étudiants</option>
          <option value="active">Actifs</option>
          <option value="inactive">Désactivés</option>
        </select>
      </div>

      {/* Grid */}
      <div className={styles.studentsGrid}>
        {filteredStudents.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            onToggleStatus={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}