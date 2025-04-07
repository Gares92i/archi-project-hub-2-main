
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

export const useRoles = () => {
  const { roles } = useAuth();
  
  const hasRole = (role: UserRole) => {
    return roles.includes(role);
  };
  
  const isPrimaryRole = (role: UserRole) => {
    const priorityOrder: UserRole[] = ['admin', 'architect', 'client', 'contractor'];
    const userHighestPriorityRole = priorityOrder.find(r => roles.includes(r));
    return userHighestPriorityRole === role;
  };
  
  const getPrimaryRole = (): UserRole | null => {
    const priorityOrder: UserRole[] = ['admin', 'architect', 'client', 'contractor'];
    return priorityOrder.find(r => roles.includes(r)) || null;
  };
  
  return {
    roles,
    hasRole,
    isPrimaryRole,
    getPrimaryRole
  };
};
