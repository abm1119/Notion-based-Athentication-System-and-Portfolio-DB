# ⚡ Quick Start (5 Minutes)

## 1️⃣ Get Notion Integration Token

1. Visit: https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Name it "Auth System" → Submit
4. **Copy the token** (starts with `secret_`)

## 2️⃣ Create Notion Database
 
1. In Notion, create a new page
2. Type `/table` → Select "Table - Full page"
3. Add these columns:
   - **Email** (Title) - should exist by default
   - **Password** (Text)
   - **Full Name** (Text)
   - **Phone** (Text)
   - **Created At** (Date)

4. Share with integration:
   - Click "..." menu (top right)
   - "Add connections" → Select your integration

5. **Copy Database ID** from URL:
   - URL: `https://www.notion.so/XXXXX-HERE-IS-THE-ID-XXXXX?v=...`

## 3️⃣ Configure App

1. Open `.env` file in this project
2. Replace these values:
   ```env
   NOTION_API_KEY=secret_your_token_from_step1
   NOTION_DATABASE_ID=your_database_id_from_step2
   ```

## 4️⃣ Run App

```bash
npm start
```

## 5️⃣ Open Browser

Go to: http://localhost:3000

**That's it!** 🎉

---

### First Time Use:

1. Click "Register here"
2. Create an account
3. Check your Notion database - you'll see the new user!

### Troubleshooting:

- **"Unauthorized"** → Check NOTION_API_KEY
- **"Database not found"** → Check NOTION_DATABASE_ID and connection
- **"Port in use"** → Change PORT in .env to 3001

Need detailed help? Check `SETUP_GUIDE.md` or `README.md`