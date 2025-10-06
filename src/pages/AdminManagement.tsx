import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Shield, UserPlus, Trash2, Clock } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserRole {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'user';
  granted_at: string;
  granted_by: string | null;
  notes: string | null;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  details: any;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

const AdminManagement = () => {
  const { user } = useAuth();
  const { isSuperAdmin, loading: adminLoading } = useAdmin();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'moderator'>('admin');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUserRoles();
      fetchAuditLogs();
    }
  }, [isSuperAdmin]);

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  const fetchUserRoles = async () => {
    try {
      // Fetch roles and then get profile data separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('granted_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch profiles for these users
      const userIds = rolesData?.map(r => r.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      // Combine the data
      const combinedData = rolesData?.map(role => ({
        ...role,
        profiles: profilesData?.find(p => p.id === role.user_id) || null
      }));

      setUserRoles(combinedData as any || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast.error('Failed to load user roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      // Fetch logs and then get profile data separately
      const { data: logsData, error: logsError } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Fetch profiles for these admins
      const adminIds = logsData?.map(l => l.admin_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', adminIds);

      // Combine the data
      const combinedData = logsData?.map(log => ({
        ...log,
        profiles: profilesData?.find(p => p.id === log.admin_id) || null
      }));

      setAuditLogs(combinedData as any || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      // Use the RPC function to grant role by email
      const { data, error } = await supabase.rpc('grant_role_by_email', {
        _email: email,
        _role: role,
        _notes: notes || null,
      });

      if (error) throw error;

      const result = data as any;
      if (result && !result.success) {
        toast.error(result.error || 'Failed to grant role');
        return;
      }

      toast.success(`Successfully granted ${role} role to ${email}`);
      setEmail('');
      setNotes('');
      fetchUserRoles();
      fetchAuditLogs(); // Refresh audit logs
    } catch (error: any) {
      console.error('Error granting role:', error);
      toast.error(error.message || 'Failed to grant role');
    }
  };

  const handleRevokeRole = async (roleId: string, userName: string) => {
    try {
      // Use the RPC function to revoke role
      const { data, error } = await supabase.rpc('revoke_role_by_id', {
        _role_id: roleId,
      });

      if (error) throw error;

      const result = data as any;
      if (result && !result.success) {
        toast.error(result.error || 'Failed to revoke role');
        return;
      }

      toast.success(`Successfully revoked role from ${userName}`);
      fetchUserRoles();
      fetchAuditLogs(); // Refresh audit logs
    } catch (error: any) {
      console.error('Error revoking role:', error);
      toast.error(error.message || 'Failed to revoke role');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'moderator': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Super Admin Panel</h1>
        </div>
        <p className="text-white/90">
          Manage administrators, moderators, and view audit logs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grant Role Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Grant Admin Access
            </CardTitle>
            <CardDescription>
              Add administrators or moderators to the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGrantRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: any) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Reason for granting this role..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full">
                Grant Role
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Current Admins */}
        <Card>
          <CardHeader>
            <CardTitle>Current Administrators</CardTitle>
            <CardDescription>
              Users with elevated privileges
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {userRoles.map((userRole) => (
                  <div
                    key={userRole.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {userRole.profiles?.first_name} {userRole.profiles?.last_name}
                        </p>
                        <Badge variant={getRoleBadgeColor(userRole.role)}>
                          {userRole.role.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Granted {new Date(userRole.granted_at).toLocaleDateString()}
                      </p>
                      {userRole.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Note: {userRole.notes}
                        </p>
                      )}
                    </div>
                    {userRole.role !== 'super_admin' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Role?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove {userRole.role} privileges from this user.
                              They will lose access to administrative features.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevokeRole(userRole.id, `${userRole.profiles?.first_name} ${userRole.profiles?.last_name}`)}
                            >
                              Revoke
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
                {userRoles.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No administrators found
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Admin Activity Audit Log
          </CardTitle>
          <CardDescription>
            Recent administrative actions and data access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between p-3 border rounded-lg text-sm"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {log.profiles?.first_name} {log.profiles?.last_name}
                  </p>
                  <p className="text-muted-foreground">
                    {log.action} on {log.table_name}
                  </p>
                  {log.details && (
                    <pre className="text-xs mt-1 text-muted-foreground">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No audit logs found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;
