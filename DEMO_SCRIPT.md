# AimWell Course Integration - Demo Script

## Quick Demo: End-to-End Course & Certificate Flow

This script demonstrates all key features of the course integration in ~5 minutes.

---

## Setup

**Prerequisites:**
- Database migrations applied ✅
- Admin account: austinemakwaka254@gmail.com
- Demo student account created

**Demo Data Already Loaded:**
- 3 Udemy courses (Web Dev, Python ML, AWS)
- Sample internal courses
- Test certificates

---

## Demo Part 1: Admin Creates External Course (2 min)

### Step 1: Login as Admin
1. Navigate to `/auth`
2. Login with: austinemakwaka254@gmail.com
3. Verify admin badge appears in sidebar

### Step 2: Add Udemy Course
1. Click "Course Management" in sidebar
2. Switch to "External Courses" tab
3. Click "Add External Course"

**Fill Form:**
```
Title: The Complete JavaScript Course 2025
URL: https://www.udemy.com/course/the-complete-javascript-course/
Instructor: Jonas Schmedtmann
Price Text: Paid - $89.99
Description: Master JavaScript with the most complete course! Projects, challenges, quizzes, JavaScript ES6+, OOP, AJAX, Webpack
Thumbnail URL: https://img-c.udemycdn.com/course/480x270/851712_fc61_6.jpg
Affiliate Tag: aimwell2025 (optional)
Notes: Bestseller with 500k+ students
```

4. Click "Create Course"
5. Verify course appears in external courses list

**Expected Result:** ✅ Course created and visible on Education page

---

## Demo Part 2: Student Browses & Clicks External Course (1 min)

### Step 3: Switch to Student View
1. Logout from admin
2. Login as demo student (or create new account)
3. Navigate to `/education`

### Step 4: Explore Courses
1. See "Internal Courses" tab with AimWell courses
2. Switch to "External Courses" tab
3. Notice orange "Udemy" badges on cards
4. Find the newly added JavaScript course

### Step 5: Click Through to Udemy
1. Click "Open on Udemy" button
2. Observe new tab opens to Udemy
3. Return to AimWell

**Expected Result:** 
- ✅ Redirected to Udemy course page
- ✅ Click tracked in database (`course_purchases` table with status='redirected')

**Verify in Database:**
```sql
SELECT * FROM course_purchases 
WHERE user_id = 'current_user_id' 
AND gateway = 'udemy_redirect'
ORDER BY created_at DESC 
LIMIT 1;
```

---

## Demo Part 3: Student Completes Internal Course (1 min)

### Step 6: Enroll in Internal Course
1. Return to "Internal Courses" tab
2. Find a free course (e.g., "Intro to Python")
3. Click "Enroll Now"
4. Verify enrollment confirmation toast

### Step 7: Complete Course (Demo)
1. After enrollment, see "Continue Learning" button
2. Click "Complete Course (Demo)" button
3. System generates random score (60-99%)
4. Observe success message

**Expected Result:**
- ✅ Course marked complete
- ✅ Certificate auto-generated (if score ≥60%)
- ✅ "Certificate Generated!" message appears
- ✅ Green checkmark shows completion

---

## Demo Part 4: View & Verify Certificate (1 min)

### Step 8: Access Certificates
1. Click "My Certificates" in sidebar
2. See newly generated certificate
3. Note the unique verification code
4. Click "Download PDF" (if generated)

### Step 9: Verify Certificate
1. Copy the verification code
2. Scroll to "Certificate Verification" section
3. Paste code in input field
4. Click "Verify"

**Expected Result:**
- ✅ Green success message
- ✅ Shows: Student name, Course title, Score, Issue date
- ✅ "Certificate Verified!" badge appears

### Step 10: Public Verification (Employer View)
1. Open new incognito window
2. Navigate to `/certificate-verification`
3. Paste same verification code
4. Click "Verify"

**Expected Result:**
- ✅ Certificate verified without login
- ✅ All details visible to public
- ✅ Proves authenticity to employers

---

## Demo Part 5: External Course Proof Upload (Bonus - 2 min)

### Step 11: Upload Udemy Completion Proof
1. As logged-in student, stay on `/certificate-verification`
2. Click "Upload Completion Proof"
3. Fill form:
   - Course Title: "The Complete JavaScript Course 2025"
   - Upload: Screenshot or PDF of Udemy certificate
4. Click "Submit for Verification"

**Expected Result:**
- ✅ File uploaded to Supabase Storage
- ✅ Pending certificate created
- ✅ Shows "Awaiting admin verification" status

### Step 12: Admin Verifies Proof (Switch to Admin)
1. Logout student, login as admin
2. Navigate to admin panel
3. View pending certificate verifications
4. Review uploaded proof document
5. Click "Approve & Issue Certificate"

**Expected Result:**
- ✅ AimWell certificate issued for external course
- ✅ Student receives notification
- ✅ Certificate appears in student's certificates list
- ✅ Verification code generated

---

## Demo Results Summary

### What We Demonstrated:
1. ✅ **Admin adds external Udemy course** with affiliate tracking
2. ✅ **Student browses unified course catalog** (internal + external)
3. ✅ **Click tracking** records when student visits Udemy
4. ✅ **Internal course enrollment** and completion
5. ✅ **Automatic certificate generation** for internal courses
6. ✅ **Public certificate verification** works without login
7. ✅ **External proof upload** for Udemy completions
8. ✅ **Manual verification workflow** for admin approval

### Database Impact:
```
New Records Created:
- 1x external_courses (JavaScript course)
- 1x course_purchases (Udemy redirect)
- 1x course_enrollments (Internal course)
- 2x certificates (1 auto, 1 manual pending)
- 1x file in storage (proof upload)
```

---

## Troubleshooting

### Issue: Certificate not generating
**Check:**
- Score must be ≥60%
- Course enrollment exists
- User is authenticated
- Database trigger is active

### Issue: External course not tracking clicks
**Check:**
- User is logged in
- `course_purchases` INSERT policy allows user
- Network request succeeds (check console)

### Issue: Verification fails
**Check:**
- Verification code is correct (UUID format)
- Certificate exists in database
- Edge function is deployed
- CORS headers configured

---

## Quick Test Commands

### Verify Database State
```sql
-- Check external courses
SELECT title, url, source FROM external_courses;

-- Check click tracking
SELECT COUNT(*) FROM course_purchases WHERE gateway = 'udemy_redirect';

-- Check certificates
SELECT student_name, course_title, verified, score FROM certificates;

-- Check pending verifications
SELECT * FROM certificates WHERE verified = false AND proof_url IS NOT NULL;
```

### Test API Endpoints
```bash
# Verify certificate (replace with actual code)
curl https://knglvzdhexfagdflyeqk.supabase.co/functions/v1/verify-certificate/YOUR_UUID_HERE

# Expected: JSON with valid: true/false
```

---

## Video Demo Script (if recording)

**Voiceover:**

"Welcome to AimWell's new course integration feature. Today I'll show you how we've seamlessly combined internal courses with curated Udemy content.

First, as an admin, I'm adding a new Udemy course... [fill form] ...and it's live.

Now as a student, I can browse all courses in one place. Here are AimWell's courses, and here are the Udemy recommendations. I'll click this one... [redirect to Udemy] ...and that click is tracked for analytics.

Back on AimWell, I'll enroll in an internal course... complete it... and boom - automatic certificate generation with a unique verification code.

Anyone can verify this certificate, even without an account. Perfect for employers checking credentials.

Finally, if I complete a Udemy course, I just upload my completion proof here... an admin reviews it... and I get an official AimWell certificate.

That's course integration done right - internal and external, all in one platform with verifiable credentials."

---

**Demo Complete! 🎉**

Total time: ~5 minutes
Features covered: 8/8
Database operations: Working ✅
User experience: Smooth ✅

---

## Next Steps After Demo

1. **Production Deployment:**
   - Review and merge PR
   - Run migrations on production database
   - Test with real Udemy URLs
   - Configure affiliate tags

2. **Content Strategy:**
   - Curate 20-30 high-quality Udemy courses
   - Create internal course catalog
   - Set pricing tiers
   - Plan promotional campaigns

3. **Analytics Setup:**
   - Create dashboard for course metrics
   - Track conversion rates
   - Monitor certificate verifications
   - Analyze student engagement

4. **User Training:**
   - Create help documentation
   - Record tutorial videos
   - Prepare FAQ section
   - Train admin team on verification workflow

---

**Questions or Issues?**
Contact: austinemakwaka254@gmail.com
