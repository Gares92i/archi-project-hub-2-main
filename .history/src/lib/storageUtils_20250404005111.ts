export const getStorageKeyForProject = (projectId: string, key: string) => {
  return `project_${projectId}_${key}`;
};