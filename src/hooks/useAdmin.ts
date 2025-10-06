import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    try {
      // Check if user has admin or super_admin role using the new role system
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'super_admin']);

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      } else {
        const roles = data?.map(r => r.role) || [];
        const hasAdminRole = roles.includes('admin') || roles.includes('super_admin');
        const hasSuperAdminRole = roles.includes('super_admin');
        
        setIsAdmin(hasAdminRole);
        setIsSuperAdmin(hasSuperAdminRole);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, isSuperAdmin, loading };
}