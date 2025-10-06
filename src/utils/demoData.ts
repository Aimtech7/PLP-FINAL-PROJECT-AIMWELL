import { supabase } from '@/integrations/supabase/client';

export const DEMO_USERS = [
  {
    email: 'demo.user1@aimwell.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1234567890'
  },
  {
    email: 'demo.user2@aimwell.com', 
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+1234567891'
  },
  {
    email: 'demo.user3@aimwell.com',
    firstName: 'Mike',
    lastName: 'Wilson',
    phone: '+1234567892'
  }
];

export const createDemoUsers = async () => {
  console.log('Creating demo users...');
  
  for (const user of DEMO_USERS) {
    try {
      const { error } = await supabase.auth.signUp({
        email: user.email,
        password: 'demo123!', // Demo password
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: user.firstName,
            last_name: user.lastName,
            phone: user.phone,
          }
        }
      });
      
      if (error) {
        console.error(`Error creating demo user ${user.email}:`, error);
      } else {
        console.log(`Demo user created: ${user.email}`);
      }
    } catch (error) {
      console.error(`Failed to create demo user ${user.email}:`, error);
    }
  }
};

export const generateSampleData = async (userId: string) => {
  try {
    // Generate sample course enrollments
    const { data: courses } = await supabase.from('courses').select('id').limit(2);
    
    if (courses && courses.length > 0) {
      for (const course of courses) {
        await supabase.from('course_enrollments').insert({
          user_id: userId,
          course_id: course.id,
          completed_at: Math.random() > 0.5 ? new Date().toISOString() : null,
          score: Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 70 : null,
        });
      }
    }

    // Generate sample health plan
    await supabase.functions.invoke('ai-health-planner', {
      body: {
        userId: userId,
        planType: 'fitness',
        goals: 'Get fit and healthy, lose weight',
        currentHealth: 'Beginner fitness level, mostly sedentary',
        preferences: 'Prefers home workouts, no equipment',
        medicalConditions: 'None',
        fitnessLevel: 'beginner'
      }
    });

    console.log(`Sample data generated for user: ${userId}`);
  } catch (error) {
    console.error('Error generating sample data:', error);
  }
};

// Helper function to display demo user credentials
export const getDemoCredentials = () => {
  return {
    admin: {
      email: 'austinemakwaka254@gmail.com',
      note: 'Admin user - has access to admin dashboard and all statistics'
    },
    demoUsers: DEMO_USERS.map(user => ({
      email: user.email,
      password: 'demo123!',
      name: `${user.firstName} ${user.lastName}`
    }))
  };
};