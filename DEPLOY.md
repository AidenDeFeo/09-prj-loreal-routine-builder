# Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Netlify (Recommended)
1. **Connect Repository**: Link your GitHub repo to Netlify
2. **Configure Build Settings**:
   - Build command: `echo "No build needed"`
   - Publish directory: `.` (root)
   - Functions directory: `netlify/functions`
3. **Set Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
4. **Custom Domain**: Change site name to `loreal-routine-builder`
5. **Deploy**: Automatic deployment on every push to main

**Result**: https://loreal-routine-builder.netlify.app

### Option 2: GitHub Pages
1. **Enable GitHub Pages**:
   - Go to repo Settings > Pages
   - Source: GitHub Actions
2. **Push to main**: Automatic deployment via GitHub Actions
3. **Access**: https://aidendefeo.github.io/09-prj-loreal-routine-builder

### Option 3: Vercel
1. **Import Project**: Connect GitHub repo to Vercel
2. **Deploy**: Automatic deployment with zero configuration
3. **Custom Domain**: Change to `loreal-routine-builder`

**Result**: https://loreal-routine-builder.vercel.app

## 🔐 Environment Setup

### Required Environment Variables:
- `OPENAI_API_KEY`: Your OpenAI API key for GPT-4o model

### Local Development:
```bash
# Clone repository
git clone https://github.com/AidenDeFeo/09-prj-loreal-routine-builder.git
cd 09-prj-loreal-routine-builder

# Add your API key to secrets.js
echo "const OPENAI_API_KEY = 'your-api-key-here';" > secrets.js

# Start local server
python -m http.server 8080
```

## 🌐 Production Considerations

### Security:
- API keys are handled server-side via Netlify Functions
- No sensitive data exposed in client-side code
- CORS properly configured for cross-origin requests

### Performance:
- Optimized images with lazy loading
- Debounced search to reduce API calls
- LocalStorage for offline functionality
- CSS/JS minification in production

### SEO & Analytics:
- Semantic HTML structure
- Open Graph meta tags ready
- Google Analytics integration ready
- Sitemap generation configured

## 📱 Mobile Optimization

- Responsive breakpoints for all screen sizes
- Touch-friendly interface elements
- iOS/Android PWA support ready
- Fast loading on mobile networks
