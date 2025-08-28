# 🐾 HeartPet - Emotional Wellness Companion

A mobile-first web app where users adopt evolving pets through AI-powered care quests. Transform feelings into gentle actions and watch your pet grow!

## ✨ Features

- **Personal Pet Adoption**: Choose from seedling spirits, cloud kittens, or pocket dragons
- **AI-Powered Care Quests**: LLM analyzes emotions → suggests micro-actions → pet gets XP
- **Pet Evolution**: egg → hatchling → sproutling → floof (50/100/150 XP)
- **Camera Integration**: Optional selfie/surroundings scan for mood cues
- **Personalization**: Learns from your preferences and feedback
- **Safety First**: Crisis detection and content moderation
- **Mobile Optimized**: Beautiful UI designed for phones

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API routes + Auth.js (Google OAuth)
- **Database**: Vercel Postgres
- **AI**: OpenAI (gpt-4o-mini + text-embedding-3-small)
- **Vector Search**: Milvus (Zilliz Cloud)
- **Animations**: Rive (preferred) or Lottie
- **Deployment**: Vercel Pro

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd HeartPet
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your API keys:

```bash
# Edit .env with your actual values
POSTGRES_URL="postgresql://username:password@host:port/database"
POSTGRES_PRISMA_URL="postgresql://username:password@host:port/database?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgresql://username:password@host:port/database"
POSTGRES_USER="your-username"
POSTGRES_HOST="your-host"
POSTGRES_PASSWORD="your-password"
POSTGRES_DATABASE="your-database"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

OPENAI_API_KEY="your-openai-api-key"

MILVUS_URI="https://your-cluster.zillizcloud.com"
MILVUS_USER="your-milvus-username"
MILVUS_PASSWORD="your-milvus-password"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Initialize database with schema and seed data
npm run setup-db
```

### 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see HeartPet in action!

## 🔑 Required API Keys

### **1. Vercel Postgres**
- Get from: [Vercel Dashboard](https://vercel.com/dashboard) → Storage → Create Database
- Free tier: 256MB storage, 100 connections

### **2. Google OAuth**
- Get from: [Google Cloud Console](https://console.cloud.google.com)
- Create OAuth 2.0 credentials for web application
- Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

### **3. OpenAI API**
- Get from: [OpenAI Platform](https://platform.openai.com)
- Required for: AI analysis, embeddings, vision analysis
- Cost: ~$0.01-0.05 per request

### **4. Milvus/Zilliz Cloud**
- Get from: [Zilliz Cloud](https://cloud.zilliz.com)
- Free tier: 1GB storage, 1000 requests/day
- Required for: Vector search of actions

## 📱 User Journey

1. **Sign In** → Google OAuth authentication
2. **Adopt Pet** → Automatic creation of seedling spirit
3. **Check In** → Share feelings + optional camera scan
4. **AI Analysis** → Empathetic response + mood detection
5. **Care Quest** → Personalized micro-action suggestion
6. **Complete Action** → Timer + verification + XP gain
7. **Pet Growth** → Evolution at 50/100/150 XP milestones

## 🛠️ Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run setup-db     # Initialize database & seed data
npm run lint         # Run ESLint
```

## 📊 Database Schema

- **users**: User accounts (NextAuth)
- **pets**: User's adopted pets with XP and evolution stage
- **actions**: Care quests and micro-actions with embeddings
- **checkins**: Emotional check-ins with AI analysis
- **executions**: Completed actions with verification data
- **category_weights**: User preference learning
- **habitat_props**: Unlockable pet environment items

## 🔒 Privacy & Safety

- **No Image Storage**: Camera scans extract cues then discard images
- **Crisis Detection**: Red flag monitoring with appropriate responses
- **Content Moderation**: Rate limiting and harmful content filtering
- **Data Minimization**: Only collect essential user data
- **Secure Authentication**: Google OAuth with JWT sessions

## 🎨 Design System

- **Mobile-First**: Optimized for 360-430px widths
- **Theme Colors**: CSS variables based on mood (green/yellow/blue/orange/violet/pink/rose)
- **Accessibility**: High contrast, touch-friendly targets
- **Animations**: Smooth transitions and pet celebrations

## 🚀 Deployment

### **Vercel (Recommended)**

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Environment Variables for Production**

```bash
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-production-secret"
# ... other variables from .env
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Made with ❤️ for emotional wellness and personal growth**
