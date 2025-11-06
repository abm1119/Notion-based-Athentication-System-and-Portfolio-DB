# Testing Checklist ✅

Use this checklist to verify your authentication system is working correctly.

## Prerequisites Check

- [ ] Node.js installed (`node --version` works)
- [ ] Dependencies installed (`node_modules` folder exists)
- [ ] `.env` file created with all values filled
- [ ] Notion integration created
- [ ] Notion database created with correct properties
- [ ] Database shared with integration

## Server Start Test

- [ ] Run `npm start` or `npm run dev`
- [ ] Server starts without errors
- [ ] Console shows: "Server is running on http://localhost:3000"
- [ ] No "EADDRINUSE" error (port conflict)

## Registration Tests

### Test 1: Successful Registration
- [ ] Navigate to http://localhost:3000
- [ ] Click "Register here"
- [ ] Fill in all fields:
  - Email: test@example.com
  - Password: test123456
  - Confirm Password: test123456
  - Full Name: Test User
  - Phone: +1234567890
- [ ] Click "Register"
- [ ] ✅ Success: Redirected to dashboard
- [ ] ✅ Success: User appears in Notion database
- [ ] ✅ Success: Password is hashed in Notion (not plain text)

### Test 2: Duplicate Email
- [ ] Try to register with same email again
- [ ] ✅ Success: Error message "User already exists with this email"

### Test 3: Password Mismatch
- [ ] Try registering with different password and confirm password
- [ ] ✅ Success: Error message "Passwords do not match"

### Test 4: Short Password
- [ ] Try registering with password less than 6 characters
- [ ] ✅ Success: Error message "Password must be at least 6 characters"

### Test 5: Missing Required Fields
- [ ] Try registering without email
- [ ] ✅ Success: HTML5 validation prevents submission
- [ ] Try registering without password
- [ ] ✅ Success: HTML5 validation prevents submission

## Login Tests

### Test 1: Successful Login
- [ ] Navigate to http://localhost:3000
- [ ] Enter registered email
- [ ] Enter correct password
- [ ] Click "Login"
- [ ] ✅ Success: Redirected to dashboard
- [ ] ✅ Success: Dashboard shows user information

### Test 2: Wrong Password
- [ ] Try logging in with correct email but wrong password
- [ ] ✅ Success: Error message "Invalid email or password"

### Test 3: Non-existent User
- [ ] Try logging in with email that doesn't exist
- [ ] ✅ Success: Error message "Invalid email or password"

### Test 4: Empty Fields
- [ ] Try logging in without email
- [ ] ✅ Success: HTML5 validation prevents submission
- [ ] Try logging in without password
- [ ] ✅ Success: HTML5 validation prevents submission

## Dashboard Tests

### Test 1: Dashboard Access (Logged In)
- [ ] After successful login, dashboard loads
- [ ] ✅ Success: Shows welcome message with user name
- [ ] ✅ Success: Shows email address
- [ ] ✅ Success: Shows full name (or "Not set")
- [ ] ✅ Success: Shows phone (or "Not set")
- [ ] ✅ Success: Shows "Member Since" date

### Test 2: Dashboard Access (Not Logged In)
- [ ] Clear localStorage or use incognito window
- [ ] Try to access http://localhost:3000/dashboard directly
- [ ] ✅ Success: Redirected to login page

### Test 3: Profile Update
- [ ] Click "Edit Profile" button
- [ ] ✅ Success: Form appears
- [ ] Change full name to "Updated Name"
- [ ] Change phone to "+9876543210"
- [ ] Click "Save Changes"
- [ ] ✅ Success: Success message appears
- [ ] ✅ Success: View switches back to profile display
- [ ] ✅ Success: Updated information shows in dashboard
- [ ] ✅ Success: Check Notion database - information updated there too

### Test 4: Profile Update - Cancel
- [ ] Click "Edit Profile"
- [ ] Change some values
- [ ] Click "Cancel"
- [ ] ✅ Success: Returns to view mode without saving
- [ ] ✅ Success: No changes in Notion database

### Test 5: Logout
- [ ] Click "Logout" button
- [ ] ✅ Success: Redirected to login page
- [ ] Try to go back to /dashboard
- [ ] ✅ Success: Redirected to login page again

## Notion Database Verification

- [ ] Open your Notion database
- [ ] ✅ Check: User entries are visible
- [ ] ✅ Check: Email is stored correctly
- [ ] ✅ Check: Password is HASHED (long gibberish, not plain text)
- [ ] ✅ Check: Full Name is stored
- [ ] ✅ Check: Phone is stored
- [ ] ✅ Check: Created At date is set

## Security Tests

### Test 1: Password Hashing
- [ ] Check password in Notion database
- [ ] ✅ Success: Password starts with "$2a$" or "$2b$" (bcrypt hash)
- [ ] ✅ Success: Password is NOT readable plain text

### Test 2: JWT Token
- [ ] Login successfully
- [ ] Open browser DevTools → Application/Storage → Local Storage
- [ ] ✅ Check: Token is stored in localStorage
- [ ] Copy the token
- [ ] Paste it in jwt.io
- [ ] ✅ Check: Token contains userId and email (but not password)

### Test 3: Protected Routes
- [ ] Clear localStorage
- [ ] Try to access http://localhost:3000/api/user/profile in browser/Postman
- [ ] ✅ Success: Receives 401 Unauthorized error

### Test 4: Token Expiration
- [ ] Login and copy the token
- [ ] Wait 24 hours OR manually expire it
- [ ] Try to access dashboard
- [ ] ✅ Success: Redirected to login (token expired)

## Browser Compatibility

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Edge
- [ ] Test on mobile (responsive design)

## Edge Cases

### Test 1: Very Long Input
- [ ] Try registering with very long email (100+ characters)
- [ ] ✅ Check: System handles it gracefully

### Test 2: Special Characters
- [ ] Try registering with email containing special characters
- [ ] ✅ Success: Works correctly

### Test 3: Concurrent Logins
- [ ] Login in one browser
- [ ] Login with same user in another browser
- [ ] ✅ Success: Both sessions work independently

### Test 4: Network Error Simulation
- [ ] Start registration
- [ ] Stop the server while form is submitting
- [ ] ✅ Success: Error message appears
- [ ] ✅ Success: Can retry after server restart

## Production Readiness

- [ ] All tests above pass
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] Environment variables properly set
- [ ] `.env` is in `.gitignore`
- [ ] Strong JWT_SECRET and SESSION_SECRET set
- [ ] Ready to deploy! 🚀

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Server won't start | Check `.env` file exists and has all values |
| "Unauthorized" error | Verify NOTION_API_KEY is correct |
| "Database not found" | Check NOTION_DATABASE_ID and database connection |
| User not created in Notion | Verify database properties match exactly |
| Password visible in Notion | Check bcrypt is working (restart server) |
| Can't login after registration | Check password hashing and comparison logic |
| Token expired immediately | Check JWT_SECRET is set in `.env` |

---

**All tests passed?** Congratulations! Your authentication system is working perfectly! 🎉
