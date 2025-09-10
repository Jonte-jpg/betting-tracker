import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Transaction } from "../types/Firebase";
import { useAuth } from "./useAuth";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const baseQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    )

    // Start with ordered query; if it fails due to missing index, fall back.
    let unsub: (() => void) | undefined
    const startListener = (ordered: boolean) => {
      const q = ordered ? query(baseQuery, orderBy('date', 'desc')) : baseQuery
      unsub = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Transaction[]
          setTransactions(list)
          setLoading(false)
          if (!ordered) {
            // Informative, but non-blocking: still working without sorting
            setError((prev) => prev ?? 'Saknar index för sortering – visar utan sortering.')
          } else {
            setError(null)
          }
        },
        (err: unknown) => {
          const message = (err as { message?: string } | null)?.message || ''
          const msg = String(message)
          // If index is missing and we tried ordered, retry without orderBy
          if (ordered && (msg.includes('index') || msg.includes('requires an index'))) {
            if (unsub) unsub()
            startListener(false)
            return
          }
          console.error('Error fetching transactions:', err)
          setError('Kunde inte hämta transaktioner. Försök igen senare.')
          setLoading(false)
        }
      )
    }

    startListener(true)

    return () => {
      if (unsub) unsub()
    }
  }, [user])

  const addTransaction = async (transaction: Transaction): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    try {
      const transactionsCollection = collection(db, "transactions");
      await addDoc(transactionsCollection, {
        ...transaction,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error adding transaction:", err);
      throw new Error("Failed to add transaction");
    }
  };

  const updateTransaction = async (transaction: Transaction): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    if (!transaction.id) throw new Error("Transaction ID is required for updating");

    try {
      const transactionRef = doc(db, "transactions", transaction.id);
      await updateDoc(transactionRef, {
        ...transaction,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error updating transaction:", err);
      throw new Error("Failed to update transaction");
    }
  };

  const deleteTransaction = async (transactionId: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    try {
      const transactionRef = doc(db, "transactions", transactionId);
      await deleteDoc(transactionRef);
    } catch (err) {
      console.error("Error deleting transaction:", err);
      throw new Error("Failed to delete transaction");
    }
  };

  // Calculate totals
  const totals = {
    deposits: 0,
    withdrawals: 0,
    balance: 0,
  };

  // Bookmaker totals
  const bookmakerTotals: Record<string, { deposits: number; withdrawals: number; balance: number }> = {};

  // Calculate totals and bookmaker totals
  transactions.forEach((transaction) => {
    if (transaction.status === "completed") {
      if (transaction.type === "deposit") {
        totals.deposits += transaction.amount;
      } else if (transaction.type === "withdrawal") {
        totals.withdrawals += transaction.amount;
      }

      const bookmaker = transaction.bookmaker;
      if (!bookmakerTotals[bookmaker]) {
        bookmakerTotals[bookmaker] = { deposits: 0, withdrawals: 0, balance: 0 };
      }

      if (transaction.type === "deposit") {
        bookmakerTotals[bookmaker].deposits += transaction.amount;
      } else if (transaction.type === "withdrawal") {
        bookmakerTotals[bookmaker].withdrawals += transaction.amount;
      }
    }
  });

  // Calculate balance
  totals.balance = totals.deposits - totals.withdrawals;

  // Calculate bookmaker balances
  Object.keys(bookmakerTotals).forEach((bookmaker) => {
    bookmakerTotals[bookmaker].balance =
      bookmakerTotals[bookmaker].deposits - bookmakerTotals[bookmaker].withdrawals;
  });

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totals,
    bookmakerTotals,
  };
}
