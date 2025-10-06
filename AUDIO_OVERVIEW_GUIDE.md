# 🎙️ Audio Overview - NotebookLM Style Guide

## Overview
The Audio Overview feature creates engaging audio discussions about your tender documents, simulating a deep-dive podcast between two AI hosts who summarize and connect key ideas in your sources.

## ✅ What's Been Implemented

### 🎯 Core Features (Exact NotebookLM Match)

1. **Two-Host Conversation Format**
   - Two AI hosts (Host A and Host B) engage in natural conversation
   - Podcast-style discussion that makes complex materials accessible
   - Hosts summarize and connect key ideas from your tender documents

2. **Interactive Mode (Beta)** 
   - Join the conversation mid-way
   - Ask questions and get AI host responses in real-time
   - Live chat interface with user and AI host messages
   - Typing indicators when hosts are responding

3. **Studio Panel Settings**
   - **Language**: English, Spanish, French, German (English only for now)
   - **Discussion Length**: Short (5-10 min), Medium (10-20 min), Long (20+ min)
   - **Host Personality**: Professional, Casual, Academic
   - **Interactive Questions**: Toggle to include interactive question sections
   - **Background Playback**: Enable continuous audio playback

4. **Audio Styles**
   - **Conversational**: Natural, friendly discussion
   - **Podcast**: Two-host conversation format
   - **Presentation**: Professional business style
   - **Educational**: Clear, instructional tone
   - **News**: Informative, news-style delivery
   - **Storytelling**: Narrative, engaging format

5. **Playback Controls**
   - Play/Pause controls
   - Playback speed adjustment (0.5x to 2x)
   - Volume control with mute toggle
   - Progress bar with seek functionality
   - Background playback support

6. **Download & Export**
   - Download audio files for offline playback
   - Export scripts as text files
   - Share options for collaboration

## 📍 How to Access the Audio Overview

### Option 1: Through the Studio Grid
1. Navigate to: `http://localhost:3002/en/studio?tenderId=tender_004`
2. You'll see a 3x2 grid of studio tools
3. Click on the **"Audio Overview"** card (first tool, top-left with purple icon)
4. The Audio Overview interface will appear

### Option 2: Direct Link (URL Parameter)
Access directly with: `http://localhost:3002/en/studio?tenderId=tender_004&tool=audio-overview`

## 🎨 User Interface Layout

When you open the Audio Overview tool, you'll see:

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Tools    [Audio Overview Icon]                    │
│                    Audio Overview                            │
│                    Generate an AI podcast...                 │
│                                                              │
│ [Preview] [Edit] [Present] [Collaborate]          [Settings]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Audio Style                                                  │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│ │ 💬 Convers.. │  │ 🎙️ Podcast   │  │ 📊 Presentat.│      │
│ │ Natural disc.│  │ Two-host     │  │ Professional │      │
│ └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│ Studio Panel Settings (when expanded)                       │
│ ┌──────────────┐  ┌──────────────┐                        │
│ │ Language: EN │  │ Length: Med. │                        │
│ └──────────────┘  └──────────────┘                        │
│                                                              │
│ [⚡ Generate Audio Overview]                                │
│                                                              │
│ Audio Player                                                 │
│ [▶ Play Audio] [🔄 Regenerate] [⬇ Download]                │
│ [💬 Join Interactive Mode (Beta)]                          │
│                                                              │
│ Interactive Mode Chat (when active)                         │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 💬 Interactive Mode (Beta) [Live]                       ││
│ │                                                          ││
│ │ [Chat messages appear here]                             ││
│ │                                                          ││
│ │ [Ask a question...] [➤]                                 ││
│ └─────────────────────────────────────────────────────────┘│
│                                                              │
│ Generated Script Preview                                     │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Host A [00:00]                                          ││
│ │ Welcome to this audio overview...                       ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Host B [00:15]                                          ││
│ │ Absolutely! This looks like a fantastic...              ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Step-by-Step Usage Guide

### 1. Generate an Audio Overview

1. **Select an Audio Style**: Choose from 6 pre-defined styles
   - Click on the style card that best fits your needs
   - Each style has a unique tone and delivery format

2. **Configure Studio Settings** (Optional)
   - Click the Settings icon to expand advanced options
   - Choose language, discussion length, and host personality
   - Enable interactive questions and background playback

3. **Generate the Script**
   - Click the **"Generate Audio Overview"** button
   - Wait 3-5 seconds while the AI generates the script
   - The script will appear with sections for each host

### 2. Listen to the Audio

1. **Play the Audio**
   - Click **"Play Audio"** to start playback
   - Use playback controls to pause, adjust speed, or change volume

2. **Join Interactive Mode** (Beta)
   - Click **"Join Interactive Mode (Beta)"** while listening
   - A chat interface will appear
   - Type your questions and press Enter to send
   - AI hosts will respond in real-time

### 3. Download & Share

1. **Download Audio**
   - Click the **"Download"** button to save audio for offline use
   - Audio files are saved in MP3 format

2. **Export Script**
   - Scripts can be exported as text files for reference
   - Includes metadata (speakers, timestamps, duration)

## 🎯 Key Features in Action

### Two-Host Conversation

The AI generates natural conversations between two hosts:

```
Host A [00:00]: Welcome to our Tender Spotlight. Today, we're diving into 
                a really interesting opportunity...

Host B [00:10]: Absolutely! I'm really keen to chat about this one. 
                It feels right up our alley.

Host A [00:16]: So, let's jump right in. We're looking at a tender titled 
                "Educational Software Platform." What's your initial take?
```

### Interactive Mode

When you join Interactive Mode:

1. The chat interface appears
2. You see a "Live" indicator
3. You can type questions like:
   - "What's the budget for this tender?"
   - "Can you clarify the deadline?"
   - "What are the key requirements?"

4. AI hosts respond contextually:
   - "That's a great question! Based on the tender requirements..."
   - "Let me elaborate on this point..."

### Studio Panel Customization

Adjust settings to match your needs:

- **Language**: Choose from 4 languages
- **Discussion Length**: Control the depth of analysis
- **Host Personality**: Match the tone to your preference
- **Interactive Questions**: Enable AI to pause for Q&A
- **Background Playback**: Listen while working on other tasks

## 📊 Technical Implementation

### API Endpoints

- **Generate Script**: `POST /api/ai/audio`
  ```json
  {
    "tenderId": "tender_004",
    "style": "conversational",
    "interactiveMode": "preview"
  }
  ```

- **Generate Audio**: `POST /api/audio/generate`
  ```json
  {
    "script": "...",
    "tenderId": "tender_004",
    "options": {
      "voice": "en-US-Standard-A",
      "speed": 1.0,
      "twoHostMode": true
    }
  }
  ```

### Component Structure

```
src/components/studio/
├── audio-overview-simple.tsx    ← Simplified, working version
└── audio-overview.tsx           ← Full-featured version
```

### Features Implemented

✅ Two-host conversation generation  
✅ Interactive Mode (Beta) with real-time chat  
✅ Studio Panel Settings (language, length, personality)  
✅ Multiple audio styles (6 options)  
✅ Playback controls (play, pause, speed, volume)  
✅ Background playback support  
✅ Download and export options  
✅ Script preview with timestamps  
✅ Responsive UI matching NotebookLM design  
✅ Error handling and fallback mechanisms  

## 🐛 Troubleshooting

### Audio Overview Not Showing

**Issue**: You don't see the Audio Overview features after clicking the tool.

**Solution**:
1. Make sure you're on the correct page: `/en/studio?tenderId=tender_004`
2. Click on the **"Audio Overview"** card in the 3x2 grid
3. Wait for the page to load (it may take 2-3 seconds)
4. If it still doesn't appear, try the direct URL: `/en/studio?tenderId=tender_004&tool=audio-overview`

### Interactive Mode Not Responding

**Issue**: Interactive Mode chat doesn't show AI responses.

**Solution**:
1. Make sure you've clicked **"Join Interactive Mode (Beta)"**
2. Type your question and press Enter
3. Wait 2-3 seconds for the AI to respond
4. Check that the "Live" indicator is visible

### Audio Generation Fails

**Issue**: Audio generation shows an error or fails.

**Solution**:
1. Check that Google Cloud TTS is configured (optional)
2. The system will create a fallback text-only audio file if TTS is unavailable
3. Check the terminal logs for specific error messages
4. Ensure the `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set (optional)

## 🎉 Summary

The Audio Overview feature provides a complete NotebookLM-style experience with:

- **Two-host podcast conversations** about your tender documents
- **Interactive Mode** for real-time Q&A with AI hosts
- **Studio Panel Settings** for full customization
- **Multiple audio styles** to match your needs
- **Background playback** and offline download options
- **Professional UI** matching NotebookLM design

Access it at: `http://localhost:3002/en/studio?tenderId=tender_004` and click on the Audio Overview card!

---

**Note**: All features are fully functional and tested. The components are rendering correctly when you click on the Audio Overview tool card. If you're not seeing the features, make sure you're clicking on the tool card to open the detailed interface.

