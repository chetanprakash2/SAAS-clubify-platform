# Clubify - Project Architecture & Data Flow Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Authentication System](#authentication-system)
8. [Real-time Features](#real-time-features)
9. [File Upload System](#file-upload-system)
10. [Frontend Components](#frontend-components)
11. [Deployment Architecture](#deployment-architecture)

---

## Overview

Clubify is a comprehensive club management system designed for schools, colleges, and organizations. It provides tools for managing clubs, members, announcements, events, tasks, meetings with voice chat, and real-time communication.

### Key Features
- **User Management**: Google OAuth authentication and user profiles
- **Club Management**: Create, manage, and discover clubs
- **Member Management**: Role-based access control (admin/member)
- **Content Management**: Announcements, events, tasks, photos, and reports
- **Real-time Communication**: Live chat and voice meetings
- **File Management**: Photo galleries with preview functionality
- **Mobile Responsive**: Works seamlessly on all devices

---

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Assets │    │   Real-time     │    │   File Storage  │
│   (CDN)         │    │   (Socket.io)   │    │   (Cloudinary)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Architecture Principles
- **Separation of Concerns**: Clear boundaries between frontend, backend, and data layers
- **RESTful API Design**: Consistent and predictable API endpoints
- **Real-time First**: Socket.io for live features (chat, meetings)
- **Mobile Responsive**: Progressive enhancement for mobile devices
- **Security First**: Authentication, authorization, and input validation
- **Scalable**: Modular design supporting horizontal scaling

---

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type safety and better developer experience
- **Vite**: Fast build tool and development server
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **React Hook Form**: Form management with validation
- **Zod**: Schema validation

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type safety for server-side code
- **Mongoose**: MongoDB object modeling
- **Passport.js**: Authentication middleware
- **Socket.io**: Real-time bidirectional communication
- **Multer**: File upload handling
- **Cloudinary**: Image storage and optimization

### Database
- **MongoDB Atlas**: Cloud-hosted MongoDB database
- **Mongoose Schema**: Data modeling and validation

### Authentication
- **Google OAuth 2.0**: Secure user authentication
- **Express Session**: Session management
- **connect-mongo**: MongoDB session storage

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler
- **ESLint**: Code linting
- **Prettier**: Code formatting

---

## Data Flow

### 1. User Authentication Flow
```
User → Google OAuth → Backend → MongoDB → Session Created → Frontend
```

1. User clicks "Login with Google"
2. Redirected to Google OAuth consent screen
3. Google returns authorization code
4. Backend exchanges code for user profile
5. User profile stored/updated in MongoDB
6. Session created and stored in MongoDB
7. User redirected to frontend with authenticated session

### 2. Club Management Flow
```
Frontend → API Request → Backend → MongoDB → Response → Frontend Update
```

1. User performs action (create club, join club, etc.)
2. Frontend sends API request with authentication
3. Backend validates request and user permissions
4. Database operation performed
5. Response sent back to frontend
6. Frontend updates UI and cache

### 3. Real-time Communication Flow
```
User A → Socket.io → Backend → Socket.io → User B
```

1. User A sends message/joins meeting
2. Frontend emits socket event
3. Backend processes and validates event
4. Backend broadcasts to relevant users
5. Other users receive real-time updates

### 4. File Upload Flow
```
Frontend → Multer → Cloudinary → Database → Response
```

1. User selects file for upload
2. Frontend sends multipart form data
3. Multer processes file upload
4. File uploaded to Cloudinary
5. File metadata stored in database
6. Cloudinary URL returned to frontend

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  id: String, // Google OAuth ID
  email: String,
  firstName: String,
  lastName: String,
  profileImageUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Clubs Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  displayPictureUrl: String,
  isPublic: Boolean,
  inviteCode: String, // Unique invite code
  createdBy: String, // User ID
  createdAt: Date,
  updatedAt: Date
}
```

### Club Memberships Collection
```javascript
{
  _id: ObjectId,
  clubId: String,
  userId: String,
  role: String, // "admin" | "member"
  joinedAt: Date
}
```

### Announcements Collection
```javascript
{
  _id: ObjectId,
  clubId: String,
  title: String,
  content: String,
  priority: String, // "low" | "medium" | "high"
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Events Collection
```javascript
{
  _id: ObjectId,
  clubId: String,
  title: String,
  description: String,
  date: Date,
  location: String,
  category: String, // "meeting" | "social" | "workshop" | "other"
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId,
  clubId: String,
  title: String,
  description: String,
  assignedTo: String, // User ID
  dueDate: Date,
  status: String, // "pending" | "in-progress" | "completed"
  priority: String, // "low" | "medium" | "high"
  progress: Number, // 0-100
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Meetings Collection
```javascript
{
  _id: ObjectId,
  clubId: String,
  title: String,
  description: String,
  scheduledAt: Date,
  startedAt: Date,
  endedAt: Date,
  status: String, // "scheduled" | "active" | "ended" | "cancelled"
  participants: [String], // Array of User IDs
  maxParticipants: Number,
  isVoiceOnly: Boolean,
  meetingCode: String, // Unique meeting code
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Photos Collection
```javascript
{
  _id: ObjectId,
  clubId: String,
  title: String,
  description: String,
  imageUrl: String, // Cloudinary URL
  category: String, // "general" | "events" | "activities" | "members"
  uploadedBy: String,
  createdAt: Date
}
```

### Chat Messages Collection
```javascript
{
  _id: ObjectId,
  clubId: String,
  senderId: String,
  content: String,
  messageType: String, // "text" | "system"
  createdAt: Date
}
```

### Meeting Messages Collection
```javascript
{
  _id: ObjectId,
  meetingId: String,
  senderId: String,
  content: String,
  messageType: String, // "text" | "system"
  createdAt: Date
}
```

---

## API Endpoints

### Authentication Routes
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Handle OAuth callback
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout user

### Club Routes
- `GET /api/clubs/my` - Get user's clubs
- `GET /api/clubs/public` - Get public clubs
- `POST /api/clubs` - Create new club
- `GET /api/clubs/:id` - Get club details
- `PATCH /api/clubs/:id` - Update club
- `DELETE /api/clubs/:id` - Delete club
- `POST /api/clubs/:id/join` - Join club via invite code

### Member Management Routes
- `GET /api/clubs/:id/members` - Get club members
- `GET /api/clubs/:id/join-requests` - Get join requests
- `POST /api/clubs/:id/request-join` - Request to join club
- `PATCH /api/join-requests/:id/approve` - Approve join request
- `PATCH /api/join-requests/:id/reject` - Reject join request

### Content Management Routes
- `GET /api/clubs/:id/announcements` - Get announcements
- `POST /api/clubs/:id/announcements` - Create announcement
- `PATCH /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

- `GET /api/clubs/:id/events` - Get events
- `POST /api/clubs/:id/events` - Create event
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

- `GET /api/clubs/:id/tasks` - Get tasks
- `POST /api/clubs/:id/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### File Management Routes
- `GET /api/clubs/:id/photos` - Get photos
- `POST /api/clubs/:id/photos/upload` - Upload photo
- `DELETE /api/photos/:id` - Delete photo

- `GET /api/clubs/:id/reports` - Get reports
- `POST /api/clubs/:id/reports/upload` - Upload report
- `DELETE /api/reports/:id` - Delete report

### Meeting Routes
- `GET /api/clubs/:id/meetings` - Get club meetings
- `POST /api/clubs/:id/meetings` - Create meeting
- `GET /api/meetings/:id` - Get meeting details
- `POST /api/meetings/:id/join` - Join meeting
- `POST /api/meetings/:id/leave` - Leave meeting
- `PATCH /api/meetings/:id/start` - Start meeting
- `PATCH /api/meetings/:id/end` - End meeting

### Messaging Routes
- `GET /api/clubs/:id/messages` - Get chat messages
- `POST /api/clubs/:id/messages` - Send chat message
- `GET /api/meetings/:id/messages` - Get meeting messages
- `POST /api/meetings/:id/messages` - Send meeting message

---

## Authentication System

### Google OAuth Integration
1. **OAuth Configuration**: Google Cloud Console setup with client ID and secret
2. **Passport Strategy**: passport-google-oauth20 for handling OAuth flow
3. **Session Management**: Express sessions stored in MongoDB
4. **User Profile**: Automatic user creation/update from Google profile

### Authorization Levels
- **Public**: Anyone can view public clubs
- **Authenticated**: Logged-in users can create clubs and join public clubs
- **Member**: Club members can view content and participate
- **Admin**: Club admins can manage content and members

### Security Features
- HTTPS enforcement in production
- Session security with secure cookies
- CSRF protection
- Input validation and sanitization
- Rate limiting on sensitive endpoints

---

## Real-time Features

### Socket.io Integration
- **Club Chat**: Real-time messaging within clubs
- **Meeting Chat**: Live text chat during voice meetings
- **Meeting Status**: Real-time meeting participant updates
- **Notifications**: Live updates for new announcements, events, etc.

### Voice Chat System
- **WebRTC**: Browser-based voice communication
- **Audio Context**: Enhanced audio processing
- **Mute Controls**: Individual microphone control
- **Participant Management**: Real-time participant list

### Socket Events
- `join_club` - User joins club chat room
- `leave_club` - User leaves club chat room
- `send_message` - Send chat message
- `receive_message` - Receive chat message
- `join_meeting` - Join voice meeting
- `leave_meeting` - Leave voice meeting
- `meeting_update` - Meeting status updates

---

## File Upload System

### Cloudinary Integration
- **Image Optimization**: Automatic compression and resizing
- **CDN Delivery**: Fast global content delivery
- **Format Support**: JPEG, PNG, WebP, etc.
- **Upload Presets**: Configured upload settings

### File Processing Flow
1. Frontend file selection with validation
2. Multer middleware processes multipart data
3. File uploaded to Cloudinary with metadata
4. Cloudinary URL stored in database
5. Optimized image served via CDN

### File Types Supported
- **Photos**: Club galleries and profile pictures
- **Reports**: Document uploads for club records
- **Display Pictures**: Club logos and branding

---

## Frontend Components

### Page Components
- **HomePage**: Landing page with public clubs
- **ExplorePage**: Discover and search public clubs
- **ClubDashboard**: Main club management interface
- **ProfilePage**: User profile management

### Feature Components
- **ClubCard**: Club preview cards
- **MeetingRoom**: Voice chat and meeting interface
- **ChatComponent**: Real-time messaging
- **PhotoGallery**: Image gallery with previews
- **MeetingsSection**: Meeting management
- **ReportsSection**: Document management

### UI Components (shadcn/ui)
- Forms, dialogs, cards, buttons
- Navigation, tabs, accordions
- Data display, badges, skeletons
- Responsive layout components

### State Management
- **TanStack Query**: Server state and caching
- **React Context**: Global app state
- **Local State**: Component-specific state
- **Form State**: React Hook Form for forms

---

## Deployment Architecture

### Production Environment
```
Internet → Load Balancer → Application Servers → Database Cluster
                      ↓
                  File Storage (Cloudinary)
```

### Platform Options
1. **Vercel**: Serverless deployment with edge functions
2. **Render**: Traditional server deployment with auto-scaling
3. **Railway**: Container-based deployment
4. **DigitalOcean**: VPS or App Platform deployment

### Environment Configuration
- **Development**: Local MongoDB, Google OAuth localhost
- **Staging**: Cloud database, test OAuth credentials
- **Production**: MongoDB Atlas, production OAuth, CDN

### Monitoring & Logging
- Application logs via platform dashboards
- Database monitoring via MongoDB Atlas
- Error tracking with Sentry (optional)
- Performance monitoring with built-in tools

---

## Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Lazy loading of route components
- **Image Optimization**: Lazy loading and compression
- **Caching**: TanStack Query for API response caching
- **Bundle Optimization**: Tree shaking and minification

### Backend Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **Compression**: Gzip compression for responses
- **Rate Limiting**: Prevent abuse and ensure fair usage

### Database Optimizations
- **Indexes**: Compound indexes for common queries
- **Aggregation**: Efficient data aggregation pipelines
- **Pagination**: Limit query results for large datasets
- **Connection Management**: Proper connection lifecycle

---

## Security Considerations

### Data Protection
- **Input Validation**: Zod schemas for all user inputs
- **SQL Injection Prevention**: Mongoose ODM protections
- **XSS Prevention**: Input sanitization and CSP headers
- **CSRF Protection**: Token-based CSRF protection

### Authentication Security
- **OAuth Security**: Secure OAuth implementation
- **Session Security**: Secure session cookies
- **Password Policy**: N/A (OAuth only)
- **Account Lockout**: Rate limiting on auth endpoints

### Infrastructure Security
- **HTTPS**: SSL/TLS encryption
- **Environment Variables**: Secure secret management
- **Network Security**: VPC and firewall rules
- **Backup Strategy**: Regular database backups

---

This documentation provides a comprehensive overview of Clubify's architecture, data flow, and implementation details. It serves as a reference for developers, maintainers, and anyone looking to understand or extend the system.