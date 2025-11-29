import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentData } from '../hooks/students';
import StudentSidebar from '../components/student/layout/StudentSidebar';

export default function StudentHistory() {
  const navigate = useNavigate();
  const { tickets, userName, userEmail, loading } = useStudentData();
  
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Détection du mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filtrer les tickets selon les critères
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    // Filtre par période
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const periodDays = {
        '7d': 7,
        '30d': 30,
        '3m': 90,
        '6m': 180,
        '1y': 365
      };

      const days = periodDays[selectedPeriod];
      if (days) {
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(t => new Date(t.createdAt) >= cutoffDate);
      }
    }

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Recherche par mot-clé
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(query) ||
        t.location?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [tickets, selectedPeriod, selectedStatus, selectedCategory, searchQuery]);

  // Statistiques
  const stats = useMemo(() => {
    const total = tickets.length;
    const completed = tickets.filter(t => t.status === 'completed').length;
    const cancelled = tickets.filter(t => t.status === 'cancelled').length;
    const inProgress = tickets.filter(t => ['pending', 'in_progress', 'termine_artisan'].includes(t.status)).length;

    // Temps moyen de résolution (en jours)
    const completedTickets = tickets.filter(t => t.status === 'completed' && t.createdAt && t.validatedAt);
    const avgResolutionTime = completedTickets.length > 0
      ? completedTickets.reduce((sum, t) => {
          const start = new Date(t.createdAt);
          const end = new Date(t.validatedAt);
          return sum + (end - start) / (1000 * 60 * 60 * 24);
        }, 0) / completedTickets.length
      : 0;

    // Tickets par catégorie
    const byCategory = {};
    tickets.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    });

    return {
      total,
      completed,
      cancelled,
      inProgress,
      resolutionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      byCategory
    };
  }, [tickets]);

  // Catégories uniques
  const categories = useMemo(() => {
    return [...new Set(tickets.map(t => t.category))].filter(Boolean);
  }, [tickets]);

  if (loading) {
    return (
      <div style={styles.container}>
        <StudentSidebar userName={userName} userEmail={userEmail} activeTicketsCount={0} />
        <div style={{
          ...styles.mainContent,
          marginLeft: isMobile ? 0 : '260px',
          padding: isMobile ? '15px' : '30px',
          paddingBottom: isMobile ? '80px' : '30px'
        }}>
          <div style={styles.loading}>⏳ Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <StudentSidebar 
        userName={userName} 
        userEmail={userEmail}
        activeTicketsCount={stats.inProgress}
      />
      
      <div style={{
        ...styles.mainContent,
        marginLeft: isMobile ? 0 : '260px',
        padding: isMobile ? '15px' : '30px',
        paddingBottom: isMobile ? '80px' : '30px'
      }}>
        {/* Header */}
        <div style={{
          ...styles.header,
          marginBottom: isMobile ? '20px' : '30px'
        }}>
          <h1 style={{
            ...styles.title,
            fontSize: isMobile ? '20px' : '24px'
          }}>📊 Historique des Réclamations</h1>
          <p style={{
            ...styles.subtitle,
            fontSize: isMobile ? '12px' : '14px'
          }}>Consultez toutes vos réclamations et statistiques</p>
        </div>

        {/* Statistiques Globales */}
        <div style={{
          ...styles.statsGrid,
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: isMobile ? '10px' : '20px'
        }}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📋</div>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total</div>
          </div>
          <div style={{...styles.statCard, borderColor: '#10b981'}}>
            <div style={styles.statIcon}>✅</div>
            <div style={{...styles.statValue, color: '#10b981'}}>{stats.completed}</div>
            <div style={styles.statLabel}>Résolues</div>
          </div>
          <div style={{...styles.statCard, borderColor: '#f59e0b'}}>
            <div style={styles.statIcon}>⏳</div>
            <div style={{...styles.statValue, color: '#f59e0b'}}>{stats.inProgress}</div>
            <div style={styles.statLabel}>En cours</div>
          </div>
          <div style={{...styles.statCard, borderColor: '#ef4444'}}>
            <div style={styles.statIcon}>❌</div>
            <div style={{...styles.statValue, color: '#ef4444'}}>{stats.cancelled}</div>
            <div style={styles.statLabel}>Annulées</div>
          </div>
        </div>

        {/* Statistiques Additionnelles */}
        <div style={{
          ...styles.additionalStats,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '10px' : '20px',
          padding: isMobile ? '15px' : '20px'
        }}>
          <div style={styles.statItem}>
            <span style={styles.statItemLabel}>Taux de résolution:</span>
            <span style={styles.statItemValue}>{stats.resolutionRate}%</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statItemLabel}>Temps moyen de traitement:</span>
            <span style={styles.statItemValue}>{stats.avgResolutionTime} jours</span>
          </div>
        </div>

        {/* Filtres */}
        <div style={{
          ...styles.filtersCard,
          padding: isMobile ? '15px' : '20px'
        }}>
          <div style={{
            ...styles.filtersRow,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: isMobile ? '10px' : '15px'
          }}>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={styles.select}
            >
              <option value="all">📅 Toute période</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="3m">3 derniers mois</option>
              <option value="6m">6 derniers mois</option>
              <option value="1y">Dernière année</option>
            </select>

            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={styles.select}
            >
              <option value="all">📊 Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="termine_artisan">Terminé (artisan)</option>
              <option value="completed">Clôturé</option>
              <option value="cancelled">Annulé</option>
            </select>

            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={styles.select}
            >
              <option value="all">🏷️ Toutes catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="🔍 Rechercher dans les descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Résultats */}
        <div style={styles.resultsHeader}>
          <span style={styles.resultsCount}>
            {filteredTickets.length} réclamation{filteredTickets.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Timeline */}
        <div style={styles.timeline}>
          {filteredTickets.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <div style={styles.emptyText}>Aucune réclamation trouvée</div>
            </div>
          ) : (
            filteredTickets.map((ticket, index) => (
              <TimelineItem 
                key={ticket.id} 
                ticket={ticket} 
                isLast={index === filteredTickets.length - 1}
                onClick={() => navigate('/app/student')}
                isMobile={isMobile}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Composant TimelineItem
function TimelineItem({ ticket, isLast, onClick, isMobile }) {
  const statusConfig = {
    pending: { color: '#f59e0b', label: 'En attente', icon: '⏳' },
    in_progress: { color: '#3b82f6', label: 'En cours', icon: '🔧' },
    termine_artisan: { color: '#8b5cf6', label: 'Terminé', icon: '✓' },
    completed: { color: '#10b981', label: 'Clôturé', icon: '✅' },
    cancelled: { color: '#ef4444', label: 'Annulé', icon: '❌' }
  };

  const config = statusConfig[ticket.status] || statusConfig.pending;
  const date = new Date(ticket.createdAt);

  return (
    <div style={{
      ...styles.timelineItem,
      gap: isMobile ? '12px' : '20px',
      marginBottom: isMobile ? '15px' : '20px'
    }}>
      <div style={{
        ...styles.timelineDot,
        minWidth: isMobile ? '30px' : '40px'
      }}>
        <div style={{
          ...styles.dot, 
          backgroundColor: config.color,
          width: isMobile ? '30px' : '40px',
          height: isMobile ? '30px' : '40px',
          fontSize: isMobile ? '14px' : '18px'
        }}>
          {config.icon}
        </div>
        {!isLast && <div style={styles.line} />}
      </div>
      
      <div style={{
        ...styles.timelineContent,
        padding: isMobile ? '12px' : '20px'
      }} onClick={onClick}>
        <div style={{
          ...styles.timelineHeader,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '8px' : '0'
        }}>
          <span style={{
            ...styles.statusBadge, 
            backgroundColor: config.color,
            fontSize: isMobile ? '11px' : '12px',
            padding: isMobile ? '3px 10px' : '4px 12px'
          }}>
            {config.label}
          </span>
          <span style={styles.timelineDate}>
            {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        
        <div style={styles.ticketTitle}>
          <span style={styles.categoryBadge}>{ticket.category}</span>
          {ticket.isUrgent && <span style={styles.urgentBadge}>⚠️ URGENT</span>}
        </div>
        
        <div style={{
          ...styles.ticketLocation,
          fontSize: isMobile ? '12px' : '13px'
        }}>📍 {ticket.location}</div>
        <div style={{
          ...styles.ticketDescription,
          fontSize: isMobile ? '13px' : '14px'
        }}>{ticket.description}</div>
        
        {ticket.assignedToName && (
          <div style={styles.ticketArtisan}>👨‍🔧 {ticket.assignedToName}</div>
        )}
        
        {ticket.status === 'completed' && ticket.rating && (
          <div style={styles.ticketRating}>
            ⭐ Note: {ticket.rating}/5
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f9fafb'
  },

  mainContent: {
    flex: 1,
    transition: 'margin-left 0.3s ease'
  },

  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#6b7280'
  },

  header: {
    marginBottom: '30px'
  },

  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },

  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '25px'
  },

  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center',
    border: '2px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },

  statIcon: {
    fontSize: '28px',
    marginBottom: '10px'
  },

  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#005596',
    marginBottom: '8px'
  },

  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500'
  },

  additionalStats: {
    backgroundColor: 'white',
    borderRadius: '12px',
    marginBottom: '25px',
    display: 'flex',
    flexWrap: 'wrap'
  },

  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  statItemLabel: {
    fontSize: '14px',
    color: '#6b7280'
  },

  statItemValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#005596'
  },

  filtersCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '25px'
  },

  filtersRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '15px'
  },

  select: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: 'white'
  },

  searchInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px'
  },

  resultsHeader: {
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #e5e7eb'
  },

  resultsCount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280'
  },

  timeline: {
    position: 'relative'
  },

  timelineItem: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px'
  },

  timelineDot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '40px'
  },

  dot: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: 'white',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },

  line: {
    width: '2px',
    flex: 1,
    backgroundColor: '#e5e7eb',
    minHeight: '20px'
  },

  timelineContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)'
    }
  },

  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },

  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white'
  },

  timelineDate: {
    fontSize: '12px',
    color: '#6b7280'
  },

  ticketTitle: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '8px',
    flexWrap: 'wrap'
  },

  categoryBadge: {
    backgroundColor: '#eff6ff',
    color: '#005596',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600'
  },

  urgentBadge: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },

  ticketLocation: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px'
  },

  ticketDescription: {
    fontSize: '14px',
    color: '#374151',
    marginBottom: '10px',
    lineHeight: '1.5'
  },

  ticketArtisan: {
    fontSize: '13px',
    color: '#059669',
    fontWeight: '600',
    marginTop: '10px'
  },

  ticketRating: {
    fontSize: '13px',
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: '8px'
  },

  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px'
  },

  emptyIcon: {
    fontSize: '64px',
    marginBottom: '15px'
  },

  emptyText: {
    fontSize: '16px',
    color: '#6b7280'
  }
};
