// PWA Service - handles installation and updates

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface ExtendedNavigator extends Navigator {
  standalone?: boolean;
}

class PWAService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private isStandalone = false;

  constructor() {
    this.init();
  }

  private init() {
    // Check if app is already installed
    this.checkInstallationStatus();
    
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA install prompt available');
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.showInstallPrompt();
    });

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.isInstalled = true;
      this.hideInstallPrompt();
      this.showInstalledMessage();
    });

    // Register service worker
    this.registerServiceWorker();
  }

  private checkInstallationStatus() {
    // Check if running as standalone app
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as ExtendedNavigator).standalone ||
                      document.referrer.includes('android-app://');
    
    this.isInstalled = this.isStandalone;
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker registered:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('New service worker version found');
          this.handleServiceWorkerUpdate(registration);
        });
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  }

  private handleServiceWorkerUpdate(registration: ServiceWorkerRegistration) {
    const newWorker = registration.installing;
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          this.showUpdatePrompt();
        }
      });
    }
  }

  private showInstallPrompt() {
    if (this.isInstalled) return;
    
    const installBanner = this.createInstallBanner();
    document.body.appendChild(installBanner);
  }

  private createInstallBanner(): HTMLElement {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed bottom-4 left-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-2xl shadow-lg z-50 flex items-center justify-between';
    banner.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-2xl">📱</div>
        <div>
          <div class="font-semibold text-sm">Install TrackApp</div>
          <div class="text-xs opacity-90">Add to your home screen for quick access</div>
        </div>
      </div>
      <div class="flex space-x-2">
        <button id="pwa-install-btn" class="bg-white text-orange-600 px-4 py-2 rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors">
          Install
        </button>
        <button id="pwa-dismiss-btn" class="text-white px-3 py-2 rounded-xl text-sm hover:bg-black hover:bg-opacity-20 transition-colors">
          ✕
        </button>
      </div>
    `;

    // Add event listeners
    const installBtn = banner.querySelector('#pwa-install-btn');
    const dismissBtn = banner.querySelector('#pwa-dismiss-btn');

    installBtn?.addEventListener('click', () => this.installApp());
    dismissBtn?.addEventListener('click', () => this.hideInstallPrompt());

    return banner;
  }

  private async installApp() {
    if (!this.deferredPrompt) return;

    try {
      this.deferredPrompt.prompt();
      const result = await this.deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('User accepted PWA installation');
      } else {
        console.log('User dismissed PWA installation');
      }
      
      this.deferredPrompt = null;
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  }

  private hideInstallPrompt() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }

  private showInstalledMessage() {
    const message = document.createElement('div');
    message.className = 'fixed bottom-4 left-4 right-4 bg-green-500 text-white p-4 rounded-2xl shadow-lg z-50 flex items-center space-x-3';
    message.innerHTML = `
      <div class="text-2xl">✅</div>
      <div>
        <div class="font-semibold text-sm">App Installed!</div>
        <div class="text-xs opacity-90">TrackApp is now on your home screen</div>
      </div>
    `;
    
    document.body.appendChild(message);
    
    // Remove after 3 seconds
    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  private showUpdatePrompt() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'fixed top-4 left-4 right-4 bg-blue-500 text-white p-4 rounded-2xl shadow-lg z-50 flex items-center justify-between';
    updateBanner.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-2xl">🔄</div>
        <div>
          <div class="font-semibold text-sm">Update Available</div>
          <div class="text-xs opacity-90">A new version of TrackApp is ready</div>
        </div>
      </div>
      <div class="flex space-x-2">
        <button id="pwa-update-btn" class="bg-white text-blue-600 px-4 py-2 rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors">
          Update
        </button>
        <button id="pwa-update-dismiss-btn" class="text-white px-3 py-2 rounded-xl text-sm hover:bg-black hover:bg-opacity-20 transition-colors">
          Later
        </button>
      </div>
    `;

    const updateBtn = updateBanner.querySelector('#pwa-update-btn');
    const dismissBtn = updateBanner.querySelector('#pwa-update-dismiss-btn');

    updateBtn?.addEventListener('click', () => {
      window.location.reload();
    });
    
    dismissBtn?.addEventListener('click', () => {
      updateBanner.remove();
    });

    document.body.appendChild(updateBanner);
  }

  // Public methods
  public canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled;
  }

  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  public isRunningStandalone(): boolean {
    return this.isStandalone;
  }

  public async triggerInstall(): Promise<void> {
    if (this.canInstall()) {
      await this.installApp();
    }
  }
}

export const pwaService = new PWAService();
export default pwaService;
