# AIMWELL Extended Schema Documentation

## 🏗️ **Complete Database Schema**

### **Tables Overview**

#### 1. **profiles** (Extended)
```sql
- id (UUID, primary key)
- first_name (text)
- last_name (text) 
- phone (text)
- full_name (text)                    -- NEW
- phone_number (text, unique)         -- NEW
- role (user_role enum)               -- NEW: student, admin, demo
- subscription_status (subscription_type) -- NEW: free, premium, health_only
- is_admin (boolean)
- premium_until (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 2. **courses** (Updated with Programming Focus)
```sql
- id (UUID, primary key)
- title (text)                        -- Updated to programming courses
- description (text)
- instructor_name (text)
- duration_hours (integer)
- is_premium (boolean)
- video_url (text)
- content (text)
- pass_score (integer)                -- Minimum score for certificate
- created_at (timestamp)
```

**Seed Courses:**
- **Introduction to Python Programming** (Free, 8 hours, 60% pass score)
- **Intermediate Web Development** (Premium, 15 hours, 70% pass score)  
- **Professional Cybersecurity** (Premium, 20 hours, 75% pass score)

#### 3. **certificates** (NEW - Auto-Generated)
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- course_id (UUID, foreign key)
- certificate_url (text)              -- PDF download link
- unique_code (text, unique)          -- Verification code
- issued_at (timestamp)
- verified (boolean)
- student_name (text)
- course_title (text)
- score (integer, ≥60)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 4. **health_records** (NEW)
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- symptoms (text)
- diagnosis (text)
- treatment_plan (text)
- nutrition_plan (jsonb)              -- Structured nutrition data
- subscription_valid_until (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 5. **payments** (NEW)
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- amount (decimal)
- currency (text, default 'KES')
- method (text)                       -- M-Pesa, Card, etc.
- transaction_id (text, unique)
- status (payment_status)             -- pending, success, failed, refunded
- created_at (timestamp)
- updated_at (timestamp)
```

#### 6. **feedback** (NEW)
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- message (text)
- rating (integer, 1-5)
- created_at (timestamp)
```

#### 7. **community_posts** (NEW)
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- title (text)
- content (text)
- tags (text[])                       -- Array of tags
- created_at (timestamp)
- updated_at (timestamp)
```

---

## 🔐 **Security & Access Control**

### **Row Level Security (RLS) Policies:**
- ✅ Users can only access their own data
- ✅ Admin users can view all data (certificates, feedback, etc.)
- ✅ Certificate verification is public (no auth required)
- ✅ Community posts are publicly readable

### **Admin Access:**
- **Admin Email**: `austinemakwaka254@gmail.com`
- **Automatic Privileges**: Set via database trigger on signup
- **Full Access**: All tables, statistics, user management

---

## 🎓 **Certificate System**

### **Automatic Generation:**
- **Trigger**: When `course_enrollments.score ≥ 60%` AND `completed_at` is set
- **Process**: 
  1. Database trigger creates certificate record
  2. Edge function generates PDF with student details
  3. PDF stored in Supabase Storage (`/certificates/{user_id}/{unique_code}.pdf`)
  4. Certificate URL updated in database

### **Certificate Features:**
- **Unique Verification Code**: UUID format for security
- **PDF Generation**: Branded certificate with student name, course, score, date
- **Public Verification**: Anyone can verify certificates via code
- **Download**: Direct PDF download for certificate holders

---

## 🔗 **API Endpoints**

### **1. Certificate Generation** (Protected)
```
POST /functions/v1/generate-certificate
Headers: Authorization: Bearer <JWT>
Body: { "certificateId": "uuid" }
```

### **2. Certificate Verification** (Public)
```
GET /functions/v1/verify-certificate/{unique_code}
Returns: {
  "valid": true,
  "student_name": "Student Name",
  "course": "Course Title", 
  "issued_at": "2025-01-27",
  "score": 85,
  "certificate_url": "https://..."
}
```

---

## 👥 **Demo Users & Test Data**

### **Admin Account:**
- **Email**: `austinemakwaka254@gmail.com`
- **Role**: Admin
- **Subscription**: Premium
- **Access**: Full platform access + admin dashboard

### **Demo Students:**
- **demo@aimwell.com** | Role: demo | Subscription: free
- **demo2@aimwell.com** | Role: demo | Subscription: free  
- **demo3@aimwell.com** | Role: demo | Subscription: free
- **Password**: `demo123!`

### **Sample Data Included:**
- ✅ 3 Programming courses (Python, Web Dev, Cybersecurity)
- ✅ Course enrollments with demo completions
- ✅ Sample certificates with verification codes
- ✅ Health records with nutrition plans
- ✅ Payment records (M-Pesa transactions)
- ✅ Community posts and feedback
- ✅ Forum discussions across categories

---

## 🚀 **New Features Added**

### **1. Certificate Management Page** (`/certificates`)
- View all earned certificates
- Download PDF certificates  
- Public certificate verification
- Real-time verification status

### **2. Automatic Certificate Generation**
- Triggered on course completion (≥60% score)
- Professional PDF generation
- Unique verification codes
- Public verification system

### **3. Enhanced Course System**
- Programming-focused courses
- Score tracking and completion
- Certificate eligibility indicator
- Demo course completion feature

### **4. Storage Integration**
- Supabase Storage bucket for certificates
- Public access for verified certificates
- Automatic PDF generation and upload

### **5. Extended Admin Dashboard**
- Certificate statistics
- Payment tracking
- User feedback monitoring
- Community activity overview

---

## 📊 **Usage Examples**

### **Complete a Course & Earn Certificate:**
1. Enroll in "Introduction to Python Programming"
2. Click "Complete Course (Demo)" 
3. System generates random score (60-99%)
4. If ≥60%, certificate auto-generated
5. View certificate in `/certificates` page
6. Download PDF or verify with unique code

### **Verify Any Certificate:**
1. Go to `/certificates` page
2. Enter verification code in verification section
3. System displays certificate details
4. Certificate marked as "verified" in database

### **Admin Monitoring:**
1. Login as admin (`austinemakwaka254@gmail.com`)
2. Access `/admin` dashboard
3. View all user certificates, payments, feedback
4. Monitor platform activity and statistics

---

## 🔧 **Technical Implementation**

### **Database Triggers:**
- `generate_certificate()`: Auto-creates certificates on course completion
- `set_admin_status()`: Auto-assigns admin privileges
- `update_updated_at_column()`: Timestamp management

### **Edge Functions:**
- `generate-certificate`: Creates PDF certificates  
- `verify-certificate`: Public verification API
- `ai-health-planner`: AI-powered health plans
- `ai-health-chat`: AI chatbot assistant

### **Storage Buckets:**
- `certificates`: Public storage for certificate PDFs

This comprehensive system provides a complete learning platform with automatic certification, verification, and administrative oversight.