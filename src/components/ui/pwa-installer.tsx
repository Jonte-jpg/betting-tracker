import { useState, useEffect } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Download, Smartphone, Monitor, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Kontrollera om appen redan är installerad
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Visa installationsdialog efter en kort fördröjning
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-install-dismissed');
        if (!hasSeenPrompt && !isInstalled) {
          setShowInstallDialog(true);
        }
      }, 5000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallDialog(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
      } else {
        console.log('PWA installation dismissed');
      }
      
      setDeferredPrompt(null);
      setShowInstallDialog(false);
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallDialog(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <>
      {/* Installationsknapp i header */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowInstallDialog(true)}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Installera App
      </Button>

      {/* Installationsdialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Installera Betting Tracker
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Installera appen för bättre prestanda och offline-åtkomst
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Smartphone className="h-8 w-8 mb-2 text-blue-600" />
                <span className="font-medium">Mobil</span>
                <span className="text-muted-foreground text-xs">Snabb åtkomst</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Monitor className="h-8 w-8 mb-2 text-blue-600" />
                <span className="font-medium">Desktop</span>
                <span className="text-muted-foreground text-xs">Egen app</span>
              </div>
            </div>

            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Fungerar offline</li>
              <li>• Snabbare laddning</li>
              <li>• Push-notifikationer</li>
              <li>• Integrerad i operativsystemet</li>
            </ul>

            <div className="flex gap-2">
              <Button onClick={handleInstallClick} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Installera Nu
              </Button>
              <Button variant="outline" onClick={handleDismiss}>
                Senare
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
