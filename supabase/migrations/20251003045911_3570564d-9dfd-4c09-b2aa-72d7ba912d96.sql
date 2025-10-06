-- Helper function to grant role by email (for super admin use)
CREATE OR REPLACE FUNCTION public.grant_role_by_email(
  _email TEXT,
  _role public.app_role,
  _notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _result JSONB;
BEGIN
  -- Only super admins can use this function
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super administrators can grant roles';
  END IF;

  -- Find user by email from auth.users
  SELECT id INTO _user_id
  FROM auth.users
  WHERE email = _email;

  -- Check if user exists
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found with email: ' || _email
    );
  END IF;

  -- Insert the role
  INSERT INTO public.user_roles (user_id, role, granted_by, notes)
  VALUES (_user_id, _role, auth.uid(), _notes)
  ON CONFLICT (user_id, role) DO UPDATE
  SET granted_by = auth.uid(),
      granted_at = now(),
      notes = _notes;

  -- Log the action
  PERFORM public.log_admin_access(
    'GRANT_ROLE',
    'user_roles',
    _user_id,
    jsonb_build_object('role', _role, 'email', _email, 'notes', _notes)
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', _user_id,
    'role', _role,
    'message', 'Role granted successfully'
  );
END;
$$;

-- Helper function to revoke role
CREATE OR REPLACE FUNCTION public.revoke_role_by_id(
  _role_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role_record RECORD;
BEGIN
  -- Only super admins can use this function
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super administrators can revoke roles';
  END IF;

  -- Get role details before deleting
  SELECT * INTO _role_record
  FROM public.user_roles
  WHERE id = _role_id;

  -- Check if role exists
  IF _role_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Role not found'
    );
  END IF;

  -- Prevent revoking super_admin role
  IF _role_record.role = 'super_admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot revoke super_admin role'
    );
  END IF;

  -- Delete the role
  DELETE FROM public.user_roles WHERE id = _role_id;

  -- Log the action
  PERFORM public.log_admin_access(
    'REVOKE_ROLE',
    'user_roles',
    _role_record.user_id,
    jsonb_build_object('role', _role_record.role, 'revoked_role_id', _role_id)
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Role revoked successfully'
  );
END;
$$;