import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface SectionRibbonProps {
  children: ReactNode;
  color: 'red' | 'green' | 'yellow' | 'blue';
  rightLink?: { text: string; url: string };
  className?: string;
}

export function SectionRibbon({ children, color, rightLink, className = '' }: SectionRibbonProps) {
  const bgColors = {
    red: 'bg-[#E30613]',
    green: 'bg-[#007A33]',
    yellow: 'bg-[#FFD100]',
    blue: 'bg-[#0A369D]'
  };

  const textColors = {
    red: 'text-white',
    green: 'text-white',
    yellow: 'text-black',
    blue: 'text-white'
  };

  return (
    <div className={`flex items-center justify-between border-b-2 border-gray-200 mb-6 ${className}`}>
      <div 
        className={`${bgColors[color]} ${textColors[color]} font-bold uppercase tracking-wide text-sm px-4 py-1.5`}
        style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)', paddingRight: '24px' }}
      >
        {children}
      </div>
      {rightLink && (
        <Link to={rightLink.url} className="text-brand-red text-xs font-bold uppercase hover:underline">
          {rightLink.text}
        </Link>
      )}
    </div>
  );
}
