
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceList } from "./ResourceList";
import { Resource } from "./types";

export const categories = [
  { name: "Tous", value: "all" },
  { name: "Templates", value: "templates" },
  { name: "Normes", value: "standards" },
  { name: "Matériaux", value: "materials" },
  { name: "Tutoriels", value: "tutorials" },
  { name: "Logiciels", value: "software" },
];

interface ResourceCategoriesProps {
  resources: Resource[];
}

export const ResourceCategories = ({ resources }: ResourceCategoriesProps) => {
  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-6">
        {categories.map((category) => (
          <TabsTrigger key={category.value} value={category.value}>
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category) => (
        <TabsContent key={category.value} value={category.value}>
          <ResourceList 
            resources={resources} 
            selectedCategory={category.value} 
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};
