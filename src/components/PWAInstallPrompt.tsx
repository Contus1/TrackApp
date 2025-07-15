import React, { useState, useEffect } from 'react';
import { pwaService } from '../services/pwaService';

const PWAInstallPrompt: React.FC = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check PWA status
    const checkPWAStatus = () => {
      setCanInstall(pwaService.canInstall());
      setIsInstalled(pwaService.isAppInstalled());
      setIsStandalone(pwaService.isRunningStandalone());
    };

    checkPWAStatus();

    // Listen for PWA events
    const handleBeforeInstallPrompt = () => {
      checkPWAStatus();
    };

    const handleAppInstalled = () => {
      checkPWAStatus();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    try {
      await pwaService.triggerInstall();
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  // Don't show if already installed or running as standalone
  if (isInstalled || isStandalone) {
    return (
      <div className="p-4 text-center border border-green-200 bg-green-50 rounded-2xl">
        <div className="mb-2 text-2xl text-green-600">📱</div>
        <div className="mb-1 text-sm font-medium text-green-800">
          App Installed!
        </div>
        <div className="text-xs text-green-600">
          TrackApp is installed on your device
        </div>
      </div>
    );
  }

  // Don't show if can't install
  if (!canInstall) {
    return (
      <div className="p-4 text-center border border-gray-200 bg-gray-50 rounded-2xl">
        <div className="mb-2 text-2xl text-gray-400">📱</div>
        <div className="mb-1 text-sm text-gray-600">
          **Curently Not Supported**
        </div>
        <div className="text-xs text-gray-500">
          Open this app in a supported browser to install it on your device and use it all the time.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 text-center border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
      <div className="mb-3 text-2xl text-blue-600">📱</div>
      <h3 className="mb-2 text-sm font-semibold text-blue-800">
        Install TrackApp
      </h3>
      <p className="mb-4 text-xs text-blue-600">
        Add TrackApp to your home screen for quick access and offline use
      </p>
      
      <div className="space-y-2">
        <button
          onClick={handleInstall}
          className="w-full px-4 py-3 text-sm font-medium text-white transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600"
        >
          🚀 Install Now
        </button>
        
        <div className="text-xs text-blue-500">
          ✓ Works offline • ✓ Push notifications • ✓ Native app experience
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
