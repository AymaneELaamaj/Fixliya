const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// --- ROBOT 1 : PRÉVIENT L'ADMIN (CRÉATION) ---
exports.sendNewTicketNotification = functions.firestore
  .document("tickets/{ticketId}")
  .onCreate(async (snapshot, context) => {
    const ticket = snapshot.data();
    const ticketId = context.params.ticketId;

    try {
      const adminsSnapshot = await admin.firestore()
        .collection("users")
        .where("role", "==", "admin")
        .get();

      let tokens = [];
      adminsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.fcmTokens) tokens = tokens.concat(data.fcmTokens);
      });

      if (tokens.length === 0) return;

      const message = {
        notification: {
          title: "🚨 Nouveau Signalement !",
          body: `${ticket.category} - ${ticket.location || '?' } (${ticket.studentName})`,
        },
        data: { url: "/app/admin", ticketId: ticketId },
        tokens: tokens,
      };

      await admin.messaging().sendEachForMulticast(message);
      console.log("✅ Notif Admin envoyée");
    } catch (error) {
      console.error("Erreur Admin:", error);
    }
  });

// --- ROBOT 2 : PRÉVIENT L'ARTISAN (ASSIGNATION) ---
exports.sendAssignmentNotification = functions.firestore
  .document("tickets/{ticketId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    // On vérifie si le ticket vient d'être assigné ou réassigné
    const isNewAssignment = !previousData.assignedToId && newData.assignedToId;
    const isChange = previousData.assignedToId && newData.assignedToId && previousData.assignedToId !== newData.assignedToId;

    if (isNewAssignment || isChange) {
      const artisanId = newData.assignedToId;
      console.log(`👷 Ticket assigné à l'artisan : ${artisanId}`);

      try {
        const artisanDoc = await admin.firestore().collection("users").doc(artisanId).get();
        if (!artisanDoc.exists) return;

        const artisanData = artisanDoc.data();
        const tokens = artisanData.fcmTokens || [];

        if (tokens.length === 0) {
          console.log("📭 Cet artisan n'a pas activé les notifs.");
          return;
        }

        const message = {
          notification: {
            title: "🔧 Nouvelle Mission !",
            body: `Lieu : ${newData.location} - Panne : ${newData.category}`,
          },
          data: { url: "/app/artisan", ticketId: context.params.ticketId },
          tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`✅ Succès : ${response.successCount} notifs envoyées à l'artisan.`);

      } catch (error) {
        console.error("❌ Erreur Artisan:", error);
      }
    }
  });