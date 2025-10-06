-- Insert admin user profile (will be linked when they sign up)
-- Note: The user will need to sign up with this email first, then this will update their profile to admin

-- First, let's create a function to set admin status after user signup
CREATE OR REPLACE FUNCTION public.set_admin_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new user's email is the admin email
  IF NEW.email = 'austinemakwaka254@gmail.com' THEN
    -- Update the profile to set admin status
    UPDATE public.profiles 
    SET is_admin = true 
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set admin status on signup
DROP TRIGGER IF EXISTS on_auth_user_admin_check ON auth.users;
CREATE TRIGGER on_auth_user_admin_check
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.set_admin_status();

-- Insert some demo course data
INSERT INTO public.courses (title, description, instructor_name, duration_hours, is_premium, pass_score) VALUES
('Introduction to Nutrition', 'Learn the fundamentals of nutrition and healthy eating habits. This comprehensive course covers macronutrients, micronutrients, and meal planning basics.', 'Dr. Sarah Johnson', 6, false, 70),
('Advanced Fitness Training', 'Take your fitness to the next level with advanced training techniques, strength building, and performance optimization strategies.', 'Mike Rodriguez', 12, true, 80),
('Mental Health & Wellness', 'Discover strategies for managing stress, improving mental health, and building resilience in daily life through evidence-based approaches.', 'Dr. Emily Chen', 8, false, 75),
('Preventive Healthcare', 'Learn about preventive measures, early detection strategies, and lifestyle modifications to maintain optimal health throughout life.', 'Dr. Michael Thompson', 10, true, 75),
('Yoga & Mindfulness', 'Integrate mind-body practices into your wellness routine with guided yoga sessions and mindfulness meditation techniques.', 'Lisa Martinez', 4, false, 65);

-- Insert some demo forum categories
INSERT INTO public.forums (title, description, category) VALUES
('General Health Discussions', 'Share and discuss general health topics, tips, and experiences with the community.', 'general'),
('Fitness & Exercise', 'Connect with fellow fitness enthusiasts, share workout routines, and get motivation.', 'fitness'),
('Nutrition & Diet', 'Discuss healthy eating, share recipes, and get nutritional advice from peers.', 'nutrition'),
('Mental Health Support', 'A supportive space for mental health discussions, coping strategies, and peer support.', 'mental_health'),
('Success Stories', 'Share your health and wellness journey successes and inspire others.', 'motivation');

-- Create RLS policy for admin access to view all data
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can view all health plans" 
ON public.health_plans 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can view all course enrollments" 
ON public.course_enrollments 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can view all forum posts" 
ON public.forum_posts 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);