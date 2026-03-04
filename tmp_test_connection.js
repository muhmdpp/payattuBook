const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  try {
    console.log('Testing Firebase Connection...');
    const testCollection = collection(db, 'connection_tests');
    
    // Add a document
    console.log('Attempting to write to Firestore...');
    const docRef = await addDoc(testCollection, {
      timestamp: new Date().toISOString(),
      status: 'success'
    });
    console.log('Successfully wrote document with ID:', docRef.id);
    
    // Read documents
    console.log('Attempting to read from Firestore...');
    const snapshot = await getDocs(testCollection);
    console.log(`Successfully read ${snapshot.size} documents from collection.`);
    
    console.log('\n✅ FIREBASE IS WORKING CORRECTLY!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FIREBASE CONNECTION FAILED!');
    console.error(error);
    process.exit(1);
  }
}

testFirebase();
