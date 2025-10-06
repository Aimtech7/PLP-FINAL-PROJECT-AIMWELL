import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, CheckCircle, XCircle, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  video_url: string;
}

interface Quiz {
  id: string;
  title: string;
  pass_percentage: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  order_index: number;
}

const LessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (lessonId) {
      fetchLessonData();
    }
  }, [lessonId]);

  const fetchLessonData = async () => {
    try {
      // Fetch lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);

      // Fetch quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .single();

      if (!quizError && quizData) {
        setQuiz(quizData);

        // Fetch quiz questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('order_index');

        if (!questionsError) {
          setQuestions(questionsData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching lesson data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lesson data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleSubmitQuiz = async () => {
    if (!user) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to submit the quiz.',
        variant: 'destructive',
      });
      return;
    }

    // Calculate score
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });

    const percentage = (correctCount / questions.length) * 100;
    setScore(percentage);
    setShowResults(true);

    // Save quiz attempt
    try {
      const { error } = await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        quiz_id: quiz!.id,
        lesson_id: lessonId!,
        score: correctCount,
        total_questions: questions.length,
        answers: answers,
      });

      if (error) throw error;

      // Mark lesson as completed if passed
      if (percentage >= (quiz?.pass_percentage || 60)) {
        await supabase.from('lesson_progress').upsert({
          user_id: user.id,
          lesson_id: lessonId!,
          completed: true,
          completed_at: new Date().toISOString(),
        });

        toast({
          title: 'Congratulations! 🎉',
          description: `You passed with ${percentage.toFixed(0)}%!`,
        });
      } else {
        toast({
          title: 'Quiz Complete',
          description: `You scored ${percentage.toFixed(0)}%. Need ${quiz?.pass_percentage}% to pass. Try again!`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      toast({
        title: 'Error',
        description: 'Failed to save quiz results.',
        variant: 'destructive',
      });
    }
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Lesson not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Course
      </Button>

      {/* Lesson Content */}
      {!showQuiz ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{lesson.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video */}
              {lesson.video_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(lesson.video_url)}
                    title={lesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* Lesson Notes */}
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown>{lesson.content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {quiz && questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ready for the Quiz?</CardTitle>
                <CardDescription>
                  Test your knowledge with {questions.length} questions. You need {quiz.pass_percentage}% to pass.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowQuiz(true)} className="w-full">
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Quiz Section */
        <Card>
          <CardHeader>
            <CardTitle>{quiz?.title}</CardTitle>
            <CardDescription>
              {showResults ? `You scored ${score.toFixed(0)}%` : `${questions.length} questions`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!showResults ? (
              <>
                <Progress value={(Object.keys(answers).length / questions.length) * 100} />
                {questions.map((q, index) => (
                  <div key={q.id} className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-medium">
                      {index + 1}. {q.question}
                    </h4>
                    <RadioGroup
                      value={answers[q.id]}
                      onValueChange={(value) => setAnswers({ ...answers, [q.id]: value })}
                    >
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${q.id}-${option}`} />
                          <Label htmlFor={`${q.id}-${option}`} className="cursor-pointer">
                            {option}. {q[`option_${option.toLowerCase()}` as keyof QuizQuestion]}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button onClick={() => setShowQuiz(false)} variant="outline" className="flex-1">
                    Back to Lesson
                  </Button>
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(answers).length !== questions.length}
                    className="flex-1"
                  >
                    Submit Quiz
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="text-center p-6 border rounded-lg">
                  {score >= (quiz?.pass_percentage || 60) ? (
                    <div className="space-y-3">
                      <Award className="h-16 w-16 mx-auto text-primary" />
                      <h3 className="text-2xl font-bold">Congratulations!</h3>
                      <p className="text-muted-foreground">
                        You passed with {score.toFixed(0)}%
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <XCircle className="h-16 w-16 mx-auto text-destructive" />
                      <h3 className="text-2xl font-bold">Keep Trying!</h3>
                      <p className="text-muted-foreground">
                        You scored {score.toFixed(0)}%. Need {quiz?.pass_percentage}% to pass.
                      </p>
                    </div>
                  )}
                </div>

                {/* Show answers */}
                {questions.map((q, index) => {
                  const userAnswer = answers[q.id];
                  const isCorrect = userAnswer === q.correct_answer;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 border rounded-lg ${
                        isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">
                            {index + 1}. {q.question}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Your answer: {userAnswer} - {q[`option_${userAnswer?.toLowerCase()}` as keyof QuizQuestion]}
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                              Correct answer: {q.correct_answer} - {q[`option_${q.correct_answer.toLowerCase()}` as keyof QuizQuestion]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex gap-3">
                  <Button onClick={() => navigate(-1)} variant="outline" className="flex-1">
                    Back to Course
                  </Button>
                  <Button onClick={handleRetakeQuiz} className="flex-1">
                    Retake Quiz
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LessonView;
