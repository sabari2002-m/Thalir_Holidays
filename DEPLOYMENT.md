# Thalir Holidays - Render.com Deployment Guide

## Free Deployment on Render.com

Railway free tier has expired. This project is now configured to deploy on **Render.com** which offers a generous free tier perfect for Node.js applications.

### Prerequisites
- A GitHub account (to connect your repository)
- A Render.com account (free signup at https://render.com)

### Deployment Steps

#### 1. Push Your Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit for Render deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### 2. Deploy on Render.com

1. **Sign up/Login** to [Render.com](https://render.com)

2. **Create New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub repository
   - Select the `Thalir` repository

3. **Configure Your Service**
   - **Name**: `thalir-holidays` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Select **Free**

4. **Set Environment Variables**
   Go to the "Environment" tab and add:
   ```
   NODE_ENV=production
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   SENDGRID_FROM_EMAIL=noreply@thalirholidays.com
   NOTIFICATION_EMAIL=sabarimanickaraj269@gmail.com
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - You'll get a free URL like: `https://thalir-holidays.onrender.com`

### Important Notes

- **Free Tier Limitations**: 
  - 750 hours/month free compute time
  - Service spins down after 15 minutes of inactivity
  - First request after idle may take 30-60 seconds (cold start)
  - 512 MB RAM
  
- **Database**: Your SQLite database will persist on Render's disk storage

- **Auto-Deploy**: Render automatically deploys when you push to your GitHub main branch

### Alternative: Using render.yaml (Blueprint)

The project includes a `render.yaml` file for automated deployment:

1. In Render Dashboard, click "New +" → "Blueprint"
2. Connect your GitHub repository
3. Render will automatically read the `render.yaml` and configure everything
4. Just add your environment variables and deploy!

### Local Testing

Before deploying, test locally:
```bash
npm install
npm start
```
Visit: http://localhost:3000

### Troubleshooting

- **Build Fails**: Check Node.js version matches (≥18.0.0)
- **Database Errors**: SQLite may need initialization on first deploy
- **Email Not Working**: Verify SendGrid API key is correctly set

### Get Support
- Render Docs: https://render.com/docs
- Render Community: https://community.render.com

---

**Previous Setup**: Railway (deprecated - free tier expired)
