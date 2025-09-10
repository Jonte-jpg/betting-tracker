import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Function to add a test transaction
export const addTestTransaction = async (userId: string) => {
  try {
    const transactionsCollection = collection(db, 'transactions');
    
    const transaction = {
      userId,
      type: 'deposit',
      amount: 1000,
      bookmaker: 'Test Bookmaker',
      date: new Date().toISOString(),
      method: 'Test',
      status: 'completed',
      notes: 'Test transaction',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(transactionsCollection, transaction);
    console.log('Test transaction added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding test transaction: ', error);
    throw error;
  }
};
