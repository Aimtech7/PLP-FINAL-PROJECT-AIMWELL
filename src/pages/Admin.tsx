import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  BookOpen, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  Shield,
  Calendar,
  Activity,
  Brain,
  Apple
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalHealthPlans: number;
  totalForumPosts: number;
  recentUsers: any[];
  recentEnrollments: any[];
  recentHealthPlans: any[];
}

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalHealthPlans: 0,
    totalForumPosts: 0,
    recentUsers: [],
    recentEnrollments: [],
    recentHealthPlans: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    }
  }, [isAdmin]);

  // Redirect if not admin
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const fetchAdminStats = async () => {
    try {
      // Fetch total counts
      const [
        { count: totalUsers },
        { count: totalCourses },
        { count: totalEnrollments },
        { count: totalHealthPlans },
        { count: totalForumPosts }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('course_enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('health_plans').select('*', { count: 'exact', head: true }),
        supabase.from('forum_posts').select('*', { count: 'exact', head: true })
      ]);

      // Fetch recent data with joins
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentEnrollments } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (title),
          profiles (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentHealthPlans } = await supabase
        .from('health_plans')
        .select(`
          *,
          profiles (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalEnrollments: totalEnrollments || 0,
        totalHealthPlans: totalHealthPlans || 0,
        totalForumPosts: totalForumPosts || 0,
        recentUsers: recentUsers || [],
        recentEnrollments: recentEnrollments || [],
        recentHealthPlans: recentHealthPlans || [],
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanTypeIcon = (type: string) => {
    switch (type) {
      case 'fitness': return <Activity className="h-4 w-4" />;
      case 'nutrition': return <Apple className="h-4 w-4" />;
      case 'mental_health': return <Brain className="h-4 w-4" />;
      default: return <Heart className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-white/90">
          Comprehensive overview of all application statistics and user activity.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Available courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Course enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Plans</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHealthPlans}</div>
            <p className="text-xs text-muted-foreground">
              AI-generated plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forum Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalForumPosts}</div>
            <p className="text-xs text-muted-foreground">
              Community posts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Users
            </CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {user.is_admin && (
                    <Badge variant="destructive">Admin</Badge>
                  )}
                </div>
              ))}
              {stats.recentUsers.length === 0 && (
                <p className="text-muted-foreground">No users found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Enrollments
            </CardTitle>
            <CardDescription>Latest course enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="space-y-1">
                  <p className="font-medium text-sm">
                    {enrollment.courses?.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {enrollment.profiles?.first_name} {enrollment.profiles?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(enrollment.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {stats.recentEnrollments.length === 0 && (
                <p className="text-muted-foreground">No enrollments found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Health Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Recent Health Plans
            </CardTitle>
            <CardDescription>Latest AI-generated plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentHealthPlans.map((plan) => (
                <div key={plan.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getPlanTypeIcon(plan.plan_type)}
                    <p className="font-medium text-sm capitalize">
                      {plan.plan_type.replace('_', ' ')} Plan
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.profiles?.first_name} {plan.profiles?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {stats.recentHealthPlans.length === 0 && (
                <p className="text-muted-foreground">No health plans found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;