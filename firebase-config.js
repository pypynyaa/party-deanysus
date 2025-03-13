import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZgzf39KPvFoR-0Tg33TjypbjK-dxiUVI",
  authDomain: "party-registration-web.firebaseapp.com",
  projectId: "party-registration-web",
  storageBucket: "party-registration-web.appspot.com",
  messagingSenderId: "437696239321",
  appId: "1:437696239321:web:ea38f2ed5d3cd75434d0c8"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Get Firestore instance
const db = firebase.firestore();

// Get Storage instance
const storage = firebase.storage();

// Function to load existing registration
async function loadExistingRegistration() {
  // This function will be implemented when needed
  console.log('Loading existing registration...');
  return null;
}

// Function to find registration by name
async function findRegistrationByName(name) {
  try {
    const snapshot = await db.collection('registrations')
      .where('fullName', '==', name)
      .get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  } catch (error) {
    console.error('Error finding registration by name:', error);
    return null;
  }
}

// Function to find registration by phone
async function findRegistrationByPhone(phone) {
  try {
    const snapshot = await db.collection('registrations')
      .where('phone', '==', phone)
      .get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  } catch (error) {
    console.error('Error finding registration by phone:', error);
    return null;
  }
}

// Function to find registration by telegram
async function findRegistrationByTelegram(telegram) {
  try {
    const snapshot = await db.collection('registrations')
      .where('telegram', '==', telegram)
      .get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  } catch (error) {
    console.error('Error finding registration by telegram:', error);
    return null;
  }
}

export { 
  db, 
  storage, 
  loadExistingRegistration,
  findRegistrationByName,
  findRegistrationByPhone,
  findRegistrationByTelegram
}; 