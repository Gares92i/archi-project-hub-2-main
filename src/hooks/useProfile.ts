
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/auth';

export const useProfile = () => {
  const { profile, updateProfile } = useAuth();
  
  const getUserFullName = () => {
    if (!profile) return '';
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  };
  
  const getInitials = () => {
    if (!profile) return '';
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };
  
  return {
    profile,
    updateProfile,
    getUserFullName,
    getInitials
  };
};
