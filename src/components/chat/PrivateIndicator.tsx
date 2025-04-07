
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function PrivateIndicator() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center text-muted-foreground">
            <Lock className="h-4 w-4 mr-1" />
            <span className="text-xs">Privé</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Cette conversation est privée et n'est pas associée à une équipe</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
