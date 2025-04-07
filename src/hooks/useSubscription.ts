
import { useAuth } from '@/contexts/AuthContext';

export const useSubscription = () => {
  const { subscription } = useAuth();
  
  const isActive = () => {
    return subscription?.status === 'active';
  };
  
  const getPlanType = () => {
    return subscription?.plan_type || 'free';
  };
  
  const getPlanExpiryDate = () => {
    if (!subscription?.current_period_end) return null;
    return new Date(subscription.current_period_end);
  };
  
  const getSeatsAvailable = () => {
    return subscription?.seats || 0;
  };
  
  return {
    subscription,
    isActive,
    getPlanType,
    getPlanExpiryDate,
    getSeatsAvailable
  };
};
