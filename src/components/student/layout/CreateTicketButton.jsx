import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Bouton pour créer un nouveau ticket
 */
export const CreateTicketButton = ({ styles }) => {
  return (
    <div style={styles.actionArea}>
      <Link to="/create-ticket" style={styles.createBtn}>
        + Signaler un problème
      </Link>
    </div>
  );
};
