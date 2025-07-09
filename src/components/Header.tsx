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
    <header className="safe-top bg-primary-600 text-white shadow-sm">
      <div className="mobile-container">
        <div className="flex items-center justify-between h-14">
          {showBackButton ? (
            <button
              onClick={onBackClick}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-primary-700 transition-colors"
              aria-label="Zurück"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
            </button>
          ) : (
            <div className="w-10" />
          )}
          
          <h1 className="text-lg font-semibold text-center flex-1">
            {title}
          </h1>
          
          <div className="w-10" />
        </div>
      </div>
    </header>
  );
};

export default Header;
