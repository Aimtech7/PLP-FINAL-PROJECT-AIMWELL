# AIMWELL Demo Accounts

## Admin Account
- **Email**: `austinemakwaka254@gmail.com`
- **Role**: Admin (has access to admin dashboard and all statistics)
- **Features**: Can view all users, enrollments, health plans, and app statistics

## Demo User Accounts
You can create these demo accounts for testing:

1. **Demo User 1**
   - Email: `demo.user1@aimwell.com`
   - Password: `demo123!`
   - Name: John Smith

2. **Demo User 2**
   - Email: `demo.user2@aimwell.com`
   - Password: `demo123!`
   - Name: Sarah Johnson

3. **Demo User 3**
   - Email: `demo.user3@aimwell.com`
   - Password: `demo123!`
   - Name: Mike Wilson

## How to Create Demo Users

### Option 1: Manual Registration
1. Go to the `/auth` page
2. Sign up with the demo email addresses above
3. Use the password `demo123!` for all demo accounts

### Option 2: Using Demo Data Utility
You can use the demo data utility in `src/utils/demoData.ts`:

```typescript
import { createDemoUsers, generateSampleData } from '@/utils/demoData';

// Create all demo users
await createDemoUsers();

// Generate sample data for a specific user
await generateSampleData(userId);
```

## Features Available

### For Admin User (`austinemakwaka254@gmail.com`):
- ✅ Admin Dashboard with all statistics
- ✅ View all users and their activities
- ✅ Access to all app features
- ✅ AI Chat Assistant
- ✅ Health Plan Generation
- ✅ Course Management View

### For Demo Users:
- ✅ Personal Dashboard
- ✅ Course Enrollment and Viewing
- ✅ AI Health Plan Generation
- ✅ AI Chat Assistant
- ✅ Community Forums (when implemented)
- ✅ Personal Statistics

## Sample Data Included
- 5 Demo courses covering nutrition, fitness, mental health, preventive care, and yoga
- 5 Forum categories for community discussions
- Sample forum posts for demonstration
- AI-powered health plan generation
- Course enrollment system

## Admin Features
When logged in as admin, you can:
- View total user statistics
- See recent user registrations
- Monitor course enrollments
- Track health plan generation
- View community activity
- Access comprehensive analytics dashboard

The admin user automatically gets admin privileges upon signup due to the email-based trigger in the database.