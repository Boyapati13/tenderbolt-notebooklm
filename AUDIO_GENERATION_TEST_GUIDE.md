# Audio Generation Feature - Test Guide

## 🎵 **New Feature: Actual Audio Generation**

### **What's New:**
- **Real Audio Generation** - Now generates actual MP3/WAV/OGG audio files (not just scripts)
- **Google Text-to-Speech Integration** - Professional voice synthesis
- **Multiple Voice Options** - 8+ voice choices with different accents and genders
- **Two-Host Conversations** - Podcast-style dialogue format
- **Voice Customization** - Speed, pitch, volume controls
- **Audio Playback** - Built-in player with play/pause controls
- **Audio Download** - Direct download of generated audio files

---

## 🧪 **Testing Steps**

### **Step 1: Access Audio Overview**
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Navigate to: `http://localhost:3002`
3. Go to any tender project → **Studio** tab
4. Click **"Audio Overview"** tool

### **Step 2: Generate Audio Script**
1. Select an audio style:
   - **Brief Overview** (2-3 min)
   - **Deep Dive** (8-12 min)
   - **Podcast** (6-8 min)
   - **Presentation** (5-7 min)
   - **Interview** (7-10 min)
   - **Conversational** (5-8 min)
   - **Interactive** (6-9 min)

2. Click **"Generate Script"** button
3. Wait for script generation (5-10 seconds)
4. Verify script appears with proper formatting

### **Step 3: Configure Voice Settings**
1. Click **Settings** icon (⚙️) in the header
2. Click **"Show Settings"** under Voice Settings
3. Configure voice options:
   - **Voice**: Select from 8+ available voices
   - **Format**: Choose MP3, WAV, or OGG
   - **Speed**: Adjust from 0.5x to 2.0x
   - **Pitch**: Adjust from -20 to +20
   - **Volume**: Adjust from -20dB to +20dB
   - **Two-host Mode**: Enable for conversation format

### **Step 4: Generate Audio**
1. After script is generated, click **"Generate Audio"** button (🎵)
2. Wait for audio generation (10-30 seconds)
3. Verify success notification appears
4. Check that audio player section appears below script

### **Step 5: Test Audio Playback**
1. Click **"Play Audio"** button in the audio player section
2. Verify audio plays with selected voice
3. Test **"Pause"** functionality
4. Check audio quality and clarity

### **Step 6: Test Audio Download**
1. Click **"Download"** button in audio player section
2. Verify file downloads with correct name
3. Check file format matches selected format
4. Verify file size is reasonable

### **Step 7: Test Different Styles**
Repeat steps 2-6 for each audio style:
- **Brief**: Should be concise and direct
- **Deep Dive**: Should be comprehensive and analytical
- **Podcast**: Should have two-host conversation format
- **Presentation**: Should be formal and structured
- **Interview**: Should have Q&A format
- **Conversational**: Should be natural and flowing
- **Interactive**: Should engage the listener

---

## 🔧 **Technical Testing**

### **API Endpoints Test**
1. **Script Generation**: `POST /api/ai/audio`
   ```bash
   curl -X POST http://localhost:3002/api/ai/audio \
     -H "Content-Type: application/json" \
     -d '{"tenderId":"test","style":"brief","interactiveMode":"preview"}'
   ```

2. **Audio Generation**: `POST /api/audio/generate`
   ```bash
   curl -X POST http://localhost:3002/api/audio/generate \
     -H "Content-Type: application/json" \
     -d '{"script":"Test script","tenderId":"test","options":{"voice":"en-US-Standard-A","speed":1.0,"pitch":0,"volume":0,"format":"mp3","twoHostMode":false}}'
   ```

3. **Get Voices**: `GET /api/audio/generate?tenderId=test`

### **File System Test**
1. Check that audio files are created in `public/audio/` directory
2. Verify file permissions and accessibility
3. Test file cleanup (if implemented)

### **Error Handling Test**
1. Test with invalid tender ID
2. Test with empty script
3. Test with invalid voice options
4. Test network failures
5. Test API rate limits

---

## 📊 **Expected Results**

### **Script Generation:**
- ✅ Scripts generate within 10 seconds
- ✅ Content is relevant to tender data
- ✅ Style matches selected option
- ✅ Proper JSON structure with sections and metadata

### **Audio Generation:**
- ✅ Audio generates within 30 seconds
- ✅ Files are created in correct format
- ✅ Voice matches selected option
- ✅ Audio quality is clear and natural
- ✅ File sizes are reasonable (1-5MB for 5-minute audio)

### **Playback:**
- ✅ Audio plays immediately when clicked
- ✅ Pause/resume works correctly
- ✅ No audio glitches or artifacts
- ✅ Volume and speed controls work

### **Download:**
- ✅ Files download with descriptive names
- ✅ Correct file format (MP3/WAV/OGG)
- ✅ Files are playable in external players
- ✅ File sizes are appropriate

---

## 🐛 **Common Issues & Solutions**

### **Issue: "Failed to generate audio"**
**Causes:**
- Google TTS API not configured
- Invalid voice selection
- Network connectivity issues
- API rate limits exceeded

**Solutions:**
1. Check Google Cloud credentials
2. Verify voice name is valid
3. Check internet connection
4. Wait and retry

### **Issue: "Audio not playing"**
**Causes:**
- Browser audio policy
- File format not supported
- Corrupted audio file

**Solutions:**
1. Click play button to enable audio
2. Try different format (MP3)
3. Regenerate audio

### **Issue: "Voice not available"**
**Causes:**
- Voice name changed
- API quota exceeded
- Regional restrictions

**Solutions:**
1. Select different voice
2. Check API quotas
3. Use fallback voices

---

## 📈 **Performance Metrics**

### **Target Performance:**
- **Script Generation**: < 10 seconds
- **Audio Generation**: < 30 seconds
- **File Size**: 1-5MB for 5-minute audio
- **Audio Quality**: Clear, natural speech
- **Success Rate**: > 95%

### **Monitoring:**
- Check browser console for errors
- Monitor API response times
- Track file generation success
- Monitor audio quality feedback

---

## 🎯 **Success Criteria**

### **Feature Complete When:**
- [ ] All 7 audio styles generate successfully
- [ ] Audio files are created and playable
- [ ] Voice selection works for all options
- [ ] Two-host mode generates conversations
- [ ] Download functionality works
- [ ] Error handling is graceful
- [ ] Performance meets targets

### **Quality Standards:**
- [ ] Audio quality is professional-grade
- [ ] Scripts are engaging and informative
- [ ] UI is intuitive and responsive
- [ ] Error messages are helpful
- [ ] Loading states are clear

---

## 🚀 **Next Steps After Testing**

1. **Fix any bugs** found during testing
2. **Optimize performance** if needed
3. **Add more voice options** if requested
4. **Implement audio editing** features
5. **Add batch processing** for multiple files
6. **Integrate with video generation** (Phase 2)

---

## 📝 **Test Report Template**

```
Audio Generation Test Report
Date: ___________
Tester: ___________

Script Generation:
- Brief: ✅/❌
- Deep Dive: ✅/❌
- Podcast: ✅/❌
- Presentation: ✅/❌
- Interview: ✅/❌
- Conversational: ✅/❌
- Interactive: ✅/❌

Audio Generation:
- MP3 Format: ✅/❌
- WAV Format: ✅/❌
- OGG Format: ✅/❌
- Voice Selection: ✅/❌
- Two-host Mode: ✅/❌

Playback:
- Play/Pause: ✅/❌
- Audio Quality: ✅/❌
- No Glitches: ✅/❌

Download:
- File Creation: ✅/❌
- Correct Format: ✅/❌
- Playable: ✅/❌

Issues Found:
1. ________________
2. ________________
3. ________________

Overall Status: ✅ PASS / ❌ FAIL
```

---

## 🎉 **Congratulations!**

You've successfully implemented **actual audio generation** - a major step toward 90% alignment with NotebookLM! This feature transforms the studio from script-only to full media generation capabilities.

**Next Phase:** Video generation with slide-to-video conversion.
