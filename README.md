# HeartPet 🌱

A mobile-first web application that creates a **closed-loop emotional wellness experience** through AI-powered micro-actions and pet companionship. Share your feelings, get personalized care quests, and watch your pet evolve as you grow together.

## 🎯 **Core Mission**

HeartPet transforms emotional input into actionable wellness through a unique AI-powered loop:

1. **Emotion Input** → User shares feelings via text, emoji, selfie, surroundings, weather
2. **AI Reflection** → Empathetic analysis and personalized insights  
3. **Care Quest** → 1-3 minute micro-action suggestion
4. **Completion** → XP gain, pet evolution, visual progress
5. **Growth** → Pet levels up and evolves through stages

## 🏠 **Home Page Features**

### **Pet Display & Introduction**
- **Dynamic Pet Image**: Shows current pet with level and name
- **Hero Message**: "Hi, I'm your HeartPet. Share how you're feeling and I'll turn it into a tiny 1–3 min Care Quest. Complete it and I grow! 🌱"
- **Centered Layout**: Pet image prominently displayed in the center

### **Action Buttons**
1. **Check In & Care** - "Share your feelings and get personalized care quests from AI"
2. **View History** - "View your check-ins and completed care quests"  
3. **User Profile** - "Hobbies & Wishlist personalization is under development"
4. **Music Recommendation** - "Mood-based music suggestions is under development"

## 🐾 **Pet System**

### **Species & Evolution**
- **Available Species**: doggo, kitten, dragon
- **Visual Progression**:
  - **Level 1**: Egg (`egg_classic_full.png`)
  - **Level 2**: Hatchling (smaller pet image)
  - **Level 3+**: Full grown pet (full-size image)

### **Leveling System**
- **XP Requirements**:
  - Level 1 → 2: 10 XP
  - Level 2 → 3: 20 XP
  - Level 3+ → Next: 20 XP per level
- **Stage Progression**:
  - Level 1: "egg"
  - Level 2+: "hatchling"
  - Level 7+: "sproutling"
  - Level 10+: "floof"

### **Pet Images**
- **Doggo**: `dog-beagle-2.png`
- **Kitten**: `cat-graywhite.png`
- **Dragon**: `dragon_red.PNG`

## 📝 **Check-In System**

### **Multi-Modal Input**
- **Text Input**: How are you feeling?
- **Emoji Slider**: Mood indicator (-2 to +2)
- **Optional Features**:
  - **Selfie**: Mood and energy analysis
  - **Surroundings**: Environment context
  - **Weather Data**: Temperature, precipitation, daylight

### **AI Analysis**
- **Selfie Insights**: Mood indicators, energy level, facial tension
- **Surroundings Insights**: Environment type, lighting, space organization
- **Weather Insights**: Temperature impact, outdoor suitability
- **Combined Reflection**: Empathetic compilation of all insights

## 🤖 **AI-Powered Features**

### **Analyze API (`/api/analyze`)**
- **Multi-modal Analysis**: Text, emoji, images, weather
- **Vision Processing**: Selfie mood indicators, environment context
- **Weather Integration**: Temperature, precipitation, daylight analysis
- **Output**: Mood, energy, focus tags, empathetic reflection

### **Coach API (`/api/coach`)**
- **Orchestration**: Combines analysis and recommendation
- **Crisis Detection**: Red flag monitoring for safety
- **Weather-Aware Filtering**: Excludes inappropriate outdoor activities
- **User Feedback Integration**: Respects user preferences (e.g., no breathing exercises)

### **Weather-Aware Recommendations**
- **Smart Filtering**: Avoids outdoor activities when weather isn't suitable
- **Context Consideration**: Temperature, precipitation, daylight
- **Indoor Alternatives**: Suggests appropriate indoor activities

## 🎯 **Care Quests**

### **Action Types**
- **Connect**: Social and relationship activities
- **Tidy**: Organization and decluttering
- **Nourish**: Self-care and wellness
- **Soothe**: Relaxation and stress relief
- **Reset**: Energy and focus activities

### **Quest Structure**
- **Duration**: 1-3 minutes
- **Steps**: Clear, actionable instructions
- **Category**: Themed organization
- **Tags**: Detailed categorization (indoor, outdoor, brief, etc.)

### **Completion Flow**
1. **Timer**: Countdown with progress tracking
2. **Step-by-step**: Clear instructions
3. **Hold-to-complete**: 2-second confirmation
4. **Celebration**: XP gain and level up notifications

## 📊 **Collection & History**

### **View History Page**
- **Two Tabs**: Check-ins and Actions
- **Check-ins**: Text, emoji, date/time
- **Actions**: Title, category, duration, XP earned, helpful rating
- **Chronological Order**: Most recent first

### **Data Tracking**
- **Check-ins**: User mood and context history
- **Executions**: Completed action history
- **Feedback**: Helpful/not helpful ratings
- **Personalization**: Category weight learning

## 🔐 **Authentication**

### **NextAuth.js Integration**
- **Google OAuth**: Social login option
- **Credentials Provider**: Email/password fallback
- **JWT Sessions**: Secure session management
- **Route Protection**: Guards all user-specific routes

### **User Management**
- **Automatic Pet Creation**: New users get a default pet
- **Profile Management**: User preferences and settings
- **Data Privacy**: Secure data handling

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### **Installation**
```bash
# Clone the repository
git clone https://github.com/chunghaw/heartpet.git
cd heartpet

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### **Environment Variables**
```env
# Database
POSTGRES_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=sk-...

# Optional: Milvus Vector Database
MILVUS_URL=...
MILVUS_TOKEN=...
```

## 📁 **Project Structure**

```
HeartPet/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── analyze/       # Multi-modal analysis
│   │   │   ├── coach/         # Orchestration
│   │   │   ├── complete/      # Action completion
│   │   │   ├── recommend/     # Action recommendation
│   │   │   └── ...
│   │   ├── checkin/           # Check-in page
│   │   ├── coach/             # Coach page
│   │   ├── action/            # Action page
│   │   ├── completion/        # Completion page
│   │   ├── collection/        # History page
│   │   └── onboarding/        # Pet creation
│   ├── components/            # Reusable components
│   │   ├── PetImage.tsx       # Dynamic pet display
│   │   ├── HomeIntro.tsx      # Hero message
│   │   └── ...
│   ├── lib/                   # Utility libraries
│   │   ├── weather-affinity.ts # Weather scoring
│   │   ├── prompts.ts         # AI prompts
│   │   └── ...
│   └── types/                 # TypeScript definitions
├── scripts/                   # Database utilities
├── public/                    # Static assets
└── ...
```

## 🛠️ **Available Scripts**

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npm run db:migrate             # Run database migrations
npm run db:seed                # Seed initial data
npm run add:more:actions       # Add more action data
npm run add:user:actions       # Add user-specific actions
npm run update:pet:species     # Update legacy pet species
npm run check:db:schema        # Check database schema
npm run delete:user            # Delete user and all data

# Utilities
npm run lint                   # Run ESLint
npm run type-check             # TypeScript type checking
```

## 🔌 **API Endpoints**

### **Core APIs**
- `POST /api/analyze` - Multi-modal input analysis
- `POST /api/coach` - Orchestrated experience
- `POST /api/complete` - Action completion and XP
- `POST /api/recommend` - Action recommendation
- `GET /api/pet` - Get user's pet data
- `POST /api/checkin` - Save quick check-in
- `GET /api/checkins` - Get check-in history
- `GET /api/executions` - Get action history

### **Authentication**
- `GET /api/auth/signin` - Sign in
- `GET /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

## 🎨 **Design System**

### **Color Palette**
- **Primary**: Green (#22c55e) - Growth and wellness
- **Secondary**: Blue (#3b82f6) - Trust and calm
- **Accent**: Purple (#8b5cf6) - Creativity and play
- **Neutral**: Gray scale for text and backgrounds

### **Typography**
- **Headings**: Bold, clear hierarchy
- **Body**: Readable, mobile-optimized
- **Buttons**: Large, touch-friendly

### **Layout**
- **Mobile-First**: Responsive design
- **Card-Based**: Clean, organized content
- **Centered**: Focused user experience

## 🤖 **AI Architecture**

### **Multi-Modal Analysis**
```typescript
// Input processing
const analysis = {
  selfie_insights: "Mood and energy from selfie",
  surroundings_insights: "Environment context",
  weather_insights: "Weather impact on mood",
  reflection: "Combined empathetic response",
  mood: "calm|happy|playful|focused|sensitive|creative|intense",
  energy: "low|medium|high",
  focus: ["tag1", "tag2", "tag3"]
}
```

### **Weather-Aware Scoring**
```typescript
// Weather affinity function
if (!cues.good_outdoor_brief && set.has("outdoor")) score -= 0.15;
if (cues.weather === "cold" && set.has("outdoor")) score -= 0.10;
```

### **Vector Search**
- **Embeddings**: OpenAI text-embedding-3-small
- **Semantic Search**: Find contextually relevant actions
- **Fallback**: Postgres cosine similarity

## 🗄️ **Database Schema**

### **Core Tables**
```sql
-- Users and pets
users (id, email, created_at)
pets (id, user_id, name, species, color, size, stage, xp, level, created_at)

-- Actions and quests
actions (id, title, steps[], seconds, category, tags[], why, embedding)

-- User activity
checkins (id, user_id, text, emoji, created_at)
executions (id, user_id, pet_id, action_id, seconds, completed, helpful, created_at)

-- Personalization
category_weights (user_id, category, weight)
```

### **Relationships**
- Users have one Pet
- Users have many Checkins
- Users have many Executions
- Executions reference Actions
- Category weights personalize recommendations

## 🚀 **Deployment**

### **Vercel Deployment**
- **Automatic**: Git push triggers deployment
- **Edge Functions**: Fast API responses
- **CDN**: Global content delivery
- **Environment Variables**: Secure configuration

### **Production URL**
**https://heartpet-mvphayalm-chung-haws-projects.vercel.app**

## 🔮 **Future Roadmap**

### **Immediate (Next Sprint)**
- [ ] **User Profile System**
  - Hobbies and interests collection
  - Wishlist for future features
  - Personalized recommendations
- [ ] **Music Recommendation**
  - Mood-based music suggestions
  - Integration with music APIs
  - Playlist creation
- [ ] **Enhanced Pet Animations**
  - Rive animations for pet interactions
  - Dynamic pet responses
  - Celebration animations

### **Medium-term (Q2 2024)**
- [ ] **Milvus Vector Database**
  - Advanced semantic search
  - Better action recommendations
  - Improved personalization
- [ ] **Advanced Weather Integration**
  - Real-time weather data
  - Seasonal activity suggestions
  - Weather-based pet behaviors
- [ ] **Community Features**
  - Friend connections
  - Shared achievements
  - Community challenges
- [ ] **Analytics Dashboard**
  - User progress tracking
  - Mood trends analysis
  - Wellness insights

### **Long-term (Q3-Q4 2024)**
- [ ] **Mobile App Development**
  - Native iOS/Android apps
  - Push notifications
  - Offline functionality
- [ ] **Wearable Integration**
  - Apple Watch companion
  - Health data integration
  - Activity tracking
- [ ] **Professional Partnerships**
  - Therapist integration
  - Corporate wellness programs
  - Research collaborations
- [ ] **Advanced AI Features**
  - Voice interaction
  - Advanced mood prediction
  - Personalized coaching

## 🎯 **Demo Highlights**

### **Key Features to Showcase**
1. **Complete User Journey**: Check-in → Analysis → Action → Completion
2. **Pet Evolution**: Level up and visual progression
3. **Weather Integration**: Context-aware recommendations
4. **Multi-modal Input**: Text, emoji, images, weather
5. **Mobile-First Design**: Responsive, touch-friendly interface

### **Technical Innovation**
- **Closed-loop wellness**: Input → AI → Action → Growth
- **Weather-aware AI**: Context-sensitive recommendations
- **Pet companionship**: Gamified emotional wellness
- **Micro-actions**: 1-3 minute achievable tasks

## 🤝 **Contributing**

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **Code Standards**
- **TypeScript**: Full type safety
- **ESLint**: Code quality
- **Prettier**: Code formatting
- **Conventional Commits**: Clear commit messages

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **NextGen AI Hackathon** for the challenge and inspiration
- **OpenAI** for powerful AI capabilities
- **Vercel** for seamless deployment
- **NextAuth.js** for authentication
- **Tailwind CSS** for beautiful styling

---

**HeartPet** - Where emotional wellness meets AI-powered companionship 🌱✨
