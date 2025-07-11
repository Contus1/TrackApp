import React from 'react';

interface AnimatedFlameProps {
  size?: 'sm' | 'md' | 'lg';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

const AnimatedFlame: React.FC<AnimatedFlameProps> = ({ 
  size = 'md', 
  intensity = 'medium',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-8',
    md: 'w-8 h-10',
    lg: 'w-12 h-16'
  };

  const flameColors = {
    low: ['#ff6b35', '#ff8e53', '#ffa500'],
    medium: ['#ff4500', '#ff6347', '#ffa500', '#ffff00'],
    high: ['#ff0000', '#ff4500', '#ff6347', '#ffa500', '#ffff00', '#ffffff']
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-end justify-center`}>
      {/* Flame layers */}
      <div className="absolute bottom-0 w-full h-full">
        {/* Base flame */}
        <div 
          className="absolute bottom-0 w-full h-full rounded-full opacity-90 flame-flicker"
          style={{
            background: `radial-gradient(ellipse at bottom, ${flameColors[intensity][0]} 0%, ${flameColors[intensity][1]} 40%, transparent 70%)`,
            transform: 'scaleY(1.2)'
          }}
        />
        
        {/* Middle flame */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-3/4 rounded-full opacity-80 flame-flicker-reverse"
          style={{
            background: `radial-gradient(ellipse at bottom, ${flameColors[intensity][1]} 0%, ${flameColors[intensity][2]} 50%, transparent 70%)`,
            animationDelay: '0.3s'
          }}
        />
        
        {/* Top flame */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1/2 rounded-full opacity-70 flame-flicker-fast"
          style={{
            background: `radial-gradient(ellipse at bottom, ${flameColors[intensity][2] || flameColors[intensity][1]} 0%, ${flameColors[intensity][3] || flameColors[intensity][2]} 60%, transparent 80%)`,
            animationDelay: '0.6s'
          }}
        />

        {/* Hot center */}
        {intensity === 'high' && (
          <div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1/3 rounded-full opacity-60 flame-flicker-super-fast"
            style={{
              background: `radial-gradient(circle, ${flameColors[intensity][4]} 0%, ${flameColors[intensity][5]} 40%, transparent 70%)`,
              animationDelay: '0.9s'
            }}
          />
        )}
      </div>


    </div>
  );
};

export default AnimatedFlame;
