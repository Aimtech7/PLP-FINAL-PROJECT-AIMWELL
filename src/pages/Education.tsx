import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Clock, User, Star, Play, CheckCircle, Award, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructor_name: string;
  duration_hours: number;
  is_premium: boolean;
  price: number;
  video_url?: string;
  pass_score: number;
  created_at: string;
}

interface CourseEnrollment {
  id: string;
  course_id: string;
  completed_at?: string;
  score?: number;
}

interface ExternalCourse {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  url: string;
  price_text: string;
  thumbnail_url?: string;
  source: string;
}

const Education = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [externalCourses, setExternalCourses] = useState<ExternalCourse[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    fetchCoursesAndEnrollments();
  }, [user]);

  const fetchCoursesAndEnrollments = async () => {
    if (!user) return;

    try {
      const [coursesRes, externalRes, enrollmentsRes] = await Promise.all([
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        supabase.from('external_courses').select('*').eq('is_published', true).order('created_at', { ascending: false }),
        supabase.from('course_enrollments').select('*').eq('user_id', user.id),
      ]);

      if (coursesRes.error) throw coursesRes.error;
      if (externalRes.error) throw externalRes.error;
      if (enrollmentsRes.error) throw enrollmentsRes.error;

      setCourses(coursesRes.data || []);
      setExternalCourses(externalRes.data || []);
      setEnrollments(enrollmentsRes.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async (courseId: string) => {
    if (!user) return;

    setEnrolling(courseId);
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've been enrolled in the course.",
      });

      // Refresh enrollments
      fetchCoursesAndEnrollments();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(null);
    }
  };

  const completeCourse = async (courseId: string, score: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('course_enrollments')
        .update({
          completed_at: new Date().toISOString(),
          score: score
        })
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (error) throw error;

      const message = score >= 60 
        ? "Congratulations! Course completed and certificate generated!"
        : "Course completed! You need 60% or higher to earn a certificate.";

      toast({
        title: "Course Completed!",
        description: message,
      });

      // Refresh enrollments
      fetchCoursesAndEnrollments();
    } catch (error) {
      console.error('Error completing course:', error);
      toast({
        title: "Error",
        description: "Failed to complete course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  const getEnrollment = (courseId: string) => {
    return enrollments.find(enrollment => enrollment.course_id === courseId);
  };

  const handleExternalCourseClick = async (externalCourse: ExternalCourse) => {
    if (!user) return;

    try {
      // Track the click
      await supabase.from('course_purchases').insert({
        user_id: user.id,
        external_course_id: externalCourse.id,
        gateway: 'udemy_redirect',
        status: 'redirected',
        amount: 0,
      });

      // Open Udemy link
      window.open(externalCourse.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking external course click:', error);
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
      <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Education Hub</h1>
        <p className="text-primary-foreground/90">
          Expand your knowledge with our comprehensive courses designed for health professionals and enthusiasts.
        </p>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Enrollments</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter(e => e.completed_at).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Tabs */}
      <Tabs defaultValue="internal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="internal">Internal Courses ({courses.length})</TabsTrigger>
          <TabsTrigger value="external">External Courses ({externalCourses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="space-y-4">
          <h2 className="text-2xl font-bold">AimWell Courses</h2>
        {courses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
              <p className="text-muted-foreground">
                Check back later for new courses or contact an administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const enrolled = isEnrolled(course.id);
              const enrollment = getEnrollment(course.id);
              const completed = enrollment?.completed_at;

              return (
                <Card key={course.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      {course.is_premium && (
                        <Badge variant="secondary" className="ml-2">Premium</Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-1" />
                        {course.instructor_name}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration_hours} hours
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-4 w-4 mr-1" />
                        Pass score: {course.pass_score}%
                      </div>

                      {enrolled && enrollment?.score && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Your Score</span>
                            <span>{enrollment.score}%</span>
                          </div>
                          <Progress value={enrollment.score} className="h-2" />
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <Button 
                        onClick={() => navigate(`/course/${course.slug}`)}
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        View Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        </TabsContent>

        <TabsContent value="external" className="space-y-4">
          <h2 className="text-2xl font-bold">Udemy Courses</h2>
          
          {externalCourses.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No External Courses</h3>
                <p className="text-muted-foreground">
                  Check back later for Udemy course recommendations.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {externalCourses.map((course) => (
                <Card key={course.id} className="flex flex-col border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                      <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Udemy
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-1" />
                        {course.instructor_name}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-4 w-4 mr-1" />
                        {course.price_text}
                      </div>
                      {course.thumbnail_url && (
                        <img 
                          src={course.thumbnail_url} 
                          alt={course.title}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      )}
                    </div>

                    <div className="mt-4">
                      <Button 
                        onClick={() => handleExternalCourseClick(course)}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open on Udemy
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        Supports AimWell
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Education;