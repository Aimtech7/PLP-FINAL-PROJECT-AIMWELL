-- Create lessons table
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text NOT NULL,
  video_url text,
  order_index integer NOT NULL,
  duration_minutes integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  pass_percentage integer DEFAULT 60,
  created_at timestamptz DEFAULT now()
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create lesson_progress table
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create quiz_attempts table
CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  percentage numeric GENERATED ALWAYS AS ((score::numeric / total_questions::numeric) * 100) STORED,
  passed boolean GENERATED ALWAYS AS ((score::numeric / total_questions::numeric) >= 0.6) STORED,
  answers jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons
CREATE POLICY "Lessons are viewable by everyone"
  ON public.lessons FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage lessons"
  ON public.lessons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- RLS Policies for quizzes
CREATE POLICY "Quizzes are viewable by everyone"
  ON public.quizzes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage quizzes"
  ON public.quizzes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- RLS Policies for quiz_questions
CREATE POLICY "Quiz questions are viewable by everyone"
  ON public.quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage quiz questions"
  ON public.quiz_questions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- RLS Policies for lesson_progress
CREATE POLICY "Users can view their own progress"
  ON public.lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON public.lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON public.lesson_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts"
  ON public.quiz_attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Create indexes
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_order ON public.lessons(course_id, order_index);
CREATE INDEX idx_quizzes_lesson_id ON public.quizzes(lesson_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);
CREATE INDEX idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);

-- Trigger for updated_at
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint to slug if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_slug_key'
  ) THEN
    ALTER TABLE public.courses ADD CONSTRAINT courses_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Insert HTML & CSS Foundations course
INSERT INTO public.courses (title, description, instructor_name, duration_hours, price, category, is_premium, is_published, slug)
VALUES (
  'HTML & CSS Foundations',
  'Master the fundamentals of web development with HTML and CSS. Build responsive websites from scratch with hands-on lessons and practical quizzes.',
  'AimWell Academy',
  20,
  0,
  'beginner',
  false,
  true,
  'html-css-foundations'
) ON CONFLICT (slug) DO NOTHING;