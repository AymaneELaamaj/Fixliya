import React from 'react';
import styles from '../styles/AdminDashboard.module.css';

export default function ExternalizeModal({ ticket, providers, onExternalize, onClose }) {
  if (!ticket) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>🌐 Externaliser le Ticket</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          {/* Ticket Summary */}
          <div className={styles.ticketSummary}>
            <h3 className={styles.summaryTitle}>Détails du Ticket</h3>
            <div className={styles.summaryItem}>
              <strong>Catégorie:</strong> {ticket.category}
            </div>
            <div className={styles.summaryItem}>
              <strong>Description:</strong> {ticket.description}
            </div>
            <div className={styles.summaryItem}>
              <strong>Lieu:</strong> {ticket.location}
            </div>
            <div className={styles.summaryItem}>
              <strong>Urgence:</strong> {ticket.isUrgent ? '🔴 URGENT' : '⚪ Normal'}
            </div>
          </div>

          {/* Providers */}
          <div>
            <h3 style={{ margin: '0 0 15px', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
              Sélectionner un Prestataire
            </h3>

            {providers.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Aucun prestataire externe disponible</p>
              </div>
            ) : (
              <div className={styles.providersList}>
                {providers.map(provider => (
                  <ProviderOption
                    key={provider.id}
                    provider={provider}
                    onSelect={() => onExternalize(provider.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProviderOption({ provider, onSelect }) {
  return (
    <div className={styles.providerOption}>
      <div style={{ flex: 1 }}>
        <h4 className={styles.providerName}>{provider.name}</h4>
        <p className={styles.providerDetail}>📧 {provider.email}</p>
        <p className={styles.providerDetail}>📞 {provider.phone}</p>
        {provider.specialties?.length > 0 && (
          <p className={styles.providerDetail}>🛠️ {provider.specialties.join(', ')}</p>
        )}
        {provider.rating && (
          <p className={styles.providerDetail}>⭐ {provider.rating}/5</p>
        )}
      </div>
      <button onClick={onSelect} className={`${styles.btn} ${styles.btnExternalize}`}>
        Sélectionner
      </button>
    </div>
  );
}