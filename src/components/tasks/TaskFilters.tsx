
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  selectedPriority: string;
  setSelectedPriority: (value: string) => void;
  onResetFilters?: () => void;
}

const TaskFilters = ({
  searchQuery,
  setSearchQuery,
  selectedProject,
  setSelectedProject,
  selectedPriority,
  setSelectedPriority,
  onResetFilters
}: TaskFiltersProps) => {
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedProject("all");
    setSelectedPriority("all");
    
    if (onResetFilters) {
      onResetFilters();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher une tâche..." 
          className="pl-9" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les projets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les projets</SelectItem>
            <SelectItem value="1">Villa Moderna</SelectItem>
            <SelectItem value="2">Tour Horizon</SelectItem>
            <SelectItem value="3">Résidence Eterna</SelectItem>
            <SelectItem value="4">Centre Commercial Lumina</SelectItem>
            <SelectItem value="5">Bureaux Panorama</SelectItem>
            <SelectItem value="6">École Futura</SelectItem>
            <SelectItem value="7">Hôtel Riviera</SelectItem>
            <SelectItem value="8">Complexe Sportif Olympia</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes les priorités" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les priorités</SelectItem>
            <SelectItem value="high">Haute</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="low">Faible</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={resetFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};

export default TaskFilters;
