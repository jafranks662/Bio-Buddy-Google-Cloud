import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

import { handleFirestoreError, OperationType } from './firestoreErrorHandler';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

async function testConnection() {
  const path = 'test/connection';
  try {
    await getDocFromServer(doc(db, path));
    console.log("Firebase connection successful");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. You might be offline.");
    } else {
      // Structure the error as requested by integration instructions
      handleFirestoreError(error, OperationType.GET, path);
    }
  }
}

testConnection();
