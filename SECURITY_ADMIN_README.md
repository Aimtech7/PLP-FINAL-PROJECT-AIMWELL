# AimWell Security & Admin System

## 🔐 Security Architecture

AimWell implements enterprise-grade security with **role-based access control (RBAC)** and comprehensive audit logging.

### Security Features Implemented

✅ **Separate Role Table** - Roles stored in `user_roles` table (not profiles) to prevent privilege escalation
✅ **Row-Level Security (RLS)** - All tables protected with proper RLS policies  
✅ **Security Definer Functions** - Server-side role checks prevent RLS recursion issues
✅ **Audit Logging** - All admin actions automatically logged to `admin_audit_log`
✅ **Super Admin System** - Only super admins can grant/revoke admin privileges
✅ **Medical Data Protection** - Health records have strict access controls with audit trails

---

## 👑 Super Admin Account

**Email:** `austinemakwaka254@gmail.com`  
**Role:** Super Admin (Highest privilege level)

### Super Admin Capabilities:
- ✅ Grant admin and moderator roles to other users
- ✅ Revoke admin and moderator roles (cannot revoke super_admin)
- ✅ View all application data across all tables
- ✅ Access sensitive medical records (all access is logged)
- ✅ View complete audit logs of all admin actions
- ✅ Manage courses, lessons, and all content

---

## 🎭 Role Hierarchy

### 1. Super Admin (`super_admin`)
- **Access Level:** Full system access
- **Can Grant Roles:** Yes (admin, moderator)
- **Can Be Revoked:** No (protected)
- **View All Data:** Yes
- **Audit Log Access:** Yes

### 2. Admin (`admin`)
- **Access Level:** Administrative features
- **Can Grant Roles:** No
- **Can Be Revoked:** Yes (by super admin only)
- **View All Data:** Yes (except cannot grant roles)
- **Audit Log Access:** No

### 3. Moderator (`moderator`)
- **Access Level:** Content moderation
- **Can Grant Roles:** No
- **Can Be Revoked:** Yes (by super admin only)
- **View All Data:** Limited (based on policies)
- **Audit Log Access:** No

### 4. User (`user`)
- **Access Level:** Standard user features
- **Can Grant Roles:** No
- **View All Data:** Only their own data

---

## 🛡️ Security Tables

### `user_roles` Table
Stores all role assignments separately from user profiles for maximum security.

**Columns:**
- `id` - UUID primary key
- `user_id` - References auth.users (NOT profiles)
- `role` - Enum: super_admin | admin | moderator | user
- `granted_by` - UUID of admin who granted the role
- `granted_at` - Timestamp when role was granted
- `notes` - Optional notes about why role was granted

### `admin_audit_log` Table
Automatically logs all administrative actions.

**Columns:**
- `id` - UUID primary key
- `admin_id` - UUID of admin performing action
- `action` - Type of action (GRANT_ROLE, REVOKE_ROLE, VIEW_HEALTH_RECORD, etc.)
- `table_name` - Which table was accessed
- `record_id` - UUID of specific record accessed
- `details` - JSONB with additional context
- `created_at` - Timestamp of action

---

## 📋 How to Manage Admins

### Access the Admin Management Panel

1. **Login** as super admin (`austinemakwaka254@gmail.com`)
2. Navigate to **"Manage Admins"** in the sidebar (only visible to super admin)
3. Use the interface to:
   - Grant admin/moderator roles by email
   - View all current admins and moderators
   - Revoke roles (except super_admin)
   - View audit logs of all admin actions

### Grant Admin Role via UI

1. Go to `/admin/manage`
2. Enter user's **email address**
3. Select role: **Admin** or **Moderator**
4. Add optional notes (e.g., "Granted for content management")
5. Click **"Grant Role"**

**Note:** The user must have an account first (must have signed up)

### Grant Admin Role via SQL (Alternative)

If you prefer using SQL directly:

```sql
-- Grant admin role to user by email
SELECT public.grant_role_by_email(
  'user@example.com',  -- User's email
  'admin',             -- Role: admin or moderator
  'Reason for granting role'  -- Optional notes
);
```

### Revoke Admin Role

Via UI:
1. Go to `/admin/manage`
2. Find the user in "Current Administrators" list
3. Click the trash icon
4. Confirm revocation

**Protected:** Cannot revoke `super_admin` roles

---

## 🔍 Audit Logging

All administrative actions are automatically logged. View logs in:
- **UI:** `/admin/manage` → "Admin Activity Audit Log" section
- **Database:** Query `admin_audit_log` table

### What Gets Logged:
- ✅ Role grants/revocations
- ✅ Access to sensitive health records
- ✅ Access to payment data
- ✅ Any admin viewing of user data

### Sample Audit Query:
```sql
-- View recent admin actions
SELECT 
  a.created_at,
  p.first_name || ' ' || p.last_name as admin_name,
  a.action,
  a.table_name,
  a.details
FROM admin_audit_log a
LEFT JOIN profiles p ON a.admin_id = p.id
ORDER BY a.created_at DESC
LIMIT 50;
```

---

## 🚨 Security Best Practices

### ✅ DO:
- Grant admin roles only to trusted individuals
- Add notes when granting roles (for accountability)
- Review audit logs regularly
- Use the principle of least privilege (prefer moderator over admin when possible)
- Revoke admin access immediately when no longer needed

### ❌ DON'T:
- Share super admin credentials
- Grant super_admin role to anyone else (only one should exist)
- Store role information in `profiles` table (always use `user_roles`)
- Bypass RLS policies with service role keys in client code
- Log sensitive user data in audit logs (keep it minimal)

---

## 🔧 Technical Implementation

### Security Definer Functions

All role checks use **SECURITY DEFINER** functions to avoid RLS recursion:

```sql
-- Example: Check if user is admin
SELECT public.is_admin_or_higher(auth.uid());

-- Example: Check if user is super admin
SELECT public.is_super_admin(auth.uid());

-- Example: Check specific role
SELECT public.has_role(auth.uid(), 'admin');
```

### RLS Policy Pattern

All admin-restricted tables use this pattern:

```sql
-- Users can view their own data
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all data
CREATE POLICY "Admins can view all data"
ON table_name FOR SELECT
USING (public.is_admin_or_higher(auth.uid()));
```

### Protected Tables

These tables have enhanced security:
- ✅ `health_records` - Medical data (super admin access logged)
- ✅ `course_purchases` - Payment gateway data (super admin only)
- ✅ `user_roles` - Role assignments (super admin only)
- ✅ `admin_audit_log` - Audit trail (super admin view only)

---

## 📞 Support & Questions

For security concerns or questions about the admin system:
- Email: austinemakwaka254@gmail.com
- Review audit logs for any suspicious activity
- Check Supabase dashboard for real-time user activity

---

**Last Updated:** October 3, 2025  
**Security Version:** 2.0  
**Compliance:** HIPAA-ready (for health data protection)
