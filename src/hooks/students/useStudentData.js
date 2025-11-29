import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getStudentTickets } from '../../services/ticketService';

/**
 * Hook pour charger les données de l'étudiant (info utilisateur et tickets)
 */
export const useStudentData = () => {
  const [tickets, setTickets] = useState([]);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(auth.currentUser?.uid || "");
  const [loading, setLoading] = useState(true);
  const [isAccountDisabled, setIsAccountDisabled] = useState(false);

  const loadData = async () => {
    const user = auth.currentUser;
    if (!user) {
      return { needsRedirect: true };
    }

    if (!userId) {
      setUserId(user.uid);
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.prenom);

        // Vérifier si le compte est désactivé
        if (userData.isActive === false) {
          setIsAccountDisabled(true);
          setLoading(false);
          return { needsRedirect: false };
        }
      }

      const myTickets = await getStudentTickets(user.uid);
      setTickets(myTickets);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }

    return { needsRedirect: false };
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    tickets,
    userName,
    userId,
    loading,
    isAccountDisabled,
    loadData
  };
};
