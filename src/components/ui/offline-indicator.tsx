import { useOfflineStorage } from '../../hooks/useOfflineStorage';
import { Badge } from '../ui/badge';
import { WifiOff, Wifi, Cloud, CloudOff, RefreshCw } from 'lucide-react';

export const OfflineIndicator = () => {
  const { isOnline, hasOfflineData, getPendingChanges } = useOfflineStorage();
  const pendingChanges = getPendingChanges();
  const hasPendingChanges = 
    pendingChanges.add.length > 0 || 
    pendingChanges.update.length > 0 || 
    pendingChanges.delete.length > 0;

  if (isOnline && !hasOfflineData && !hasPendingChanges) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <Wifi className="h-3 w-3" />
        Online
      </Badge>
    );
  }

  if (isOnline && hasPendingChanges) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Synkroniserar
      </Badge>
    );
  }

  if (isOnline && hasOfflineData) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        <Cloud className="h-3 w-3" />
        Online
      </Badge>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
        <WifiOff className="h-3 w-3" />
        Offline
      </Badge>
      {hasOfflineData && (
        <Badge variant="secondary" className="flex items-center gap-1 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 text-xs">
          <CloudOff className="h-3 w-3" />
          Lokal data
        </Badge>
      )}
    </div>
  );
};
