# Quick Setup Guide

Follow these steps to get your Notion Authentication System up and running.

## Step 1: Install Node.js

If you don't have Node.js installed:
1. Download from [https://nodejs.org/](https://nodejs.org/)
2. Install the LTS version
3. Verify installation: `node --version`

## Step 2: Create Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Fill in the details:
   - Name: `Auth System` (or any name you prefer)
   - Associated workspace: Select your workspace
   - Capabilities: Leave default (Read, Update, Insert content)
4. Click **"Submit"**
5. **COPY the "Internal Integration Token"** - Save it somewhere safe!

## Step 3: Create Notion Database

1. Open Notion and create a new page
2. Type `/table` and select **"Table - Full page"**
3. Name your table "Users"
4. Set up the following columns (properties):

   **Important: The first column will automatically be "Email" with type "Title"**

   | Column Name | Type | How to Add |
   |------------|------|------------|
   | Email | Title | (Already exists - rename if needed) |
   | Password | Text | Click "+" → "Text" → Name it "Password" |
   | Full Name | Text | Click "+" → "Text" → Name it "Full Name" |
   | Phone | Text | Click "+" → "Text" → Name it "Phone" |
   | Created At | Date | Click "+" → "Date" → Name it "Created At" |

5. **Share the database with your integration:**
   - Click the "..." menu (top right of the database)
   - Click **"Add connections"**
   - Find and select your integration
   - Click **"Confirm"**

6. **Copy the Database ID:**
   - Look at your browser's URL
   - It looks like: `https://www.notion.so/workspace/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?v=...`
   - Copy the 32-character ID (the X's part)
   - Remove any dashes if needed, or keep them - both work

## Step 4: Install Dependencies

1. Open terminal/command prompt in the project folder
2. Run:
   ```bash
   npm install
   ```
3. Wait for all packages to install

## Step 5: Configure Environment

1. Copy `.env.example` to create `.env`:
   ```bash
   # Windows Command Prompt
   copy .env.example .env
   
   # Windows PowerShell
   Copy-Item .env.example .env
   ```

2. Open `.env` in a text editor and fill in:
   ```env
   NOTION_API_KEY=secret_XXXXXXXXXXXXXXXXXXXXXXXXX
   NOTION_DATABASE_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   PORT=3000
   JWT_SECRET=any_random_long_string_here_12345
   SESSION_SECRET=another_random_string_67890
   NODE_ENV=development
   ```

   Replace:
   - `NOTION_API_KEY`: Your integration token from Step 2
   - `NOTION_DATABASE_ID`: Your database ID from Step 3
   - `JWT_SECRET`: Any random string (at least 32 characters)
   - `SESSION_SECRET`: Any random string (at least 32 characters)

## Step 6: Start the Server

Run:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

You should see:
```
Server is running on http://localhost:3000
Environment: development
```

## Step 7: Test Your App

1. Open your browser
2. Go to: [http://localhost:3000](http://localhost:3000)
3. You should see the login page
4. Click "Register here" to create a new account
5. Fill in the form and register
6. Check your Notion database - you should see the new user!

## Common Issues

### ❌ "Cannot find module 'express'"
**Solution:** Run `npm install` again

### ❌ "Error: Unauthorized" from Notion
**Solution:** 
- Check your `NOTION_API_KEY` is correct
- Make sure you shared the database with your integration

### ❌ "Error creating user in Notion"
**Solution:**
- Verify database property names match exactly (case-sensitive):
  - Email (Title type)
  - Password (Text type)
  - Full Name (Text type)
  - Phone (Text type)
  - Created At (Date type)

### ❌ "Port 3000 is already in use"
**Solution:** 
- Change PORT in `.env` to another number (e.g., 3001)
- Or stop the other application using port 3000

### ❌ Page shows "Cannot GET /"
**Solution:**
- Make sure the server is running
- Check the console for any error messages

## Next Steps

Once everything is working:

1. **Secure Your Secrets:**
   - Never commit `.env` to version control
   - Use strong, random secrets in production

2. **Customize:**
   - Modify the CSS in `public/css/style.css`
   - Add more fields to the user profile
   - Add more Notion properties

3. **Deploy:**
   - Deploy to platforms like Heroku, Vercel, or Railway
   - Set environment variables in your hosting platform
   - Change `NODE_ENV` to `production`

## Need Help?

- Check the main README.md for detailed documentation
- Review the Notion API docs: [https://developers.notion.com/](https://developers.notion.com/)
- Make sure all environment variables are set correctly

Happy coding! 🚀
