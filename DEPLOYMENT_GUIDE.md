# Clubify Deployment Guide

## Overview

This guide covers deploying Clubify to popular hosting platforms. Clubify is a full-stack club management application built with React, Express.js, MongoDB, and Google OAuth authentication.

## Prerequisites

Before deploying, ensure you have:

1. **MongoDB Atlas Account**: Cloud database for data storage
2. **Google Cloud Platform Account**: For OAuth authentication
3. **Cloudinary Account**: For image uploads (optional but recommended)
4. **GitHub Repository**: Your code should be pushed to GitHub

## Environment Variables

The following environment variables are required for production:

```bash
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority

# Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_random_session_secret

# Optional: Image Uploads
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Environment
NODE_ENV=production
```

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Add your deployment domain to IP whitelist (or use 0.0.0.0/0 for all IPs)

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - For Vercel: `https://your-app.vercel.app/api/auth/google/callback`
   - For Render: `https://your-app.onrender.com/api/auth/google/callback`
6. Add authorized JavaScript origins:
   - For Vercel: `https://your-app.vercel.app`
   - For Render: `https://your-app.onrender.com`

### 3. Cloudinary Setup (Optional)

1. Create account at [Cloudinary](https://cloudinary.com)
2. Get your cloud name, API key, and API secret from dashboard
3. Configure upload presets if needed

---

## Deployment Options

## Option 1: Deploy to Vercel

### Step 1: Prepare for Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Create `vercel.json` in project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

3. Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js --external:bcrypt --external:@mapbox/node-pre-gyp",
    "start": "node dist/index.js",
    "vercel-build": "npm run build"
  }
}
```

### Step 2: Deploy to Vercel

1. **Via Vercel Dashboard** (Recommended):
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

2. **Via CLI**:
```bash
vercel --prod
```

### Step 3: Configure Environment Variables

In Vercel Dashboard:
1. Go to your project settings
2. Add all environment variables listed above
3. Redeploy if necessary

### Vercel-Specific Notes

- Vercel automatically handles builds
- Database connections are persistent across requests
- Static files are served via CDN
- Supports custom domains

---

## Option 2: Deploy to Render

### Step 1: Prepare for Render

1. Create `render.yaml` in project root:
```yaml
services:
  - type: web
    name: clubify
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

2. Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js --external:bcrypt",
    "start": "node dist/index.js"
  }
}
```

### Step 2: Deploy to Render

1. **Via Render Dashboard**:
   - Visit [render.com](https://render.com)
   - Connect your GitHub repository
   - Choose "Web Service"
   - Configure build and start commands
   - Add environment variables
   - Deploy

2. **Auto-deploy**: Enable auto-deploy from main branch

### Step 3: Configure Environment Variables

In Render Dashboard:
1. Go to your service settings
2. Add all environment variables
3. Save and redeploy

### Render-Specific Notes

- Free tier available with limitations
- Automatic SSL certificates
- Git-based deployments
- Built-in monitoring

---

## Option 3: Deploy to Railway

### Step 1: Prepare for Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

### Step 2: Deploy to Railway

1. **Via Railway Dashboard**:
   - Visit [railway.app](https://railway.app)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

2. **Via CLI**:
```bash
railway link
railway up
```

### Railway-Specific Notes

- PostgreSQL and MongoDB add-ons available
- Easy scaling options
- Built-in metrics and logging

---

## Option 4: Deploy to DigitalOcean App Platform

### Step 1: Prepare for DigitalOcean

1. Create `Dockerfile` in project root:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### Step 2: Deploy to DigitalOcean

1. Visit [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Create new app from GitHub repository
3. Configure environment variables
4. Set run command: `npm start`
5. Deploy

---

## Post-Deployment Checklist

### 1. Verify Environment Variables
- [ ] All required environment variables are set
- [ ] Database connection is working
- [ ] Google OAuth is configured correctly

### 2. Test Core Functionality
- [ ] User registration and login works
- [ ] Club creation and management works
- [ ] File uploads work (if Cloudinary is configured)
- [ ] Real-time features work (chat, meetings)

### 3. Configure Custom Domain (Optional)
- [ ] Add custom domain to hosting platform
- [ ] Update Google OAuth redirect URIs
- [ ] Configure SSL certificate

### 4. Set Up Monitoring
- [ ] Configure error tracking (Sentry, LogRocket, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring

---

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify MongoDB URI is correct
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has proper permissions

2. **OAuth Authentication Errors**
   - Verify Google OAuth credentials
   - Check redirect URIs match exactly
   - Ensure callback URLs are correct

3. **Build Errors**
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json
   - Clear node_modules and reinstall

4. **Performance Issues**
   - Enable compression middleware
   - Optimize database queries
   - Use CDN for static assets

### Getting Help

- Check application logs in your hosting platform
- Review MongoDB Atlas logs
- Test OAuth flow in development
- Check network connectivity

---

## Production Optimizations

### Security
- Use HTTPS only
- Set secure session cookies
- Implement rate limiting
- Validate all user inputs
- Use CORS properly

### Performance
- Enable gzip compression
- Use database indexing
- Implement caching where appropriate
- Optimize images and assets
- Use connection pooling

### Monitoring
- Set up health checks
- Monitor database performance
- Track error rates
- Monitor response times

---

## Scaling Considerations

### Database
- Use MongoDB Atlas clusters for high availability
- Implement read replicas for read-heavy workloads
- Consider sharding for very large datasets

### Application
- Use load balancers for multiple instances
- Implement horizontal scaling
- Use caching layers (Redis)
- Consider microservices architecture for complex features

### File Storage
- Use CDN for image delivery
- Implement image optimization
- Consider multiple storage regions

---

This guide should help you successfully deploy Clubify to production. Choose the platform that best fits your needs and budget.