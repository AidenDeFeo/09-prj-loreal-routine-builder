# Project 9: L'Oréal Routine Builder

L'Oréal is expanding what's possible with AI, and now your chatbot is getting smarter. This week, you'll upgrade it into a product-aware routine builder.

Users will be able to browse real L'Oréal brand products, select the ones they want, and generate a personalized routine using AI. They can also ask follow-up questions about their routine—just like chatting with a real advisor.

#open game
https://691107aada8929f5e089d5d2--animated-sorbet-ce1289.netlify.app/

## 🚀 Quick Start

### Option 1: Local Development

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` (Note: AI features won't work locally without backend)

### Option 2: Deploy to Netlify (Recommended)

1. **Fork this repository** to your GitHub account
2. **Sign up for Netlify** at [netlify.com](https://netlify.com)
3. **Connect your GitHub** and select this repository
4. **Add environment variable:**
   - Go to Site Settings → Environment Variables
   - Add: `OPENAI_API_KEY` = `your-openai-api-key-here`
5. **Deploy** - Netlify will automatically build and deploy

Your site will get a permanent URL like: `https://your-app-name.netlify.app`

### 🔧 Manual Netlify Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir .

# Set environment variable
netlify env:set OPENAI_API_KEY your-openai-api-key-here
```

## ✨ Features

- Browse L'Oréal products by category
- Select products with visual feedback
- Generate AI-powered personalized routines
- Ask questions about beauty and skincare
- Responsive design for all devices
