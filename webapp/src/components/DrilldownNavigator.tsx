'use client';

import { DrilldownData } from '@/types/product';
import { ChevronRight, RefreshCw } from 'lucide-react';

interface DrilldownNavigatorProps {
  drilldownData: DrilldownData;
  path: string[];
  setPath: (path: string[]) => void;
  isUpdating?: boolean;
}

const DrilldownNavigator = ({ drilldownData, path, setPath, isUpdating = false }: DrilldownNavigatorProps) => {
  
  const handleHomeClick = () => {
    if (isUpdating) return;
    setPath(['All']);
  };

  const handleBreadcrumbClick = (index: number) => {
    setPath(path.slice(0, index + 1));
  };
  
  const handleChipClick = (itemName: string) => {
    setPath([...path, itemName]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-sm">
        <button
          onClick={handleHomeClick}
          className="p-2 rounded-full transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Reset view"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <ul className="flex items-center space-x-2">
          {path.slice(1).map((segment, index) => {
            // The last breadcrumb (the current level) should not be clickable.
            const isLast = index === path.length - 2;
            return (
              <li key={index} className="flex items-center">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <button 
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`font-medium transition-colors ${
                    isLast ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                  disabled={isLast}
                >
                  {segment}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="relative">
        <div className="flex-grow overflow-x-auto custom-scrollbar -mx-3 px-3">
           <div className="flex space-x-3 pb-2">
             {drilldownData.items.map((item) => (
                 <button
                    key={item.name}
                    onClick={() => handleChipClick(item.name)}
                    className="animate-fade-in flex-shrink-0 flex items-center space-x-2 bg-background hover:bg-accent text-foreground font-medium px-4 py-2 rounded-full text-sm transition-colors duration-200"
                 >
                     <span>{item.name}</span>
                 </button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DrilldownNavigator;