# ============================================
# FAMILY TREE APP - API DOCUMENTATION
# ============================================

## Base URL
```
Development: http://localhost:5173
Production: https://your-app.vercel.app
```

## Authentication

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Login dengan Google
```http
GET /api/auth/google
```

### Logout
```http
POST /api/auth/logout
```

---

## Family Members

### Get All Members
```http
GET /api/members
```

Response:
```json
[
  {
    "id": "uuid",
    "full_name": "John Doe",
    "gender": "male",
    "birth_date": "1990-01-01",
    "death_date": null,
    "status": "alive",
    "bio": "Description here",
    "photo_url": "https://...",
    "father_id": "uuid",
    "mother_id": "uuid",
    "spouse_id": "uuid",
    "created_by": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Member by ID
```http
GET /api/members/:id
```

### Create Member
```http
POST /api/members
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "gender": "female",
  "birth_date": "1992-05-15",
  "status": "alive",
  "bio": "Optional biography",
  "father_id": "uuid",
  "mother_id": "uuid",
  "spouse_id": "uuid",
  "social_media": {
    "facebook": "https://facebook.com/...",
    "instagram": "https://instagram.com/...",
    "twitter": "https://twitter.com/...",
    "linkedin": "https://linkedin.com/in/...",
    "whatsapp": "https://wa.me/..."
  }
}
```

### Update Member
```http
PATCH /api/members/:id
Content-Type: application/json

{
  "full_name": "Updated Name",
  "status": "deceased",
  "death_date": "2024-01-01"
}
```

### Delete Member
```http
DELETE /api/members/:id
```

### Search Members
```http
GET /api/members/search?q=john
```

---

## Family Tree

### Get Full Tree
```http
GET /api/tree
```

Response:
```json
{
  "nodes": {
    "uuid": {
      "id": "uuid",
      "full_name": "John Doe",
      "gender": "male",
      "level": 0,
      "children": ["uuid1", "uuid2"],
      "spouses": ["uuid3"],
      "position": { "x": 100, "y": 200 }
    }
  },
  "rootIds": ["uuid"]
}
```

### Get Subtree
```http
GET /api/tree/:memberId
```

---

## Users

### Get All Users (Admin only)
```http
GET /api/users
```

### Get Current User
```http
GET /api/users/me
```

### Update User Role (Super Admin only)
```http
PATCH /api/users/:id/role
Content-Type: application/json

{
  "role": "admin"
}
```

### Link User to Family Member
```http
PATCH /api/users/:id/link
Content-Type: application/json

{
  "family_member_id": "uuid"
}
```

---

## File Upload

### Upload Photo
```http
POST /api/upload/photo
Content-Type: multipart/form-data

file: <binary>
member_id: "uuid"
```

Response:
```json
{
  "url": "https://...supabase.co/storage/..."
}
```

---

## PostgreSQL Functions (RPC)

### Get Family Tree
```sql
SELECT * FROM get_family_tree(root_member_id UUID);
```

### Get Descendants
```sql
SELECT * FROM get_descendants(member_id UUID);
```

### Get Ancestors
```sql
SELECT * FROM get_ancestors(member_id UUID);
```

### Check Edit Permission
```sql
SELECT can_edit_member(member_id UUID);
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Please login first"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## Rate Limits

- Authentication: 10 requests per minute
- API calls: 100 requests per minute
- Upload: 10 requests per minute

---

## WebSocket Events (Future)

```javascript
// Real-time updates
socket.on('member:created', (data) => { ... });
socket.on('member:updated', (data) => { ... });
socket.on('member:deleted', (data) => { ... });
```
