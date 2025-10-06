-- Fix security warning: Set search_path for the admin status function
CREATE OR REPLACE FUNCTION public.set_admin_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;