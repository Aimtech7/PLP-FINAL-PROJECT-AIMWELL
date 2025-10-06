-- Add external courses table for Udemy links
CREATE TABLE IF NOT EXISTS public.external_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT DEFAULT 'udemy',
  provider_course_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  affiliate_tag TEXT,
  price_text TEXT,
  thumbnail_url TEXT,
  instructor_name TEXT,
  notes TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add course resources table
CREATE TABLE IF NOT EXISTS public.course_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  external_course_id UUID REFERENCES public.external_courses(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'video', 'pdf', 'link', 'udemy'
  label TEXT NOT NULL,
  url TEXT,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT check_course_reference CHECK (
    (course_id IS NOT NULL AND external_course_id IS NULL) OR
    (course_id IS NULL AND external_course_id IS NOT NULL)
  )
);

-- Add course purchases table
CREATE TABLE IF NOT EXISTS public.course_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  external_course_id UUID REFERENCES public.external_courses(id) ON DELETE SET NULL,
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'KES',
  gateway TEXT, -- 'mpesa', 'stripe', 'udemy_redirect'
  gateway_payload JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT check_purchase_course CHECK (
    course_id IS NOT NULL OR external_course_id IS NOT NULL
  )
);

-- Add external course support to certificates
ALTER TABLE public.certificates 
ADD COLUMN IF NOT EXISTS external_course_id UUID REFERENCES public.external_courses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS proof_url TEXT,
ADD COLUMN IF NOT EXISTS verified_by UUID,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Update courses table to add missing fields
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_external_courses_source ON public.external_courses(source);
CREATE INDEX IF NOT EXISTS idx_course_resources_course_id ON public.course_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_external_course_id ON public.course_resources(external_course_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_user_id ON public.course_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_external_course_id ON public.certificates(external_course_id);

-- Enable RLS on new tables
ALTER TABLE public.external_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for external_courses
CREATE POLICY "External courses are viewable by everyone"
  ON public.external_courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage external courses"
  ON public.external_courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS policies for course_resources
CREATE POLICY "Course resources are viewable by everyone"
  ON public.course_resources FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage course resources"
  ON public.course_resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS policies for course_purchases
CREATE POLICY "Users can view their own purchases"
  ON public.course_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
  ON public.course_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases"
  ON public.course_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Add trigger for external_courses updated_at
CREATE TRIGGER update_external_courses_updated_at
  BEFORE UPDATE ON public.external_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data for external courses
INSERT INTO public.external_courses (title, description, url, price_text, thumbnail_url, instructor_name, notes, source)
VALUES 
  (
    'Complete Web Development Bootcamp',
    'Become a full-stack web developer with just one course. HTML, CSS, Javascript, Node, React, MongoDB and more!',
    'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
    'Paid - $84.99',
    'https://img-c.udemycdn.com/course/480x270/1565838_e54e_16.jpg',
    'Dr. Angela Yu',
    'Popular Udemy course with 400k+ students',
    'udemy'
  ),
  (
    'Python for Data Science and Machine Learning Bootcamp',
    'Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, Machine Learning, Tensorflow and more!',
    'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/',
    'Paid - $94.99',
    'https://img-c.udemycdn.com/course/480x270/903744_8eb2.jpg',
    'Jose Portilla',
    'Comprehensive Python data science course',
    'udemy'
  ),
  (
    'AWS Certified Solutions Architect',
    'Pass the AWS Certified Solutions Architect Associate Exam. Complete Amazon Web Services cloud training!',
    'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/',
    'Paid - $89.99',
    'https://img-c.udemycdn.com/course/480x270/362070_d193_7.jpg',
    'Stephane Maarek',
    'Top-rated AWS certification prep',
    'udemy'
  )
ON CONFLICT DO NOTHING;