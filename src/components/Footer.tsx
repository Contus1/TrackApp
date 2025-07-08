import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="safe-bottom bg-white border-t border-gray-200 mt-auto">
      <div className="mobile-container">
        <div className="py-4">
          <p className="text-center text-sm text-gray-600">
            © 2025 TrackApp. Bleiben Sie fit!
          </p>
          <div className="flex justify-center space-x-6 mt-2">
            <a 
              href="#" 
              className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
            >
              Datenschutz
            </a>
            <a 
              href="#" 
              className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
            >
              AGB
            </a>
            <a 
              href="#" 
              className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
            >
              Hilfe
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
