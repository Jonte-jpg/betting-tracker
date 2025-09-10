import { useState, useEffect } from 'react';
import { Bet } from '../types/Bet';

interface OfflineStorage {
  bets: Bet[];
  lastSync: string | null;
  pendingChanges: {
    add: Bet[];
    update: Bet[];
    delete: string[];
  };
}

const STORAGE_KEY = 'betting-tracker-offline';

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasOfflineData, setHasOfflineData] = useState(false);

  // Övervaka online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Kontrollera om det finns offline data
  useEffect(() => {
    const offlineData = getOfflineData();
    setHasOfflineData(
      offlineData.bets.length > 0 || 
      offlineData.pendingChanges.add.length > 0 ||
      offlineData.pendingChanges.update.length > 0 ||
      offlineData.pendingChanges.delete.length > 0
    );
  }, []);

  const getOfflineData = (): OfflineStorage => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error parsing offline data:', error);
    }
    
    return {
      bets: [],
      lastSync: null,
      pendingChanges: {
        add: [],
        update: [],
        delete: []
      }
    };
  };

  const saveOfflineData = (data: OfflineStorage) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setHasOfflineData(
        data.bets.length > 0 || 
        data.pendingChanges.add.length > 0 ||
        data.pendingChanges.update.length > 0 ||
        data.pendingChanges.delete.length > 0
      );
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  // Spara bets offline
  const saveBetsOffline = (bets: Bet[]) => {
    const data = getOfflineData();
    data.bets = bets;
    data.lastSync = new Date().toISOString();
    saveOfflineData(data);
  };

  // Lägg till bet offline
  const addBetOffline = (bet: Bet) => {
    const data = getOfflineData();
    
    // Lägg till i lokal lista
    data.bets.unshift(bet);
    
    // Markera som pending för sync
    data.pendingChanges.add.push(bet);
    
    saveOfflineData(data);
  };

  // Uppdatera bet offline
  const updateBetOffline = (updatedBet: Bet) => {
    const data = getOfflineData();
    
    // Uppdatera i lokal lista
    const index = data.bets.findIndex(bet => bet.id === updatedBet.id);
    if (index !== -1) {
      data.bets[index] = updatedBet;
    }
    
    // Markera som pending för sync (om inte redan i add-listan)
    const inAddList = data.pendingChanges.add.find(bet => bet.id === updatedBet.id);
    if (!inAddList) {
      const updateIndex = data.pendingChanges.update.findIndex(bet => bet.id === updatedBet.id);
      if (updateIndex !== -1) {
        data.pendingChanges.update[updateIndex] = updatedBet;
      } else {
        data.pendingChanges.update.push(updatedBet);
      }
    } else {
      // Uppdatera i add-listan istället
      const addIndex = data.pendingChanges.add.findIndex(bet => bet.id === updatedBet.id);
      if (addIndex !== -1) {
        data.pendingChanges.add[addIndex] = updatedBet;
      }
    }
    
    saveOfflineData(data);
  };

  // Ta bort bet offline
  const deleteBetOffline = (betId: string) => {
    const data = getOfflineData();
    
    // Ta bort från lokal lista
    data.bets = data.bets.filter(bet => bet.id !== betId);
    
    // Hantera pending changes
    const inAddList = data.pendingChanges.add.find(bet => bet.id === betId);
    if (inAddList) {
      // Om det var en ny bet som inte synkats, ta bara bort från add-listan
      data.pendingChanges.add = data.pendingChanges.add.filter(bet => bet.id !== betId);
    } else {
      // Annars markera för borttagning
      data.pendingChanges.delete.push(betId);
      // Ta bort från update-listan om den finns där
      data.pendingChanges.update = data.pendingChanges.update.filter(bet => bet.id !== betId);
    }
    
    saveOfflineData(data);
  };

  // Hämta offline bets
  const getOfflineBets = (): Bet[] => {
    return getOfflineData().bets;
  };

  // Hämta pending changes för sync
  const getPendingChanges = () => {
    return getOfflineData().pendingChanges;
  };

  // Rensa pending changes efter sync
  const clearPendingChanges = () => {
    const data = getOfflineData();
    data.pendingChanges = {
      add: [],
      update: [],
      delete: []
    };
    data.lastSync = new Date().toISOString();
    saveOfflineData(data);
  };

  // Rensa all offline data
  const clearOfflineData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasOfflineData(false);
  };

  return {
    isOnline,
    hasOfflineData,
    saveBetsOffline,
    addBetOffline,
    updateBetOffline,
    deleteBetOffline,
    getOfflineBets,
    getPendingChanges,
    clearPendingChanges,
    clearOfflineData,
    getOfflineData
  };
};
