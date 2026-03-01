# Journal Backend API

A Node.js/Express backend API for serving article data with view tracking.

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Configuration

Create a `.env` file (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Articles

#### GET `/api/articles`
Retrieve all articles.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "slug": "article-slug",
      "title": "Article Title",
      "subtitle": "Subtitle",
      "excerpt": "...",
      "body": "...",
      "date": "2026-02-20",
      "category": "Essay",
      "featured": false,
      "readingTime": 6,
      "views": 0
    }
  ],
  "total": 5
}
```

#### GET `/api/articles/featured`
Retrieve the featured article.

**Response:**
```json
{
  "success": true,
  "data": { /* article object */ }
}
```

#### GET `/api/articles/:slug`
Retrieve a single article by slug.

**Response:**
```json
{
  "success": true,
  "data": { /* article object */ }
}
```

#### GET `/api/articles/:slug/views`
Get the view count for an article.

**Response:**
```json
{
  "success": true,
  "data": {
    "slug": "article-slug",
    "views": 42
  }
}
```

#### POST `/api/articles/:slug/views`
Increment the view count for an article.

**Response:**
```json
{
  "success": true,
  "data": {
    "slug": "article-slug",
    "views": 43
  }
}
```

#### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-28T12:00:00.000Z"
}
```

## Data Storage

Currently using in-memory storage for view counts. For production, integrate with:
- Supabase (Already configured in frontend .env)
- PostgreSQL
- MongoDB
- Any other database

## Next Steps

1. Integrate with Supabase for persistent data storage
2. Add authentication endpoints
3. Add article management endpoints (create, update, delete)
4. Add caching layer (Redis)
5. Add rate limiting
6. Add API documentation (Swagger)
