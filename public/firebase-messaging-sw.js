// public/firebase-messaging-sw.js
try {
  importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

  const firebaseConfig = {
    apiKey: "AIzaSyA6lVQKgzj9HN2KqIP159qkG3Xd9N5lqiE",
    authDomain: "fixliya-app.firebaseapp.com",
    projectId: "fixliya-app",
    storageBucket: "fixliya-app.firebasestorage.app",
    messagingSenderId: "367638216734",
    appId: "1:367638216734:web:9f3afe3c4aabda1684ee0f"
  };

  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  // C'est ici que la magie opère quand l'app est fermée
  messaging.onBackgroundMessage((payload) => {
    console.log('[Service Worker] Message reçu en background:', payload);
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/vite.svg',
      data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.error('[Service Worker] Erreur lors du chargement de Firebase:', error);
  // Le service worker continue de fonctionner sans Firebase messaging
}