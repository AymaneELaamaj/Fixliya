/**
 * Script de test pour les notifications
 * 
 * Pour l'utiliser dans la console du navigateur :
 * 1. Ouvrez la console (F12)
 * 2. Copiez-collez ce code
 * 3. Appelez : await testCreateNotification("VOTRE_STUDENT_ID", "VOTRE_TICKET_ID")
 */

import { auth } from '../firebase';
import { createNotification, NOTIFICATION_TYPES } from './notificationService';

export async function testCreateNotification(studentId, ticketId) {
  console.log('🧪 Test de création de notification...');
  console.log('📝 StudentID:', studentId);
  console.log('🎫 TicketID:', ticketId);
  
  try {
    // Test notification d'assignation
    const notif1 = await createNotification(
      studentId,
      ticketId,
      NOTIFICATION_TYPES.ASSIGNED,
      { artisanName: 'Jean Dupont' }
    );
    console.log('✅ Notification ASSIGNED créée:', notif1);
    
    // Attendre 2 secondes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test notification en cours
    const notif2 = await createNotification(
      studentId,
      ticketId,
      NOTIFICATION_TYPES.IN_PROGRESS,
      { artisanName: 'Jean Dupont' }
    );
    console.log('✅ Notification IN_PROGRESS créée:', notif2);
    
    // Attendre 2 secondes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test notification terminée
    const notif3 = await createNotification(
      studentId,
      ticketId,
      NOTIFICATION_TYPES.COMPLETED,
      { artisanName: 'Jean Dupont' }
    );
    console.log('✅ Notification COMPLETED créée:', notif3);
    
    console.log('🎉 Toutes les notifications de test ont été créées !');
    console.log('👀 Vérifiez votre page étudiant pour voir les notifications');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la création des notifications:', error);
    return false;
  }
}

// Fonction pour obtenir l'ID de l'utilisateur actuel
export function getCurrentUserId() {
  const user = auth.currentUser;
  if (user) {
    console.log('✅ Utilisateur connecté:', user.uid);
    return user.uid;
  } else {
    console.error('❌ Aucun utilisateur connecté');
    return null;
  }
}

// Fonction pour tester avec l'utilisateur actuel
export async function testCurrentUser(ticketId = 'test-ticket-123') {
  const userId = getCurrentUserId();
  if (!userId) {
    console.error('❌ Impossible de tester : aucun utilisateur connecté');
    return false;
  }
  
  return await testCreateNotification(userId, ticketId);
}

console.log('📢 Script de test des notifications chargé !');
console.log('📝 Commandes disponibles :');
console.log('  - testCurrentUser() : Teste avec l\'utilisateur actuel');
console.log('  - testCreateNotification(studentId, ticketId) : Teste avec des IDs spécifiques');
console.log('  - getCurrentUserId() : Affiche l\'ID de l\'utilisateur connecté');
