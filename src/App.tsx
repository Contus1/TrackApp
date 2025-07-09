import { useEffect } from 'react';
import AppRouter from './components/AppRouter';
import './styles/globals.css';
import { pwaService } from './services/pwaService';

function App() {
  useEffect(() => {
    // Initialize PWA service
    console.log('PWA Service initialized:', pwaService.isAppInstalled());
  }, []);

  return <AppRouter />;
}

export default App;
