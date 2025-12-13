# ElevenLabs Voice Integration Setup

## 🎙️ Overview

FuelFit AI now supports text-to-speech using ElevenLabs! Users can listen to AI coach explanations and meal analysis results.

## 📋 Setup Instructions

### Step 1: Get Your ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up or log in
3. Navigate to your profile settings
4. Copy your API key

### Step 2: Add API Key to Environment Variables

Add your ElevenLabs API key to `server/.env`:

```env
ELEVENLABS_API_KEY=your_api_key_here
```

**Optional:** Set a default voice ID (if you have a preferred voice):

```env
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

Common voice IDs:
- `21m00Tcm4TlvDq8ikWAM` - Rachel (default)
- `pNInz6obpgDQGcFmaJgB` - Adam
- `EXAVITQu4vr4xnSDxMaL` - Bella

### Step 3: Restart the Server

After adding the API key, restart your backend server:

```bash
npm run dev
```

## 🎯 Usage

### In the Analyze Page

1. Analyze a meal as usual
2. Look for the 🔊 button next to "AI Coach Explanation"
3. Click to hear the explanation read aloud
4. Click again (⏸️) to stop playback

### Voice Controls

- **Play**: Click the 🔊 button to start playback
- **Stop**: Click the ⏸️ button (while playing) to stop
- **Loading**: Shows ⏳ while generating audio

## 🔧 API Endpoints

### POST `/api/voice/text-to-speech`

Convert text to speech.

**Request Body:**
```json
{
  "text": "Your text here",
  "voiceId": "optional-voice-id",
  "stability": 0.5,
  "similarityBoost": 0.75
}
```

**Response:** Audio stream (audio/mpeg)

### GET `/api/voice/voices`

Get list of available voices.

**Response:**
```json
{
  "success": true,
  "voices": [
    {
      "voice_id": "21m00Tcm4TlvDq8ikWAM",
      "name": "Rachel",
      "category": "premade"
    }
  ]
}
```

## 🎨 Customization

### Change Default Voice

Edit `server/routes/voice.js` and change the default voice ID:

```javascript
const defaultVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || 'YOUR_VOICE_ID';
```

### Adjust Voice Settings

Modify the voice settings in `server/routes/voice.js`:

```javascript
voice_settings: {
  stability: 0.5,        // 0.0 - 1.0 (higher = more stable)
  similarity_boost: 0.75, // 0.0 - 1.0 (higher = more similar to original)
  style: 0.0,           // 0.0 - 1.0 (higher = more expressive)
  use_speaker_boost: true
}
```

## 🐛 Troubleshooting

**"Failed to generate speech" error:**
- Check that your API key is correct in `server/.env`
- Verify you have credits remaining in your ElevenLabs account
- Check server console for detailed error messages

**Audio doesn't play:**
- Check browser console for errors
- Ensure your browser supports audio playback
- Try a different browser

**Voice sounds robotic:**
- Increase `stability` value (try 0.7-0.9)
- Increase `similarity_boost` value (try 0.8-1.0)

## 💡 Tips

- The voice feature works best with shorter texts (under 500 words)
- For longer texts, consider breaking them into smaller chunks
- You can test different voices using the `/api/voice/voices` endpoint

