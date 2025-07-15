import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t shadow-2xl safe-bottom bg-gradient-to-r from-purple-900/95 to-blue-900/95 backdrop-blur-xl border-white/10">
      <div className="mobile-container">
        <div className="py-6">
          <p className="text-sm font-medium text-center text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text">
            © 2025 TrackApp. Made with 💜 in Madrid by Carl Lichtl!
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
