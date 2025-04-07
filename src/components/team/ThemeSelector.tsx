
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Palette } from 'lucide-react';

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => setTheme('light')}
          variant={theme === 'light' ? 'default' : 'outline'}
          className="flex items-center gap-2"
        >
          <Sun className="h-4 w-4" />
          Noir et Blanc
        </Button>
        
        <Button
          onClick={() => setTheme('color')}
          variant={theme === 'color' ? 'default' : 'outline'}
          className="flex items-center gap-2"
        >
          <Palette className="h-4 w-4" />
          Couleur
        </Button>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-sync-beige p-4 rounded-lg shadow-sm">
          <div className="font-medium">Beige</div>
          <div className="text-xs text-sync-teal-light">#F3EFE7</div>
        </div>
        <div className="bg-sync-sand p-4 rounded-lg shadow-sm">
          <div className="font-medium">Sand</div>
          <div className="text-xs text-sync-teal-light">#EADCCE</div>
        </div>
        <div className="bg-sync-mint p-4 rounded-lg shadow-sm">
          <div className="font-medium">Mint</div>
          <div className="text-xs text-sync-teal-light">#9AE382</div>
        </div>
      </div>
    </div>
  );
};
