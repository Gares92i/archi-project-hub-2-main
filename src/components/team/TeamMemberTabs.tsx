
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { TeamMember } from "@/types/team";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface TeamMemberTabsProps {
  activeTab: string;
  filteredMembers: TeamMember[];
  isLoading: boolean;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

export const TeamMemberTabs: React.FC<TeamMemberTabsProps> = ({
  activeTab,
  filteredMembers,
  isLoading,
  onEdit,
  onDelete
}) => {
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // Rendu pour appareils non-mobiles
  if (!isMobile) {
    return (
      <Tabs value={activeTab}>
        <TabsContent value="all" className="mt-0">
          <TeamMembersList 
            members={filteredMembers}
            isLoading={isLoading}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </TabsContent>

        {["architects", "engineers", "designers"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <TeamMembersList 
              members={filteredMembers}
              isLoading={isLoading}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  // Rendu pour appareils mobiles
  return (
    <div>
      {isMobile && (
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">
            {activeTab === "all" 
              ? "Tous les membres" 
              : activeTab === "architects" 
                ? "Architectes" 
                : activeTab === "engineers" 
                  ? "Ingénieurs" 
                  : "Designers"}
          </h2>
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4 space-y-4">
                <Button 
                  variant={activeTab === "all" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => {
                    window.location.href = "/team?tab=all";
                    setIsDrawerOpen(false);
                  }}
                >
                  Tous les membres
                </Button>
                <Button 
                  variant={activeTab === "architects" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => {
                    window.location.href = "/team?tab=architects";
                    setIsDrawerOpen(false);
                  }}
                >
                  Architectes
                </Button>
                <Button 
                  variant={activeTab === "engineers" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => {
                    window.location.href = "/team?tab=engineers";
                    setIsDrawerOpen(false);
                  }}
                >
                  Ingénieurs
                </Button>
                <Button 
                  variant={activeTab === "designers" ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => {
                    window.location.href = "/team?tab=designers";
                    setIsDrawerOpen(false);
                  }}
                >
                  Designers
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      )}

      <TeamMembersList 
        members={filteredMembers} 
        isLoading={isLoading} 
        onEdit={onEdit} 
        onDelete={onDelete} 
      />
    </div>
  );
};
