
import { Search } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Search className="h-12 w-12 mb-4 text-muted-foreground/50" />
      <p className="text-lg mb-2">Aucun membre trouvé</p>
      <p>Essayez d'ajuster vos filtres ou ajoutez un nouveau membre</p>
    </div>
  );
};
