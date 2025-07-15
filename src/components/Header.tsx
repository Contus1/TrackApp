import React from 'react';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Meine Fitness Streaks", 
  showBackButton = false, 
  onBackClick 
}) => {
  return (
    <header className="safe-top bg-gradient-to-r from-purple-900/95 to-blue-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="mobile-container">
        <div className="flex items-center justify-between h-16">
          {showBackButton ? (
            <button
              onClick={onBackClick}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all duration-300 border border-white/10 shadow-xl group hover:scale-110 transform"
              aria-label="Zurück"
            >
              <svg 
                className="w-6 h-6 text-white group-hover:text-purple-300 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
            </button>
          ) : (
            <div className="w-12" />
          )}
          
          <h1 className="text-xl font-bold text-center flex-1 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            {title}
          </h1>
          
          <div className="w-12" />
        </div>
      </div>
    </header>
  );
};

export default Header;
