# Notion Authentication System

A full-stack authentication system that uses Notion as a database. Users can register, login, and manage their profile with all data stored in a Notion database.

## Features

- ✅ User Registration with email and password
- ✅ Secure Login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Dashboard with profile management
- ✅ Update user details (Full Name, Phone)
- ✅ **Graphic Design Case Studies Management**
- ✅ **Create, Read, Update, Delete case studies**
- ✅ **Multi-select tags and status tracking**
- ✅ **Cover image support for projects**
- ✅ All data stored in Notion database
- ✅ Protected routes
- ✅ Responsive design

## Tech Stack

**Backend:**
- Node.js
- Express.js
- Notion API (@notionhq/client)
- JWT (jsonwebtoken)
- bcryptjs for password hashing

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript

## Prerequisites

Before you begin, ensure you have:
- Node.js (v14 or higher) installed
- A Notion account
- A Notion integration token
- A Notion database set up

## Notion Setup

### 1. Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "+ New integration"
3. Give it a name (e.g., "Auth System")
4. Select the workspace where you want to use it
5. Click "Submit"
6. Copy the "Internal Integration Token" - you'll need this for `NOTION_API_KEY`

### 2. Create Notion Databases

#### Users Database
1. Create a new page in Notion
2. Add a database (full page database)
3. Name it "Users" or whatever you prefer
4. Add the following properties:

   | Property Name | Property Type |
   |--------------|---------------|
   | Email        | Title         |
   | Password     | Text          |
   | Full Name    | Text          |
   | Phone        | Text          |
   | Created At   | Date          |

#### Case Studies Database
1. Create another new page in Notion
2. Add a database (full page database)
3. Name it "Case Studies" or whatever you prefer
4. Add the following properties:

   | Property Name | Property Type |
   |--------------|---------------|
   | Name         | Title         |
   | Project Details | Text       |
   | Tags         | Multi-select  |
   | Cover Image  | Files & Media |
   | Status       | Status        |
   | Created At   | Date          |

   **For the Status property, add these options:**
   - Not Started (Gray)
   - In Progress (Yellow)
   - Completed (Green)

### 3. Share Databases with Integration

**For both Users and Case Studies databases:**

1. Open your database page
2. Click the "..." menu (top right)
3. Click "Add connections"
4. Search for your integration and add it
5. Copy the database ID from the URL:
   - URL format: `https://www.notion.so/{workspace}/{database_id}?v={view_id}`
   - Copy the `database_id` part (32 characters, usually with hyphens)
   - You'll need both database IDs for the environment variables

## Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and fill in your values:
   ```env
   NOTION_API_KEY=your_notion_integration_token_here
   NOTION_DATABASE_ID=your_users_database_id_here
   NOTION_CASE_STUDIES_DATABASE_ID=your_case_studies_database_id_here
   PORT=3000
   JWT_SECRET=your_random_secret_key_here
   SESSION_SECRET=your_random_session_secret_here
   NODE_ENV=development
   ```

   **How to generate secrets:**
   - JWT_SECRET and SESSION_SECRET should be random strings
   - You can generate them using Node.js:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```

4. **Start the server**
   
   For development (with auto-restart):
   ```bash
   npm run dev
   ```
   
   For production:
   ```bash
   npm start
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
notion-auth-system/
├── config/
│   └── notion.js          # Notion client configuration
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── public/
│   ├── css/
│   │   └── style.css      # Styling
│   ├── js/
│   │   ├── login.js       # Login page logic
│   │   ├── register.js    # Register page logic
│   │   ├── dashboard.js   # Dashboard page logic
│   │   └── case-studies.js # Case studies management logic
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── dashboard.html     # Dashboard page
│   └── case-studies.html  # Case studies management page
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── user.js            # User management routes
│   └── caseStudies.js     # Case studies management routes
├── utils/
│   └── notionHelper.js    # Notion database helper functions
├── .env.example           # Environment variables template
├── .gitignore
├── package.json
├── server.js              # Main server file
└── README.md
```

## API Endpoints

### Authentication Routes

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+1234567890"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Logout
```
POST /api/auth/logout
```

### User Routes (Protected)

#### Get Profile
```
GET /api/user/profile
Authorization: Bearer {token}
```

#### Update Profile
```
PUT /api/user/update
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Smith",
  "phone": "+1234567890"
}
```

### Case Studies Routes (Protected)

#### Get All Case Studies
```
GET /api/case-studies
Authorization: Bearer {token}
```

#### Get Single Case Study
```
GET /api/case-studies/{id}
Authorization: Bearer {token}
```

#### Create Case Study
```
POST /api/case-studies
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Brand Identity Design",
  "projectDetails": "Complete brand identity design for a tech startup...",
  "tags": ["branding", "logo", "identity"],
  "coverImage": {
    "url": "https://example.com/image.jpg",
    "name": "cover-image"
  },
  "status": "Completed"
}
```

#### Update Case Study
```
PUT /api/case-studies/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Project Name",
  "projectDetails": "Updated project description...",
  "tags": ["branding", "logo"],
  "status": "In Progress"
}
```

#### Delete Case Study
```
DELETE /api/case-studies/{id}
Authorization: Bearer {token}
```

## Usage

### 1. Register a New User

1. Navigate to the registration page
2. Fill in your email, password, and optionally full name and phone
3. Click "Register"
4. You'll be automatically logged in and redirected to the dashboard

### 2. Login

1. Navigate to the login page
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to the dashboard

### 3. Dashboard

- View your profile information
- Access quick actions for case studies and profile management
- Click "Case Studies" to manage your graphic design portfolio
- Click "Edit Profile" to update your full name and phone number
- Click "Save Changes" to update your information in Notion
- Click "Logout" to end your session

### 4. Case Studies Management

- Navigate to `/case-studies` or click "Case Studies" from the dashboard
- View all your graphic design case studies in a grid layout
- Click "Add Case Study" to create a new project showcase
- Fill in project details: name, description, tags, cover image URL, and status
- Edit existing case studies by clicking the "Edit" button
- Delete case studies by clicking the "Delete" button (with confirmation)
- Use tags to categorize your work (e.g., "branding", "web design", "logo")
- Track project status: Not Started, In Progress, or Completed

## Security Features

- Passwords are hashed using bcrypt before storing in Notion
- JWT tokens for secure authentication
- Protected routes that require authentication
- Session management
- Input validation
- CORS protection

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NOTION_API_KEY | Your Notion integration token | Yes |
| NOTION_DATABASE_ID | Your Users database ID | Yes |
| NOTION_CASE_STUDIES_DATABASE_ID | Your Case Studies database ID | Yes |
| PORT | Server port (default: 3000) | No |
| JWT_SECRET | Secret key for JWT tokens | Yes |
| SESSION_SECRET | Secret key for sessions | Yes |
| NODE_ENV | Environment (development/production) | No |

## Troubleshooting

### "Error creating user in Notion"
- Make sure your Notion integration has access to the database
- Verify all required properties exist in your database
- Check that property names match exactly (case-sensitive)

### "Invalid or expired token"
- Your token might have expired (24 hours validity)
- Try logging in again

### "Connection refused" or server won't start
- Check if the PORT is already in use
- Verify your .env file exists and has correct values

### "User not found" after registration
- Check your Notion database to see if the user was created
- Verify the NOTION_DATABASE_ID is correct

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
