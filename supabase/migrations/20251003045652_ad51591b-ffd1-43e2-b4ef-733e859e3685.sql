-- ============================================
-- CRITICAL SECURITY FIX: Proper Role-Based Access Control
-- ============================================

-- 1. Create app_role enum for role types
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'moderator', 'user');

-- 2. Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create audit log table for sensitive data access
CREATE TABLE public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer functions to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_higher(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin')
  )
$$;

-- 5. Function to log admin access to sensitive data
CREATE OR REPLACE FUNCTION public.log_admin_access(
  _action TEXT,
  _table_name TEXT,
  _record_id UUID,
  _details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (admin_id, action, table_name, record_id, details)
  VALUES (auth.uid(), _action, _table_name, _record_id, _details);
END;
$$;

-- 6. RLS Policies for user_roles table
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- 7. RLS Policies for audit_log
CREATE POLICY "Super admins can view audit logs"
ON public.admin_audit_log FOR SELECT
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "System can insert audit logs"
ON public.admin_audit_log FOR INSERT
WITH CHECK (true);

-- 8. Grant the super admin role to austinemakwaka254@gmail.com
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID for the super admin email
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'austinemakwaka254@gmail.com';
  
  -- Only insert if user exists
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, notes)
    VALUES (admin_user_id, 'super_admin', 'Initial super admin - full system access')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- 9. Update existing is_admin function to use new role system
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin_or_higher(auth.uid())
$$;

-- 10. Add new RLS policies for health_records with audit logging
DROP POLICY IF EXISTS "Users can view their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users can create their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users can update their own health records" ON public.health_records;

CREATE POLICY "Users can view their own health records"
ON public.health_records FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health records"
ON public.health_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health records"
ON public.health_records FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all health records"
ON public.health_records FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- 11. Add RLS policies for course_purchases to protect payment data
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.course_purchases;

CREATE POLICY "Super admins can view all purchases"
ON public.course_purchases FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- 12. Update other admin policies to use new role system
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can view all course enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Admins can manage course resources" ON public.course_resources;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can view all progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Admins can view all attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Admins can manage quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can view all health plans" ON public.health_plans;
DROP POLICY IF EXISTS "Admins can view all forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage external courses" ON public.external_courses;

-- Recreate with new role system
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can view all certificates"
ON public.certificates FOR SELECT
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can view all course enrollments"
ON public.course_enrollments FOR SELECT
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can manage course resources"
ON public.course_resources FOR ALL
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can manage lessons"
ON public.lessons FOR ALL
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can view all progress"
ON public.lesson_progress FOR SELECT
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can view all attempts"
ON public.quiz_attempts FOR SELECT
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can manage quiz questions"
ON public.quiz_questions FOR ALL
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can manage quizzes"
ON public.quizzes FOR ALL
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can view all health plans"
ON public.health_plans FOR SELECT
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can view all forum posts"
ON public.forum_posts FOR SELECT
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can view all feedback"
ON public.feedback FOR SELECT
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions FOR SELECT
USING (public.is_admin_or_higher(auth.uid()));

CREATE POLICY "Admins can manage external courses"
ON public.external_courses FOR ALL
USING (public.is_admin_or_higher(auth.uid()));

-- 13. Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX idx_audit_log_created_at ON public.admin_audit_log(created_at);
CREATE INDEX idx_audit_log_table_name ON public.admin_audit_log(table_name);