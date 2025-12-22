import { initializeApp, getApps } from 'firebase/app';
import { collection, getDocs, addDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { seedHabits } from '@/lib/seedData';

// Server-side Firebase initialization
function getDb() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return getFirestore(app);
}

export async function POST() {
  try {
    const db = getDb();
    const habitsRef = collection(db, 'habits');
    
    // Check if habits already exist
    const existingHabits = await getDocs(habitsRef);
    if (!existingHabits.empty) {
      return Response.json({ 
        success: true, 
        message: 'Habits already seeded',
        count: existingHabits.size 
      });
    }

    // Seed all habits
    const promises = seedHabits.map((habit) => 
      addDoc(habitsRef, {
        ...habit,
        createdAt: serverTimestamp()
      })
    );

    await Promise.all(promises);

    return Response.json({ 
      success: true, 
      message: 'Successfully seeded habits',
      count: seedHabits.length 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
