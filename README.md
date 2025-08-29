# 🐾 HeartPet - Emotional Wellness Companion

A mobile-first web application that helps users adopt a personal pet that evolves by completing tiny 1-3 minute "Care Quests" based on their emotional state. The core AI loop is: emotion input → empathetic reflection → one suggestion → verified completion → XP → pet evolution.

## ✨ Features

### 🏠 **Home Page**
- **Pet Display**: Shows your pet's image, name, level, stage, and XP progress
- **Hero Intro**: Personalized greeting from your pet explaining the app
- **Quick Check In**: Fast mood logging without full AI coach flow
- **Check In & Care**: Full AI-powered emotional wellness journey
- **View Collection**: Complete history of check-ins and completed actions
- **How It Works**: 4-step process explanation (Check in → AI reflects → Care Quest → Bloom)

### 🐕 **Pet System**
- **3 Pet Species**: Doggo, Kitten, and Dragon with custom images
- **Level Progression**: Egg stage (Level 1) → Actual pet (Level 2+)
- **XP System**: 10 XP for Level 1, 20 XP from Level 5 onwards
- **Stage Evolution**: Egg → Hatchling → Sproutling → Floof
- **Custom Images**: 
  - Level 1: `egg_classic_full.png`
  - Doggo: `dog-beagle-2.png`
  - Kitten: `cat-graywhite.png`
  - Dragon: `dragon_red.PNG`

### 📱 **Check-In System**
- **Text Input**: Share your thoughts and feelings
- **Emoji Slider**: Mood selection from 😢 to 😊
- **Optional Context**: Selfie and surroundings photos
- **Weather Integration**: Automatic weather data for context-aware suggestions
- **Quick Check In**: Simple modal for fast mood logging
- **Full Check In**: Complete flow with AI analysis and recommendations

### 🤖 **AI-Powered Features**
- **Emotional Analysis**: GPT-4o-mini analyzes text, images, and weather
- **Personalized Reflection**: Empathetic responses tailored to your situation
- **Context-Aware Insights**: 
  - Selfie analysis for emotional cues
  - Surroundings analysis for environmental context
  - Weather insights for outdoor/indoor recommendations
- **Care Quest Generation**: 1-3 minute micro-actions based on your needs
- **Weather-Aware Suggestions**: Activities adapted to current weather conditions

### 🎯 **Care Quests**
- **5 Categories**: Connect, Tidy, Nourish, Soothe, Reset
- **Personalized Scoring**: 
  - Cosine similarity for semantic matching
  - Category weight based on user preferences
  - Energy level matching
  - Novelty scoring to avoid repetition
  - Weather affinity for outdoor/indoor activities
- **Timer System**: 1-3 minute countdown with progress tracking
- **Foreground Detection**: Ensures user stays engaged
- **Hold-to-Complete**: 2-second hold gesture for completion
- **Reset Function**: Get new suggestions based on feedback

### 📊 **Collection & History**
- **Check-ins Tab**: Complete history of emotional check-ins with timestamps
- **Actions Tab**: All completed Care Quests with categories, duration, and XP earned
- **Visual Timeline**: See your emotional wellness journey over time
- **Feedback System**: Thumbs up/down for completed actions

### 🔐 **Authentication**
- **Google OAuth**: Seamless sign-in with Google
- **Email/Password**: Traditional authentication option
- **Session Management**: Secure JWT-based sessions
- **User Profiles**: Personalized experience for each user

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Vercel Postgres recommended)
- OpenAI API key
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/heartpet.git
   cd heartpet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   POSTGRES_URL=your_postgres_connection_string
   
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # Authentication
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Vercel (if deploying)
   VERCEL_URL=your_vercel_url
   ```

4. **Set up the database**
   ```bash
   npm run migrate
   npm run seed:milvus
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
HeartPet/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/          # AI emotional analysis
│   │   │   ├── checkin/          # Quick check-in storage
│   │   │   ├── checkins/         # Check-in history retrieval
│   │   │   ├── coach/            # Main AI orchestration
│   │   │   ├── complete/         # Action completion & XP
│   │   │   ├── executions/       # Action history retrieval
│   │   │   ├── pet/              # Pet management
│   │   │   ├── recommend/        # Care Quest recommendations
│   │   │   └── weather/          # Weather data
│   │   ├── action/               # Care Quest execution page
│   │   ├── checkin/              # Full check-in flow
│   │   ├── coach/                # AI reflection & suggestions
│   │   ├── collection/           # User history & progress
│   │   ├── completion/           # Quest completion celebration
│   │   ├── onboarding/           # Pet creation
│   │   └── page.tsx              # Home page
│   ├── components/
│   │   ├── CameraSheet.tsx       # Photo capture component
│   │   ├── HeartPetLogo.tsx      # App logo
│   │   ├── HomeIntro.tsx         # Hero section
│   │   ├── HowItWorks.tsx        # Process explanation
│   │   ├── PetImage.tsx          # Pet display component
│   │   └── SafetyBanner.tsx      # Crisis support
│   ├── lib/
│   │   ├── auth.ts               # NextAuth configuration
│   │   ├── database.ts           # Database helpers
│   │   └── milvus.ts             # Vector database client
│   └── types/
│       └── index.ts              # TypeScript definitions
├── scripts/
│   ├── add-more-actions.ts       # Add new Care Quests
│   ├── add-user-actions.ts       # User-provided actions
│   ├── check-database-schema.ts  # Database verification
│   ├── debug-llm-process.ts      # LLM debugging
│   ├── remove-deep-breaths.ts    # Remove specific actions
│   ├── seed-milvus.ts            # Vector database seeding
│   └── show-database-state.ts    # Database inspection
├── public/
│   └── pets/                     # Pet images
└── package.json
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run migrate          # Run database migrations
npm run seed:milvus      # Seed vector database with actions

# Utilities
npm run show:db          # Show database state
npm run debug:llm        # Debug LLM processing
npm run remove:breaths   # Remove specific actions
npm run add:user:actions # Add user-provided actions
npm run update:pet:species # Update pet species names
npm run check:db:schema  # Check database schema

# Deployment
npm run deploy           # Deploy to Vercel
```

## 🔧 API Endpoints

### Core Endpoints
- `POST /api/checkin` - Save quick check-in
- `POST /api/coach` - Main AI orchestration
- `POST /api/analyze` - Emotional analysis
- `POST /api/recommend` - Care Quest recommendations
- `POST /api/complete` - Complete action & earn XP

### Data Retrieval
- `GET /api/checkins` - Get user's check-in history
- `GET /api/executions` - Get user's completed actions
- `GET /api/pet` - Get user's pet data
- `GET /api/weather` - Get weather data

### Pet Management
- `POST /api/pet` - Create new pet
- `PUT /api/pet` - Update pet details

## 🎨 Design System

### Colors
- **Primary**: Green (#22c55e) - Growth and wellness
- **Secondary**: Blue (#3b82f6) - Trust and calm
- **Accent**: Purple (#8b5cf6) - Creativity and magic
- **Background**: Light gradients for warmth

### Typography
- **Headings**: Bold, dark gray for hierarchy
- **Body**: Regular weight, black for readability
- **Captions**: Small, gray for secondary information

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Inputs**: Clean borders, focus states
- **Modals**: Overlay backgrounds, centered content

## 🧠 AI Architecture

### Analysis Pipeline
1. **Input Processing**: Text, images, weather data
2. **Vision Analysis**: Selfie and surroundings insights
3. **Weather Analysis**: Outdoor/indoor suitability
4. **Emotional Analysis**: Mood, energy, focus detection
5. **Reflection Generation**: Personalized empathetic response

### Recommendation Engine
1. **Query Building**: Semantic search from user input
2. **Vector Search**: Milvus similarity matching
3. **Scoring Algorithm**: Multi-factor personalization
4. **LLM Composition**: Creative adaptation of actions
5. **Weather Integration**: Context-aware suggestions

## 📊 Database Schema

### Core Tables
- `users` - User accounts and preferences
- `pets` - Pet data and progression
- `checkins` - Emotional check-in history
- `actions` - Available Care Quests
- `executions` - Completed actions
- `category_weights` - User preference learning

### Vector Collections (Milvus)
- `content_vectors` - Action embeddings for semantic search
- `user_memories` - User interaction history

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Environment Variables
```env
# Required
POSTGRES_URL=
OPENAI_API_KEY=
NEXTAUTH_SECRET=

# Optional
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MILVUS_URL=
MILVUS_TOKEN=
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4o-mini and embeddings
- Vercel for hosting and Postgres
- Next.js for the framework
- Tailwind CSS for styling
- The AI NextGen hackathon community

---

**Made with ❤️ for emotional wellness and personal growth**
