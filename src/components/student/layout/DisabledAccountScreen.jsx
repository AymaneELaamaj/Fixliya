import React from 'react';

/**
 * Écran affiché lorsque le compte de l'étudiant est désactivé
 */
export const DisabledAccountScreen = ({ onLogout, styles }) => {
  return (
    <div style={styles.container}>
      <div style={styles.disabledAccountContainer}>
        <div style={styles.disabledIcon}>🔒</div>
        <h2 style={styles.disabledTitle}>Compte Désactivé</h2>
        <p style={styles.disabledMessage}>
          Votre compte a été désactivé par l'administrateur système.
        </p>
        <p style={styles.disabledDescription}>
          Vous n'avez pas accès à l'application pour le moment.
          Veuillez contacter l'administrateur pour plus d'informations.
        </p>
        <button onClick={onLogout} style={styles.logoutBtnDisabled}>
          Déconnexion
        </button>
      </div>
    </div>
  );
};
