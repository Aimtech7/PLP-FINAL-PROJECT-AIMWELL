import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, PlayCircle, CheckCircle, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  video_url: string;
  order_index: number;
  duration_minutes: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  thumbnail_url?: string;
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCourseData();
    }
  }, [slug]);

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseData.id)
        .order('order_index');

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Fetch user progress if logged in
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('lesson_progress')
          .select('lesson_id, completed')
          .eq('user_id', user.id)
          .in('lesson_id', lessonsData?.map(l => l.id) || []);

        if (!progressError) {
          setProgress(progressData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const calculateProgress = () => {
    if (lessons.length === 0) return 0;
    const completed = progress.filter(p => p.completed).length;
    return (completed / lessons.length) * 100;
  };

  const handleStartLesson = (lessonId: string) => {
    if (!user) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to start learning.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    navigate(`/lesson/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Course not found</p>
          <Button onClick={() => navigate('/education')} className="mt-4">
            Back to Courses
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/education')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Courses
      </Button>

      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
              <CardDescription className="text-lg">{course.description}</CardDescription>
              <div className="mt-4 flex items-center gap-4">
                <Badge variant="secondary">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {lessons.length} Lessons
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Instructor: {course.instructor_name}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        {user && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Your Progress</span>
                <span>{Math.round(calculateProgress())}%</span>
              </div>
              <Progress value={calculateProgress()} />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lessons List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Course Lessons</h2>
        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const completed = isLessonCompleted(lesson.id);
            const isLocked = index > 0 && !isLessonCompleted(lessons[index - 1].id) && user;

            return (
              <Card key={lesson.id} className={completed ? 'border-primary/50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                          completed ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          {completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{lesson.title}</CardTitle>
                          <CardDescription>{lesson.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{lesson.duration_minutes} min</Badge>
                      {isLocked ? (
                        <Button disabled variant="ghost" size="sm">
                          <Lock className="h-4 w-4 mr-2" />
                          Locked
                        </Button>
                      ) : (
                        <Button onClick={() => handleStartLesson(lesson.id)} size="sm">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {completed ? 'Review' : 'Start'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
