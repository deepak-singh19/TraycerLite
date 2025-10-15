# Frontend Deployment Guide

## Backend URL Configuration

The frontend is configured to work with your Railway backend deployment.

### Environment Variables

The frontend uses environment variables to determine which backend to connect to:

- **Development**: Uses Vite proxy to `http://localhost:3001`
- **Production**: Uses your Railway backend URL

### Environment Files

- `.env.development` - For local development
- `.env.production` - For production deployment

### Current Configuration

```bash
# Development (.env.development)
VITE_API_BASE_URL=/api

# Production (.env.production)  
VITE_API_BASE_URL=https://traycerlite-production.up.railway.app/api
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `frontend`

2. **Environment Variables**:
   - Add `VITE_API_BASE_URL=https://traycerlite-production.up.railway.app/api`

3. **Deploy**: Vercel will automatically deploy on every push

### Option 2: Netlify

1. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Import your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**:
   - Add `VITE_API_BASE_URL=https://traycerlite-production.up.railway.app/api`

### Option 3: Railway (Same as Backend)

1. **Create new Railway project**
2. **Set root directory to `frontend`**
3. **Add environment variable**:
   ```
   VITE_API_BASE_URL=https://traycerlite-production.up.railway.app/api
   ```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will:
- Run on `http://localhost:3000`
- Proxy API calls to `http://localhost:3001` (your local backend)

## Production Build

```bash
# Build for production
npm run build

# The built files will be in the `dist` directory
```

## API Endpoints

The frontend will connect to these backend endpoints:

- `GET /health` - Health check
- `POST /api/analyze` - Task analysis
- `POST /api/plan` - Generate plans
- `GET /api/plan-status` - Check plan status
- `POST /api/execute` - Execute phases
- `GET /api/stats` - Get statistics

## Troubleshooting

### CORS Issues
- The backend is configured to allow all origins
- If you encounter CORS issues, check the backend CORS configuration

### API Connection Issues
- Verify the `VITE_API_BASE_URL` environment variable is set correctly
- Check that the Railway backend is running and accessible
- Test the backend health endpoint: `https://traycerlite-production.up.railway.app/health`

### Build Issues
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run build`
- Verify environment variables are set correctly
