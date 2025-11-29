import { useState, useEffect, useCallback } from 'react';
import {
  getStudentNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications
} from '../../services/notificationService';

/**
 * Hook pour gérer les notifications de l'étudiant
 */
export const useNotifications = (studentId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [latestNotification, setLatestNotification] = useState(null);

  // Charger les notifications initiales
  const loadNotifications = useCallback(async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      const allNotifications = await getStudentNotifications(studentId);
      const unread = await getUnreadNotifications(studentId);
      
      setNotifications(allNotifications);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // S'abonner aux nouvelles notifications en temps réel
  useEffect(() => {
    if (!studentId) return;

    let previousCount = 0;

    const unsubscribe = subscribeToNotifications(studentId, (newNotifications) => {
      const unread = newNotifications.filter(n => !n.read);
      
      setNotifications(newNotifications);
      setUnreadCount(unread.length);

      // Afficher un toast pour les nouvelles notifications
      if (unread.length > previousCount && previousCount > 0) {
        const latest = unread[0];
        setLatestNotification(latest);
        setShowToast(true);
        
        // Masquer le toast après 5 secondes
        setTimeout(() => setShowToast(false), 5000);
      }

      previousCount = unread.length;
    });

    return () => unsubscribe();
  }, [studentId]);

  // Charger au montage
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  }, []);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead(studentId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  }, [studentId]);

  // Fermer le toast manuellement
  const closeToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    showToast,
    latestNotification,
    markAsRead,
    markAllAsRead,
    closeToast,
    refresh: loadNotifications
  };
};
