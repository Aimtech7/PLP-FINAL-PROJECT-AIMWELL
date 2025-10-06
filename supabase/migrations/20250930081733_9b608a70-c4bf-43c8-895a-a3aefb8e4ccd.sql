-- Create enums for user roles and subscription types
CREATE TYPE user_role AS ENUM ('student', 'admin', 'demo');
CREATE TYPE subscription_type AS ENUM ('free', 'premium', 'health_only');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');

-- Create certificates table for auto-generated certificates
CREATE TABLE public.certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    certificate_url TEXT,
    unique_code TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    verified BOOLEAN NOT NULL DEFAULT false,
    student_name TEXT NOT NULL,
    course_title TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE,
    CONSTRAINT certificates_score_check CHECK (score >= 60)
);

-- Create health records table
CREATE TABLE public.health_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    symptoms TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    nutrition_plan JSONB,
    subscription_valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT health_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'KES',
    method TEXT,
    transaction_id TEXT UNIQUE,
    status payment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create feedback table
CREATE TABLE public.feedback (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create community posts table
CREATE TABLE public.community_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT community_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add new columns to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status subscription_type DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create unique constraints
ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_number_unique UNIQUE (phone_number);

-- Enable RLS on new tables
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for certificates (readable by owner and admin, and for verification)
CREATE POLICY "Users can view their own certificates" ON public.certificates
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all certificates" ON public.certificates
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- RLS Policies for health records
CREATE POLICY "Users can view their own health records" ON public.health_records
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health records" ON public.health_records
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health records" ON public.health_records
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON public.payments
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for feedback
CREATE POLICY "Users can view their own feedback" ON public.feedback
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback" ON public.feedback
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" ON public.feedback
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = true
    )
);

-- RLS Policies for community posts
CREATE POLICY "Community posts are viewable by everyone" ON public.community_posts
FOR SELECT USING (true);

CREATE POLICY "Users can create community posts" ON public.community_posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.community_posts
FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_unique_code ON public.certificates(unique_code);
CREATE INDEX idx_certificates_course_id ON public.certificates(course_id);
CREATE INDEX idx_health_records_user_id ON public.health_records(user_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_community_posts_user_id ON public.community_posts(user_id);

-- Create function to automatically generate certificates
CREATE OR REPLACE FUNCTION public.generate_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_profile RECORD;
    course_info RECORD;
    certificate_id UUID;
BEGIN
    -- Only generate certificate if score >= 60 and completed_at is set
    IF NEW.score >= 60 AND NEW.completed_at IS NOT NULL AND (OLD.score IS NULL OR OLD.score < 60 OR OLD.completed_at IS NULL) THEN
        -- Get user profile information
        SELECT first_name, last_name INTO user_profile
        FROM public.profiles
        WHERE id = NEW.user_id;
        
        -- Get course information
        SELECT title INTO course_info
        FROM public.courses
        WHERE id = NEW.course_id;
        
        -- Insert certificate record
        INSERT INTO public.certificates (
            user_id,
            course_id,
            student_name,
            course_title,
            score
        ) VALUES (
            NEW.user_id,
            NEW.course_id,
            COALESCE(user_profile.first_name || ' ' || user_profile.last_name, 'Student'),
            course_info.title,
            NEW.score
        ) RETURNING id INTO certificate_id;
        
        -- Note: PDF generation will be handled by an edge function
        -- that watches for new certificate records
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic certificate generation
CREATE TRIGGER trigger_generate_certificate
    AFTER UPDATE ON public.course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_certificate();

-- Update existing admin status function to handle role updates
CREATE OR REPLACE FUNCTION public.set_admin_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the new user's email is the admin email
    IF NEW.email = 'austinemakwaka254@gmail.com' THEN
        -- Update the profile to set admin status and role
        UPDATE public.profiles 
        SET is_admin = true, 
            role = 'admin',
            subscription_status = 'premium',
            full_name = 'Austine Makwaka'
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create triggers for updated_at columns
CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at
    BEFORE UPDATE ON public.health_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();