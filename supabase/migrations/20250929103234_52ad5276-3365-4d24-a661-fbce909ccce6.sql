-- Create some sample enrollments and health plans for demo purposes
-- This will help populate the admin dashboard with sample data

-- Insert sample course enrollments for existing users (if any)
-- Note: This assumes users will sign up first, then we can manually add sample data

-- Insert sample forum posts to populate community section
INSERT INTO public.forum_posts (forum_id, user_id, title, content) 
SELECT 
  f.id as forum_id,
  p.id as user_id,
  CASE 
    WHEN f.category = 'general' THEN 'Welcome to AIMWELL!'
    WHEN f.category = 'fitness' THEN 'My First Week Workout Results'
    WHEN f.category = 'nutrition' THEN 'Healthy Meal Prep Tips'
    WHEN f.category = 'mental_health' THEN 'Meditation Changed My Life'
    ELSE 'Health Journey Update'
  END as title,
  CASE 
    WHEN f.category = 'general' THEN 'Hi everyone! I''m excited to join this health community. Looking forward to learning from all of you and sharing my journey.'
    WHEN f.category = 'fitness' THEN 'Just completed my first week of the fitness program. Feeling sore but motivated! The workouts are challenging but doable.'
    WHEN f.category = 'nutrition' THEN 'I''ve been meal prepping for 2 months now and it''s been a game changer. Here are some tips that work for me...'
    WHEN f.category = 'mental_health' THEN 'I started meditating 10 minutes daily and the difference in my stress levels is incredible. Highly recommend it!'
    ELSE 'Wanted to share a quick update on my health journey. Small steps, big progress!'
  END as content
FROM public.forums f
CROSS JOIN (
  SELECT id FROM public.profiles 
  WHERE is_admin = true 
  LIMIT 1
) p
WHERE f.id IS NOT NULL;