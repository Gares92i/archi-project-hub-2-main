
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeamMemberFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  onAddMember: () => void;
}

export const TeamMemberFilters: React.FC<TeamMemberFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  onAddMember
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Input
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <Button onClick={onAddMember} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un membre
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full overflow-auto">
        <TabsList className="w-full md:w-auto justify-start">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="architects">Architectes</TabsTrigger>
          <TabsTrigger value="engineers">Ingénieurs</TabsTrigger>
          <TabsTrigger value="designers">Designers</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
