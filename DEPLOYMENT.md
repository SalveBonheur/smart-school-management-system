# Deploy Smart School Transport System to Render

This guide will help you deploy your Smart School Transport System to Render.com.

## Prerequisites

- A Render.com account (free tier is sufficient)
- GitHub repository with your code
- Git installed locally

## Step 1: Push to GitHub

1. Make sure all your changes are committed and pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Create Render Account

1. Sign up at [render.com](https://render.com)
2. Connect your GitHub account
3. Grant Render access to your repository

## Step 3: Deploy Using render.yaml

The easiest way to deploy is using the `render.yaml` file that's already configured:

1. Go to your Render dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect your `render.yaml` configuration
5. Click "Create Web Service"

## Step 4: Configure Environment Variables

Render will automatically set the environment variables defined in `render.yaml`, but you may want to customize:

1. Go to your service dashboard
2. Click "Environment" tab
3. Add or modify environment variables as needed:
   - `NODE_ENV`: production (already set)
   - `PORT`: 10000 (already set)
   - `DB_TYPE`: sqlite (already set)
   - `JWT_SECRET`: auto-generated (already set)
   - `CORS_ORIGIN`: update with your actual Render URL

## Step 5: Database Configuration

### Option 1: SQLite (Default)
- No additional configuration needed
- Database file will be created automatically
- Note: SQLite data will be lost on redeployment

### Option 2: PostgreSQL (Recommended for production)
1. Uncomment the PostgreSQL section in `render.yaml`
2. Update your server code to use PostgreSQL connection
3. Render will provide connection details via environment variables

## Step 6: Monitor Deployment

1. Watch the build logs in Render dashboard
2. Once deployed, your app will be available at: `https://your-app-name.onrender.com`
3. Check the health endpoint: `https://your-app-name.onrender.com/api/health`

## Step 7: Post-Deployment Setup

1. Update your CORS_ORIGIN to match your actual Render URL
2. Test all functionality including:
   - User registration/login
   - Dashboard access
   - API endpoints
3. Set up custom domain if needed (Render supports this)

## Troubleshooting

### Common Issues:

1. **Build fails**:
   - Check build logs for errors
   - Ensure `package.json` has correct scripts
   - Verify all dependencies are properly listed

2. **App not responding**:
   - Check health endpoint: `/api/health`
   - Verify PORT is set to 10000
   - Check server logs for errors

3. **CORS issues**:
   - Update CORS_ORIGIN environment variable
   - Ensure it matches your Render URL exactly

4. **Database issues**:
   - For SQLite: Check file permissions
   - For PostgreSQL: Verify connection string and credentials

### Useful Commands:

```bash
# Check app status
curl https://your-app-name.onrender.com/api/health

# View logs (in Render dashboard)
# Go to Service → Logs tab
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | production | Application environment |
| PORT | 10000 | Server port (Render requires 10000) |
| DB_TYPE | sqlite | Database type (sqlite/mysql) |
| JWT_SECRET | auto-generated | JWT signing secret |
| JWT_EXPIRE | 7d | JWT expiration time |
| CORS_ORIGIN | your-app.onrender.com | Allowed CORS origins |

## Production Considerations

1. **Database**: Consider using PostgreSQL for production instead of SQLite
2. **File Uploads**: Render's filesystem is ephemeral, consider using cloud storage
3. **Scaling**: Monitor performance and upgrade plan if needed
4. **Security**: Keep dependencies updated and monitor security advisories
5. **Backups**: Set up regular database backups if using PostgreSQL

## Support

- Render documentation: https://render.com/docs
- Community support: https://community.render.com
- Your app logs and metrics are available in the Render dashboard
