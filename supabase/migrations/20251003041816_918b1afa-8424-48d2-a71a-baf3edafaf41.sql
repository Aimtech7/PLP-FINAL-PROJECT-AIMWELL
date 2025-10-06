-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Admins can view all course enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Admins can view all certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can view all progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Admins can view all attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Admins can view all health plans" ON public.health_plans;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.course_purchases;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins can manage course resources" ON public.course_resources;
DROP POLICY IF EXISTS "Admins can manage external courses" ON public.external_courses;

-- Create a security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can view all forum posts"
ON public.forum_posts FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can view all course enrollments"
ON public.course_enrollments FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can view all certificates"
ON public.certificates FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can view all progress"
ON public.lesson_progress FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can view all attempts"
ON public.quiz_attempts FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can view all health plans"
ON public.health_plans FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can view all feedback"
ON public.feedback FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can view all purchases"
ON public.course_purchases FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can manage lessons"
ON public.lessons FOR ALL
USING (is_admin());

CREATE POLICY "Admins can manage quizzes"
ON public.quizzes FOR ALL
USING (is_admin());

CREATE POLICY "Admins can manage quiz questions"
ON public.quiz_questions FOR ALL
USING (is_admin());

CREATE POLICY "Admins can manage course resources"
ON public.course_resources FOR ALL
USING (is_admin());

CREATE POLICY "Admins can manage external courses"
ON public.external_courses FOR ALL
USING (is_admin());