# 🍪 Farelo - Save & Share Recipes

Farelo is a mobile app that uses AI to digitize, organize, and share personal recipes, combining social cooking logs with a smart, searchable cookbook.

## ✅ Publishing Status
- **iOS**: Trying to pass Apple's reviews
- **Android**: Published. [Access Here](https://play.google.com/store/apps/details?id=com.arthrduarte.farelo)

## ✨ Features

### Recipe Management
- **Manual Import**: Add recipes with ingredients, instructions, cooking time, tags, and photos
- **Smart Link Import**: Extract recipes from any website using AI-powered web scraping
- **Photo Import**: Capture recipes from images using advanced AI image analysis
- **AI Recipe Remix**: Transform existing recipes with requests like "make it spicier" or "make it vegetarian"

### Cooking Experience
- **Interactive Cooking Mode**: Step-by-step cooking with checkboxes to track progress
- **Cook Logs**: Document your cooking journey with photos, notes, and personal modifications
- **Social Sharing**: Share your cooking achievements with friends and family

### Social Features
- **Recipe Feed**: Discover what friends are cooking and their results
- **Engage & Save**: Like, comment, and save friends' recipes to your cookbook
- **Follow Friends**: Stay updated with your cooking community

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev) React Native
- **Backend**: Express.js with TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI GPT-4o for recipe extraction and analysis
- **State Management**: React Query (TanStack Query)
- **Payment Processing**: RevenueCat

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later)
- Expo CLI
- iOS Simulator/Android Emulator or physical device with Expo Go

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd farelo-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   Or
   
   ```bash
   npx expo install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your preferred platform**
   - **Development build**: For full feature access
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal  
   - **Physical Device**: Scan QR code with Expo Go app

## 📁 Project Structure

```
farelo-mobile/
├── app/                 # Main app directory (file-based routing)
│   ├── (auth)/         # Authentication flow
│   ├── (tabs)/         # Main tab navigation
│   └── ...
├── components/         # Reusable UI components
├── types/              # TypeScript type definitions
│   └── db.ts          # Database schema types
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── constants/          # App constants and theme
└── assets/             # Static assets (images, fonts)
```

---

*Built with ❤️ by Arthur*
