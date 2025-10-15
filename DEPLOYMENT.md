# Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **OpenAI API Key**: You'll need this for the AI features

## Deployment Steps

### 1. Connect to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `backend` folder as the root directory

### 2. Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Deploy

Railway will automatically:
- Install dependencies (`npm ci`)
- Build the project (`npm run build`)
- Start the server (`npm start`)

### 4. Verify Deployment

1. Check the deployment logs in Railway dashboard
2. Visit your Railway URL + `/health` to verify the server is running
3. Test the API endpoints

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` | Yes |
| `PORT` | Server port (Railway sets this automatically) | No |
| `OPENAI_API_KEY` | Your OpenAI API key for AI features | Yes |

## API Endpoints

Once deployed, your API will be available at:
- `https://your-app.railway.app/health` - Health check
- `https://your-app.railway.app/api/analyze` - Task analysis
- `https://your-app.railway.app/api/plan` - Generate plans
- `https://your-app.railway.app/api/plan-status` - Check plan status

## Troubleshooting

### Build Issues
- Check that all TypeScript files compile (`npm run build`)
- Ensure all dependencies are in `package.json`

### Runtime Issues
- Check Railway logs for error messages
- Verify environment variables are set correctly
- Ensure `OPENAI_API_KEY` is valid

### CORS Issues
- The server is configured to allow all origins in production
- If you need specific origins, update the CORS configuration

## Monitoring

Railway provides:
- Real-time logs
- Metrics and monitoring
- Automatic restarts on failure
- Health checks

## Custom Domain (Optional)

1. Go to your Railway project settings
2. Add a custom domain
3. Configure DNS records as instructed
