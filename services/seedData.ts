import { db } from './firebase';
import { collection, doc, setDoc, getDocs, query, limit } from 'firebase/firestore';
import { BIO_STANDARDS } from '../constants';

export async function seedStandards() {
  try {
    const q = query(collection(db, 'standards'), limit(1));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      console.log("Standards already exist in Firestore, skipping seed.");
      return;
    }

    console.log("Syncing standards constants to Firestore...");
    for (const standard of BIO_STANDARDS) {
      await setDoc(doc(db, 'standards', standard.id), standard);
    }
    console.log("Syncing complete!");
  } catch (error) {
    console.warn("Seeding standards failed (likely due to permissions):", error);
  }
}
