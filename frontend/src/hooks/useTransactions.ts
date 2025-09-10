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
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const transactionsCollection = collection(db, "transactions");
    const transactionsQuery = query(
      transactionsCollection,
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactionsList = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Transaction[];
        setTransactions(transactionsList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

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
