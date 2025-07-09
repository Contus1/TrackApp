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
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
        <div className="text-green-600 text-2xl mb-2">📱</div>
        <div className="text-green-800 font-medium text-sm mb-1">
          App Installed!
        </div>
        <div className="text-green-600 text-xs">
          TrackApp is installed on your device
        </div>
      </div>
    );
  }

  // Don't show if can't install
  if (!canInstall) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
        <div className="text-gray-400 text-2xl mb-2">📱</div>
        <div className="text-gray-600 text-sm mb-1">
          Install App
        </div>
        <div className="text-gray-500 text-xs">
          Open this app in a supported browser to install it on your device
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-4 text-center">
      <div className="text-blue-600 text-2xl mb-3">📱</div>
      <h3 className="text-blue-800 font-semibold text-sm mb-2">
        Install TrackApp
      </h3>
      <p className="text-blue-600 text-xs mb-4">
        Add TrackApp to your home screen for quick access and offline use
      </p>
      
      <div className="space-y-2">
        <button
          onClick={handleInstall}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 text-sm"
        >
          🚀 Install Now
        </button>
        
        <div className="text-blue-500 text-xs">
          ✓ Works offline • ✓ Push notifications • ✓ Native app experience
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
