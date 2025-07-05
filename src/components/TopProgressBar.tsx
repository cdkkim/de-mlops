'use client';

interface TopProgressBarProps {
  isLoading: boolean;
}

export default function TopProgressBar({ isLoading }: TopProgressBarProps) {
  return (
    <div className={`fixed top-0 left-0 w-full h-[2px] z-50 overflow-hidden transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-blue-500 animate-indeterminate-progress"></div>
        <style jsx>{`
            @keyframes indeterminate-progress {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            .animate-indeterminate-progress {
                animation: indeterminate-progress 2s ease-in-out infinite;
            }
        `}</style>
    </div>
  );
} 