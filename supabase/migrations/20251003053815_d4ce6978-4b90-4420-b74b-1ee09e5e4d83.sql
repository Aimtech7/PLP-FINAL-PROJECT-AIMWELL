-- Add health and personal information fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS height_cm INTEGER,
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS medical_history TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS chronic_conditions TEXT,
ADD COLUMN IF NOT EXISTS current_medications TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS blood_type TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.height_cm IS 'User height in centimeters';
COMMENT ON COLUMN public.profiles.weight_kg IS 'User weight in kilograms';
COMMENT ON COLUMN public.profiles.medical_history IS 'Past medical history and conditions';
COMMENT ON COLUMN public.profiles.allergies IS 'Known allergies';
COMMENT ON COLUMN public.profiles.chronic_conditions IS 'Ongoing chronic health conditions';
COMMENT ON COLUMN public.profiles.current_medications IS 'Currently prescribed medications';
COMMENT ON COLUMN public.profiles.location IS 'User location/address';
COMMENT ON COLUMN public.profiles.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN public.profiles.gender IS 'User gender';
COMMENT ON COLUMN public.profiles.blood_type IS 'User blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)';
COMMENT ON COLUMN public.profiles.emergency_contact IS 'Emergency contact name';
COMMENT ON COLUMN public.profiles.emergency_contact_phone IS 'Emergency contact phone number';