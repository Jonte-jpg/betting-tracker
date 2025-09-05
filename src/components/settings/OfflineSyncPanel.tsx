import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { RefreshCw, Check, AlertCircle, Upload, Download } from 'lucide-react';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';
import { useBets } from '../../hooks/useBets';
import { useAuth } from '../../hooks/useAuth';

export const OfflineSyncPanel = () => {
  const { user } = useAuth();
  const { syncing, syncPendingChanges } = useBets(user?.uid || null);
  const { 
    isOnline, 
    hasOfflineData, 
    getPendingChanges, 
    getOfflineData,
    clearOfflineData 
  } = useOfflineStorage();
  
  const [pendingChanges, setPendingChanges] = useState(getPendingChanges());
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    const updateData = () => {
      setPendingChanges(getPendingChanges());
      const offlineData = getOfflineData();
      setLastSync(offlineData.lastSync);
    };

    updateData();
    
    // Uppdatera var 5:e sekund
    const interval = setInterval(updateData, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalPendingChanges = 
    pendingChanges.add.length + 
    pendingChanges.update.length + 
    pendingChanges.delete.length;

  const handleManualSync = async () => {
    if (syncPendingChanges) {
      await syncPendingChanges();
      setPendingChanges(getPendingChanges());
    }
  };

  const handleClearOfflineData = () => {
    if (confirm('Är du säker på att du vill rensa all offline data? Detta kan inte ångras.')) {
      clearOfflineData();
      setPendingChanges({ add: [], update: [], delete: [] });
    }
  };

  const formatLastSync = (syncTime: string | null) => {
    if (!syncTime) return 'Aldrig';
    
    const date = new Date(syncTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just nu';
    if (diffMins < 60) return `${diffMins} min sedan`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} tim sedan`;
    return date.toLocaleDateString('sv-SE');
  };

  if (!hasOfflineData && totalPendingChanges === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
          Offline Synkronisering
        </CardTitle>
        <CardDescription>
          Hantera offline data och synkronisering
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status översikt */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {pendingChanges.add.length}
            </div>
            <div className="text-muted-foreground">Nya bets</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {pendingChanges.update.length}
            </div>
            <div className="text-muted-foreground">Uppdateringar</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {pendingChanges.delete.length}
            </div>
            <div className="text-muted-foreground">Borttagningar</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">
              {formatLastSync(lastSync)}
            </div>
            <div className="text-muted-foreground">Senaste sync</div>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          {isOnline ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Check className="h-3 w-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
          
          {totalPendingChanges > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Upload className="h-3 w-3 mr-1" />
              {totalPendingChanges} väntande ändringar
            </Badge>
          )}
          
          {syncing && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Synkroniserar
            </Badge>
          )}
        </div>

        {/* Knappar */}
        <div className="flex gap-2">
          {isOnline && totalPendingChanges > 0 && (
            <Button 
              onClick={handleManualSync}
              disabled={syncing}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              {syncing ? 'Synkroniserar...' : 'Synkronisera Nu'}
            </Button>
          )}
          
          {hasOfflineData && (
            <Button 
              variant="outline"
              onClick={handleClearOfflineData}
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Rensa Offline Data
            </Button>
          )}
        </div>

        {/* Hjälptext */}
        <div className="text-xs text-muted-foreground">
          <p>
            Offline data sparas automatiskt när du är offline. 
            När du kommer online igen synkroniseras ändringarna automatiskt.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
