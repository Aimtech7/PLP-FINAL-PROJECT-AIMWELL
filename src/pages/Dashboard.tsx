import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Heart, Apple, Users, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  healthPlansActive: number;
  communityPosts: number;
  certificates: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    healthPlansActive: 0,
    communityPosts: 0,
    certificates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      // Fetch course enrollments
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', user.id);

      // Fetch health plans
      const { data: healthPlans } = await supabase
        .from('health_plans')
        .select('*')
        .eq('user_id', user.id);

      // Fetch community posts
      const { data: communityPosts } = await supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', user.id);

      setStats({
        coursesEnrolled: enrollments?.length || 0,
        coursesCompleted: enrollments?.filter(e => e.completed_at).length || 0,
        healthPlansActive: healthPlans?.length || 0,
        communityPosts: communityPosts?.length || 0,
        certificates: enrollments?.filter(e => e.certificate_id).length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = () => {
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    return user?.email?.split('@')[0] || 'there';
  };

  const progressPercentage = stats.coursesEnrolled > 0 
    ? (stats.coursesCompleted / stats.coursesEnrolled) * 100 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {getUserName()}!</h1>
        <p className="text-primary-foreground/90">
          Continue your journey towards better health, education, and community engagement.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesEnrolled}</div>
            <p className="text-xs text-muted-foreground">
              {stats.coursesCompleted} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Plans</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.healthPlansActive}</div>
            <p className="text-xs text-muted-foreground">Active plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.communityPosts}</div>
            <p className="text-xs text-muted-foreground">Posts created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificates}</div>
            <p className="text-xs text-muted-foreground">Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Health Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Daily Health Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              💪 Start your day with 10 minutes of stretching to improve flexibility and reduce stress.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wellness Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              🧘 Practice mindfulness for 5 minutes daily to enhance mental clarity and emotional balance.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Learning Progress
            </CardTitle>
            <CardDescription>Your educational journey overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Course Completion</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{stats.coursesEnrolled} Enrolled</Badge>
              <Badge variant="default">{stats.coursesCompleted} Completed</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Continue where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link to="/education">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Courses
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/health">
                <Heart className="mr-2 h-4 w-4" />
                Health Checkup
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/nutrition">
                <Apple className="mr-2 h-4 w-4" />
                Meal Planning
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/community">
                <Users className="mr-2 h-4 w-4" />
                Join Discussions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
