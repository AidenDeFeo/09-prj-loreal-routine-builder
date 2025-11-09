# Deploy to Netlify

This project is ready for deployment to Netlify with secure serverless functions.

## 🚀 Deployment Steps

### Option 1: GitHub Integration (Recommended)
1. **Push to GitHub** (if not already done)
2. **Go to [Netlify](https://netlify.com)** and sign up/login
3. **Click "Add new site" → "Import an existing project"**
4. **Connect GitHub** and select this repository
5. **Configure build settings:**
   - Build command: (leave empty)
   - Publish directory: `.`
6. **Click "Deploy site"**
7. **Add environment variables:**
   - Go to Site Settings → Environment variables
   - Add: `OPENAI_API_KEY` = `your-openai-api-key-here`
8. **Redeploy** to apply the environment variable

### Option 2: CLI Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod

# Set environment variable
netlify env:set OPENAI_API_KEY sk-proj-your-actual-key-here
```

## 🔒 Security Features
- ✅ **API key stored securely** in environment variables
- ✅ **Serverless functions** handle OpenAI calls on the backend  
- ✅ **CORS enabled** for proper web functionality
- ✅ **No sensitive data** exposed to the client

## 🌐 Your Permanent URL
After deployment, you'll get a permanent URL like:
```
https://your-app-name.netlify.app
```

This URL will:
- ✅ **Never expire**
- ✅ **Work with full AI functionality**
- ✅ **Be secure and production-ready**
- ✅ **Update automatically** when you push changes

## 📁 File Structure
```
├── index.html              # Main HTML file
├── script.js              # Frontend JavaScript
├── style.css              # Styling
├── products.json          # Product database
├── netlify.toml          # Netlify configuration
├── package.json          # Node.js configuration
└── netlify/
    └── functions/
        ├── generate-routine.js  # AI routine generation
        └── chat.js             # AI chat responses
```