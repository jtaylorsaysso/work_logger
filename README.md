# Personal Logger

A mobile-first Progressive Web App designed for fast-paced work environments like fast food restaurants. Enables quick logging of issues, tasks, and notes with one-touch entry and offline functionality.

## Features

- **Quick Entry**: One-touch buttons for Issues (🔴), Tasks (🟡), and Notes (🔵)
- **Mobile-First**: Optimized for touch with 44px+ targets and one-handed operation
- **Offline-First**: Works without internet using IndexedDB storage
- **Voice Input**: Speech-to-text for hands-free logging
- **PWA**: Installable as a native app on mobile devices
- **Fast**: <3 second entry rule for busy environments

## Deployment on Render

### Prerequisites
- GitHub repository with this code
- Render account

### Deploy Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Personal Logger PWA"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select this repository

3. **Configure Service**:
   - **Name**: `personal-logger`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free tier works fine

4. **Environment Variables** (optional):
   - `NODE_ENV`: `production`

### Manual Configuration (Alternative)

If not using `render.yaml`, configure in the Render dashboard:
- Runtime: Node.js
- Build Command: `npm install`
- Start Command: `npm start`
- Auto-Deploy: Yes

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# OR
npm start

# Open browser to http://localhost:8000 or http://localhost:3000
```

## Technical Stack

- **Frontend**: Vanilla HTML/CSS/JS with Alpine.js
- **Storage**: IndexedDB for offline persistence
- **PWA**: Service Worker + Web App Manifest
- **Server**: Express.js (for Render deployment)
- **Deployment**: Render.com

## Usage

1. **Quick Entry**: Tap colored buttons to start logging
2. **Templates**: Use pre-defined templates for common scenarios
3. **Voice Input**: Tap microphone for speech-to-text
4. **Offline**: Works without internet, syncs when online
5. **Install**: Add to home screen for app-like experience

## File Structure

```
personal_logger/
├── index.html          # Main PWA interface
├── app.js             # Alpine.js application logic
├── styles.css         # Mobile-first CSS
├── manifest.json      # PWA manifest
├── sw.js             # Service worker
├── server.js         # Express server for deployment
├── package.json      # Node.js dependencies
├── render.yaml       # Render deployment config
└── README.md         # This file
```
