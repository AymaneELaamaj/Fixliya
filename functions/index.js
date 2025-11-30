// functions/index.js
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Ce robot se réveille à chaque fois qu'un ticket est créé
 */
exports.sendNewTicketNotification = functions.firestore
  .document("tickets/{ticketId}")
  .onCreate(async (snapshot, context) => {
    // 1. On récupère les infos du ticket
    const ticket = snapshot.data();
    const ticketId = context.params.ticketId;

    console.log(`🎟️ Nouveau ticket de ${ticket.studentName} : ${ticketId}`);

    try {
      // 2. On cherche tous les admins qui ont accepté les notifs
      const adminsSnapshot = await admin.firestore()
        .collection("users")
        .where("role", "==", "admin")
        .get();

      // On récolte tous les "numéros de téléphone" (tokens) des admins
      let tokens = [];
      adminsSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.fcmTokens && userData.fcmTokens.length > 0) {
          tokens = tokens.concat(userData.fcmTokens);
        }
      });

      if (tokens.length === 0) {
        console.log("📭 Aucun admin n'a activé les notifications.");
        return;
      }

      // 3. On prépare le message
      const message = {
        notification: {
          title: "🚨 Nouveau Signalement !",
          body: `${ticket.category} - ${ticket.location} (${ticket.studentName})`,
        },
        data: {
          url: "/app/admin", // Pour rediriger l'admin quand il clique
          ticketId: ticketId
        },
        tokens: tokens, // On envoie à tout le monde d'un coup
      };

      // 4. On tire !
// On utilise sendEachForMulticast au lieu de sendMulticast
        const response = await admin.messaging().sendEachForMulticast(message);      console.log(`✅ ${response.successCount} notifications envoyées avec succès.`);

    } catch (error) {
      console.error("❌ Erreur lors de l'envoi :", error);
    }
  });