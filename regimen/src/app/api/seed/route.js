import { initializeApp, getApps } from 'firebase/app';
import { collection, getDocs, addDoc, getFirestore, serverTimestamp, query, where } from 'firebase/firestore';
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

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return Response.json({ 
        success: false, 
        error: 'userId is required' 
      }, { status: 400 });
    }

    const db = getDb();
    const habitsRef = collection(db, 'habits');
    
    // Check if user already has habits
    const userHabitsQuery = query(habitsRef, where('userId', '==', userId));
    const existingHabits = await getDocs(userHabitsQuery);
    
    if (!existingHabits.empty) {
      return Response.json({ 
        success: true, 
        message: 'User already has habits',
        count: existingHabits.size 
      });
    }

    // Seed all habits for this user
    const promises = seedHabits.map((habit) => 
      addDoc(habitsRef, {
        ...habit,
        userId: userId,
        createdAt: serverTimestamp()
      })
    );

    await Promise.all(promises);

    return Response.json({ 
      success: true, 
      message: 'Successfully seeded habits for user',
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
