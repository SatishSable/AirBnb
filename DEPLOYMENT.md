# 🚀 Deployment Checklist for WanderLust

## ✅ Pre-Deployment Verification

### 1. Code Quality
- [x] All EJS syntax errors fixed
- [x] No console errors in browser
- [x] All routes working properly
- [x] Forms validation working
- [x] Image uploads functional
- [x] Authentication working (local + OAuth)

### 2. Environment Configuration
- [x] `.env` file exists with all required variables
- [x] `.env` is listed in `.gitignore`
- [x] MongoDB Atlas connection configured
- [x] Cloudinary credentials configured
- [x] Mapbox token configured
- [x] Session secret is strong and unique
- [ ] Razorpay keys configured (optional)
- [ ] Google OAuth configured (optional)

### 3. Database
- [x] MongoDB Atlas cluster created
- [x] Database user created with proper permissions
- [x] IP whitelist configured (0.0.0.0/0 for production)
- [x] Connection string tested
- [x] Sample data populated (optional)

### 4. Security
- [x] Sensitive files in `.gitignore`
- [x] Strong session secret
- [x] Password hashing enabled
- [x] Security headers configured
- [x] HTTP-only cookies enabled
- [x] Input validation with Joi
- [x] CSRF protection implemented

### 5. Package.json Configuration
- [x] `start` script: `"node app.js"`
- [x] `dev` script: `"nodemon app.js"`
- [x] `engines` field specifies Node version
- [x] All dependencies listed
- [x] No dev dependencies in production

### 6. Application Files
- [x] `app.js` - Main application file
- [x] All models defined
- [x] All routes configured
- [x] All controllers implemented
- [x] Middleware configured
- [x] Static files in `public/`
- [x] Views in `views/`

## 🌐 Deployment Steps

### Option 1: Deploy to Render (Recommended)

#### Step 1: Prepare Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create GitHub repository and push
git branch -M main
git remote add origin <your-github-url>
git push -u origin main
```

#### Step 2: Create Render Web Service
1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `wanderlust-app` (or your choice)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or paid for better performance)

#### Step 3: Add Environment Variables
In Render dashboard, go to "Environment" tab and add:

```
CLOUDINARY_CLOUD_NAME=<your_value>
CLOUDINARY_KEY=<your_value>
CLOUDINARY_SECRET=<your_value>
Map_Token=<your_value>
ATLASDB_URL=<your_mongodb_atlas_url>
SESSION_SECRET=<strong_random_string>
RAZORPAY_KEY_ID=<your_value>  # Optional
RAZORPAY_KEY_SECRET=<your_value>  # Optional
GOOGLE_CLIENT_ID=<your_value>  # Optional
GOOGLE_CLIENT_SECRET=<your_value>  # Optional
GOOGLE_CALLBACK_URL=https://your-app.onrender.com/auth/google/callback
```

#### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for build and deployment (5-10 minutes)
3. Check logs for any errors
4. Access your app at the provided URL

#### Step 5: Update OAuth Callback URLs
If using Google OAuth:
1. Go to Google Cloud Console
2. Update authorized redirect URIs with your Render URL
3. Add: `https://your-app.onrender.com/auth/google/callback`

### Option 2: Deploy to Heroku

#### Step 1: Install Heroku CLI
Download from: https://devcenter.heroku.com/articles/heroku-cli

#### Step 2: Login and Create App
```bash
heroku login
heroku create your-app-name
```

#### Step 3: Set Environment Variables
```bash
heroku config:set CLOUDINARY_CLOUD_NAME=<your_value>
heroku config:set CLOUDINARY_KEY=<your_value>
heroku config:set CLOUDINARY_SECRET=<your_value>
heroku config:set Map_Token=<your_value>
heroku config:set ATLASDB_URL=<your_mongodb_atlas_url>
heroku config:set SESSION_SECRET=<strong_random_string>
heroku config:set RAZORPAY_KEY_ID=<your_value>
heroku config:set RAZORPAY_KEY_SECRET=<your_value>
heroku config:set GOOGLE_CLIENT_ID=<your_value>
heroku config:set GOOGLE_CLIENT_SECRET=<your_value>
heroku config:set GOOGLE_CALLBACK_URL=https://your-app.herokuapp.com/auth/google/callback
```

#### Step 4: Deploy
```bash
git push heroku main
```

#### Step 5: Open App
```bash
heroku open
```

### Option 3: Deploy to Railway

1. Go to https://railway.app/
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables
5. Deploy automatically

### Option 4: Deploy to Vercel (Frontend) + Render (Backend)

**Note**: This requires separating frontend and backend, which is not the current architecture.

## 🧪 Post-Deployment Testing

### 1. Basic Functionality
- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Static assets (CSS, JS, images) load
- [ ] No console errors

### 2. Authentication
- [ ] Signup works
- [ ] Login works
- [ ] Logout works
- [ ] Google OAuth works (if configured)
- [ ] Session persists across pages

### 3. CRUD Operations
- [ ] Create listing works
- [ ] View listing works
- [ ] Edit listing works
- [ ] Delete listing works
- [ ] Same for vehicles and dhabas

### 4. Image Upload
- [ ] Images upload to Cloudinary
- [ ] Images display correctly
- [ ] Image URLs are HTTPS

### 5. Bookings
- [ ] Booking creation works
- [ ] Payment page loads
- [ ] Booking confirmation works
- [ ] Bookings appear in dashboard

### 6. Reviews
- [ ] Can create reviews
- [ ] Reviews display correctly
- [ ] Can delete own reviews

### 7. Admin Features
- [ ] Admin dashboard accessible
- [ ] Can manage all listings
- [ ] Can delete any content

### 8. Performance
- [ ] Page load time < 3 seconds
- [ ] Images optimized
- [ ] No memory leaks
- [ ] Database queries optimized

## 🐛 Troubleshooting

### Issue: Build fails on Render
**Check**:
- Node version in `package.json` engines
- All dependencies in `package.json`
- Build logs for specific errors

### Issue: App crashes after deployment
**Check**:
- Environment variables are set correctly
- MongoDB connection string is correct
- Logs for error messages

### Issue: Images not uploading
**Check**:
- Cloudinary credentials
- File size limits
- Network connectivity

### Issue: Database connection fails
**Check**:
- MongoDB Atlas IP whitelist (should include 0.0.0.0/0)
- Connection string format
- Database user permissions

### Issue: Session not working
**Check**:
- SESSION_SECRET is set
- MongoDB store is connected
- Cookie settings (secure flag for HTTPS)

## 📊 Monitoring

### After Deployment
1. **Monitor Logs**: Check application logs regularly
2. **Database Usage**: Monitor MongoDB Atlas usage
3. **Error Tracking**: Set up error tracking (e.g., Sentry)
4. **Uptime Monitoring**: Use UptimeRobot or similar
5. **Performance**: Monitor response times

### Recommended Tools
- **Logs**: Render/Heroku built-in logs
- **Errors**: Sentry, LogRocket
- **Uptime**: UptimeRobot, Pingdom
- **Analytics**: Google Analytics
- **Performance**: New Relic, DataDog

## 🔄 Continuous Deployment

### Set up automatic deployment:
1. Connect GitHub to Render/Heroku
2. Enable auto-deploy from main branch
3. Every push to main triggers deployment
4. Monitor deployment status

## 📝 Final Checklist

Before going live:
- [ ] All features tested
- [ ] All environment variables set
- [ ] Database backed up
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] SEO optimized
- [ ] Analytics configured
- [ ] Domain configured (optional)
- [ ] SSL certificate active (automatic on Render/Heroku)

## 🎉 Deployment Complete!

Your WanderLust app is now live and ready for users!

**Next Steps**:
1. Share the URL with users
2. Monitor for issues
3. Gather feedback
4. Iterate and improve

---

**Deployment Date**: _____________
**Deployed URL**: _____________
**Deployed By**: Satish Sable
