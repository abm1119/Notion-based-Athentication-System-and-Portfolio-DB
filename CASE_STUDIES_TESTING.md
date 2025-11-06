# Case Studies Feature Testing Guide

This guide will help you test the new Graphic Design Case Studies feature that has been added to the Notion Authentication System.

## Prerequisites

Before testing, ensure you have:

1. **Two Notion Databases Set Up:**
   - Users database (existing)
   - Case Studies database (new)

2. **Case Studies Database Schema:**
   ```
   | Property Name   | Property Type | Notes                    |
   |----------------|---------------|--------------------------|
   | Name           | Title         | Project name             |
   | Project Details| Text          | Project description      |
   | Tags           | Multi-select  | Project categories       |
   | Cover Image    | Files & Media | Project cover image      |
   | Status         | Status        | Not Started/In Progress/Completed |
   | Created At     | Date          | Auto-generated           |
   ```

3. **Environment Variables:**
   ```env
   NOTION_API_KEY=your_notion_integration_token
   NOTION_DATABASE_ID=your_users_database_id
   NOTION_CASE_STUDIES_DATABASE_ID=your_case_studies_database_id
   ```

## Testing Steps

### 1. Server Startup Test

```bash
npm start
```

**Expected Result:**
- Server starts on http://localhost:3000
- No errors in console
- Message: "Server is running on http://localhost:3000"

### 2. Authentication Test

1. Navigate to http://localhost:3000
2. Register a new user or login with existing credentials
3. Verify you reach the dashboard

**Expected Result:**
- Successful login redirects to dashboard
- Dashboard shows "Quick Actions" section with Case Studies card

### 3. Dashboard Integration Test

1. On the dashboard, verify you see:
   - "Quick Actions" section
   - "Case Studies" card with 🎨 icon
   - "Edit Profile" card with 👤 icon

2. Click on the "Case Studies" card

**Expected Result:**
- Redirects to `/case-studies` page
- Case studies management page loads

### 4. Case Studies Page Load Test

**Expected Elements:**
- Header with "Graphic Design Case Studies" title
- "← Back to Dashboard" button
- "+ Add Case Study" button
- Loading message initially
- Empty state message if no case studies exist

### 5. Create Case Study Test

1. Click "+ Add Case Study" button
2. Fill in the form:
   - **Name:** "Brand Identity Design"
   - **Project Details:** "Complete brand identity design for a tech startup including logo, color palette, and brand guidelines."
   - **Tags:** Type "branding" and press Enter, then "logo" and press Enter
   - **Cover Image URL:** "https://via.placeholder.com/400x300/4f46e5/ffffff?text=Brand+Identity"
   - **Status:** Select "Completed"
3. Click "Save Case Study"

**Expected Result:**
- Modal closes
- Success message appears
- New case study appears in the grid
- Case study shows all entered information
- Tags are displayed as colored badges
- Status shows as green "Completed" badge

### 6. Edit Case Study Test

1. Click "Edit" button on the created case study
2. Modify the information:
   - Change status to "In Progress"
   - Add a new tag "design"
   - Update project details
3. Click "Update Case Study"

**Expected Result:**
- Modal closes with updated information
- Case study reflects changes
- Status badge changes to yellow "In Progress"
- New tag appears

### 7. Multiple Case Studies Test

Create 2-3 more case studies with different information:

**Case Study 2:**
- Name: "Website Redesign"
- Details: "Complete website redesign for e-commerce platform"
- Tags: ["web design", "ui/ux", "responsive"]
- Status: "In Progress"

**Case Study 3:**
- Name: "Logo Design"
- Details: "Minimalist logo design for consulting firm"
- Tags: ["logo", "minimalist", "corporate"]
- Status: "Not Started"

**Expected Result:**
- All case studies display in grid layout
- Different status colors show correctly
- Tags display properly for each case study

### 8. Delete Case Study Test

1. Click "Delete" button on one case study
2. Confirm deletion in the popup

**Expected Result:**
- Confirmation dialog appears
- After confirmation, case study is removed from grid
- Success message shows

### 9. Navigation Test

1. Click "← Back to Dashboard"
2. Verify you return to the dashboard
3. Click "Case Studies" card again
4. Verify case studies are still there

**Expected Result:**
- Smooth navigation between pages
- Data persists correctly

### 10. Responsive Design Test

Test on different screen sizes:
- Desktop (1200px+)
- Tablet (768px-1199px)
- Mobile (< 768px)

**Expected Result:**
- Grid adjusts to screen size
- Mobile shows single column
- All buttons and forms remain usable

### 11. API Endpoints Test (Optional)

Use a tool like Postman or curl to test API endpoints:

```bash
# Get all case studies (replace TOKEN with your JWT token)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/case-studies

# Create case study
curl -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"API Test","projectDetails":"Test via API","tags":["api","test"],"status":"Completed"}' \
  http://localhost:3000/api/case-studies
```

### 12. Error Handling Test

1. Try accessing `/case-studies` without being logged in
2. Try creating a case study with empty name
3. Try editing a non-existent case study

**Expected Results:**
- Redirects to login if not authenticated
- Shows error message for empty name
- Handles errors gracefully

## Notion Database Verification

After testing, check your Notion Case Studies database:

1. Open your Case Studies database in Notion
2. Verify all created case studies appear
3. Check that all properties are populated correctly:
   - Name (Title)
   - Project Details (Text)
   - Tags (Multi-select with colored tags)
   - Cover Image (Files & Media with external URLs)
   - Status (Status with correct colors)
   - Created At (Date)

## Troubleshooting

### Common Issues:

1. **"Error fetching case studies"**
   - Check NOTION_CASE_STUDIES_DATABASE_ID is correct
   - Verify integration has access to the database
   - Ensure database properties match exactly

2. **"Case study name is required"**
   - This is expected validation - name field is required

3. **Images not loading**
   - Verify image URLs are accessible
   - Use placeholder services like placeholder.com for testing

4. **Tags not saving**
   - Ensure Tags property is Multi-select type in Notion
   - Check property name is exactly "Tags"

5. **Status not updating**
   - Verify Status property is Status type in Notion
   - Ensure status options exist: "Not Started", "In Progress", "Completed"

## Success Criteria

✅ All tests pass without errors
✅ Case studies are created, read, updated, and deleted successfully
✅ Data persists in Notion database correctly
✅ UI is responsive and user-friendly
✅ Navigation works smoothly
✅ Authentication is properly enforced
✅ Error handling works as expected

## Next Steps

After successful testing:
1. Add your own case studies with real project data
2. Customize the styling to match your brand
3. Consider adding more features like:
   - Image upload functionality
   - Project categories/filters
   - Search functionality
   - Export capabilities

## Support

If you encounter any issues during testing:
1. Check the browser console for JavaScript errors
2. Check the server console for backend errors
3. Verify your Notion database setup matches the requirements
4. Ensure all environment variables are set correctly