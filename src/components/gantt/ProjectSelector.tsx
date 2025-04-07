
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project } from "./types";

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
}

const ProjectSelector = ({ projects, selectedProjectId, onProjectChange }: ProjectSelectorProps) => {
  return (
    <Select value={selectedProjectId} onValueChange={onProjectChange}>
      <SelectTrigger className="w-full sm:w-[250px]">
        <SelectValue placeholder="Sélectionner un projet" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ProjectSelector;
