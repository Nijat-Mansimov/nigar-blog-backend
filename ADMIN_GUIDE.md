# Admin Dashboard Setup and Usage

## Overview

A complete admin dashboard for Nigar Shah to manage articles. Only authorized admins can create, edit, and delete articles.

## Features

### Authentication
- Secure login with email/password
- JWT token-based authentication
- Session persistence
- Automatic logout

### Article Management
- **Create** new articles with all metadata
- **Edit** existing articles
- **Delete** articles with confirmation
- **View** all articles in a dashboard
- **Track** view counts
- **Mark** articles as featured

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `express` - Web framework
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `jsonwebtoken` - JWT authentication
- `uuid` - Unique ID generation
- TypeScript dependencies

### 2. Environment Configuration

Backend `.env` already configured:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Run Backend

```bash
cd backend
npm run dev
```

Backend starts at `http://localhost:5000`

## Frontend Setup

Your frontend `.env` is already configured:
```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:
```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:8080`

## Admin Login

### Access Admin Portal
Navigate to: `http://localhost:8080/admin/login`

### Demo Credentials
```
Email: nigar@shah.com
Password: admin123
```

Or click the **Admin** link in the navigation bar.

## API Endpoints (Admin Only)

All admin endpoints require JWT token in `Authorization` header:
```
Authorization: Bearer <token>
```

### Authentication

**POST** `/api/admin/login`
```json
{
  "username": "nigar@shah.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": { "username": "nigar@shah.com" }
  }
}
```

**GET** `/api/admin/verify`
```
Header: Authorization: Bearer <token>
```

### Article Management

**POST** `/api/admin/articles` - Create article
```json
{
  "title": "Article Title",
  "slug": "article-slug",
  "subtitle": "Subtitle",
  "excerpt": "Short excerpt",
  "body": "Full content",
  "date": "February 28, 2026",
  "category": "Essay",
  "featured": false,
  "readingTime": 5
}
```

**GET** `/api/admin/articles` - List all articles

**GET** `/api/admin/articles/:id` - Get single article

**PUT** `/api/admin/articles/:id` - Update article
```json
{
  "title": "Updated Title",
  "featured": true,
  "category": "Culture"
}
```

**DELETE** `/api/admin/articles/:id` - Delete article

## Admin Dashboard Features

### Article List
- View all published articles
- See article metadata (title, category, date, views, featured status)
- Sort and search (future enhancement)
- Quick actions (edit, delete)

### Create Article
`/admin/articles/new`
- Fill in all article fields
- Support for markdown-style formatting
- Category selection
- Featured status toggle
- Automatic slug generation option

### Edit Article
`/admin/articles/:id/edit`
- Modify any article field
- Update publication date
- Change featured status
- See current view counts

### Delete Article
- Confirmation dialog before deletion
- Cannot be undone
- Removes from public view immediately

## Data Persistence

**Current:** In-memory storage (resets on backend restart)

### To Upgrade to Database

#### Supabase Integration (Recommended)
1. Update `.env` with Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

2. Replace data.ts with Supabase queries
3. Migrate data to tables

#### PostgreSQL
1. Set up local PostgreSQL server
2. Create database and tables
3. Configure connection in backend

#### MongoDB
1. Set up MongoDB Atlas or local instance
2. Create collections
3. Update data access layer

## Security Considerations

### Production Deployment

1. **Change JWT Secret**
```env
JWT_SECRET=generate-a-strong-random-string-here
```

2. **Use Secure Passwords**
- Replace "admin123" with a strong password
- Hash passwords with bcrypt

3. **Enable HTTPS**
```env
CORS_ORIGIN=https://yourdomain.com
```

4. **Database Security**
- Use environmental variables for credentials
- Never commit `.env` to git
- Use database user with limited permissions

5. **Rate Limiting**
- Add rate limiting to login endpoint
- Prevent brute force attacks

6. **Session Management**
- Implement refresh tokens
- Add logout functionality
- Use httpOnly cookies for tokens

## Common Tasks

### Add New Admin User

Edit `backend/src/data.ts`:
```typescript
export const adminCredentials = {
  username: "email@example.com",
  password: "secure-password",
};
```

### Change Credentials

Update in `backend/src/data.ts` and restart backend.

### View Article View Counts

In admin dashboard, check the "Views" column for each article.

### Make Article Featured

Edit article → Check "Featured article" → Save

### Backup Articles

Export from admin dashboard (future feature) or query database directly.

## Troubleshooting

**Login fails?**
- Verify credentials are correct
- Check backend is running (`http://localhost:5000/health`)
- Look at browser console for error messages

**Can't see articles in dashboard?**
- Verify token is being stored (check localStorage in DevTools)
- Check `/api/admin/articles` endpoint directly in browser with token

**CORS errors?**
- Make sure backend `.env` has correct `CORS_ORIGIN`
- Restart backend after changing `.env`

**Articles not persisting after restart?**
- In-memory data is lost on restart
- Set up database integration to persist data

## Next Steps

1. ✅ Basic admin dashboard complete
2. 📊 Add database integration (Supabase preferred)
3. 🔐 Implement password hashing (bcrypt)
4. 📝 Add article search/filter
5. 📈 View analytics and statistics
6. 🖼️ Image upload support
7. 📅 Schedule article publishing
8. 💬 Comment moderation system
