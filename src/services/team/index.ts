
// Re-export all team services for easy imports
export * from './teamCoreService';
export * from './teamMembersService';
export * from './teamProjectsService';
export * from './teamStorageUtils';

// Export renamed functions from legacyTeamService to avoid naming conflicts
export { 
  getAllTeamMembers,
  addLegacyTeamMember as addLegacyTeamMember,
  updateLegacyTeamMember as updateLegacyTeamMember,
  deleteTeamMember
} from './legacyTeamService';

// Export types from the types directory
export type { LegacyTeamMember } from '@/types/team';
export type { SupabaseTeamMember } from '@/types/team';
// Re-export LegacyTeamMember as TeamMember for backward compatibility
export type { LegacyTeamMember as TeamMember } from '@/types/team';
