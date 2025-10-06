-- Create storage bucket for certificates
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true);

-- Create storage policies for certificates
CREATE POLICY "Certificate PDFs are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'certificates');

CREATE POLICY "System can upload certificate PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'certificates');

-- Insert seed courses data (updating existing courses)
UPDATE public.courses SET 
    title = 'Introduction to Python Programming',
    description = 'Learn the fundamentals of Python programming language. Perfect for beginners with no prior coding experience.',
    is_premium = false,
    instructor_name = 'Dr. Sarah Johnson',
    duration_hours = 8,
    pass_score = 60
WHERE title = 'Introduction to Nutrition';

UPDATE public.courses SET 
    title = 'Intermediate Web Development',
    description = 'Build dynamic websites using HTML, CSS, JavaScript, and modern frameworks. Intermediate level course.',
    is_premium = true,
    instructor_name = 'Mike Rodriguez',
    duration_hours = 15,
    pass_score = 70
WHERE title = 'Advanced Fitness Training';

UPDATE public.courses SET 
    title = 'Professional Cybersecurity',
    description = 'Comprehensive cybersecurity training covering network security, ethical hacking, and threat assessment.',
    is_premium = true,
    instructor_name = 'Dr. Emily Chen',
    duration_hours = 20,
    pass_score = 75
WHERE title = 'Mental Health & Wellness';

-- Insert additional seed data
INSERT INTO public.feedback (user_id, message, rating) 
SELECT id, 'Great platform! The courses are well-structured and easy to follow. Would love to see more free beginner content.', 4
FROM public.profiles 
WHERE is_admin = true
LIMIT 1;

INSERT INTO public.community_posts (user_id, title, content, tags)
SELECT id, 'Best Study Tips for Online Learning', 'After completing several courses, here are my top tips for effective online learning: 1. Set a dedicated study space, 2. Create a consistent schedule, 3. Take regular breaks, 4. Join study groups, 5. Practice what you learn immediately.', ARRAY['study', 'motivation', 'tips']
FROM public.profiles 
WHERE is_admin = true
LIMIT 1;

INSERT INTO public.community_posts (user_id, title, content, tags)
SELECT id, 'How I Passed My First Certification', 'Just got my Python programming certificate! The key was consistent practice and working on real projects. The auto-generated certificate feature is amazing!', ARRAY['certification', 'python', 'success']
FROM public.profiles 
WHERE is_admin = true
LIMIT 1;

-- Insert sample health record
INSERT INTO public.health_records (user_id, symptoms, diagnosis, treatment_plan, nutrition_plan, subscription_valid_until)
SELECT id, 'Mild fatigue, occasional headaches', 'Stress-related symptoms', 'Regular exercise, stress management techniques, adequate sleep', '{"daily_calories": 2000, "protein": "25%", "carbs": "45%", "fats": "30%", "water_intake": "2.5L", "meal_suggestions": ["Oatmeal with fruits", "Grilled chicken salad", "Salmon with vegetables"]}', NOW() + INTERVAL '30 days'
FROM public.profiles 
WHERE is_admin = true
LIMIT 1;

-- Insert sample payment record
INSERT INTO public.payments (user_id, amount, currency, method, transaction_id, status)
SELECT id, 1200.00, 'KES', 'M-Pesa', 'MP' || EXTRACT(epoch FROM NOW())::text, 'success'
FROM public.profiles 
WHERE is_admin = true
LIMIT 1;