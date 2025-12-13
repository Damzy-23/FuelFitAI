# Voice Assistant Setup Guide

## 🎤 Overview

The Voice Assistant is a conversational AI feature that allows users to ask questions about nutrition and fitness using their voice. It combines:

- **Speech-to-Text**: Browser's Web Speech API (free, no API key needed)
- **AI Processing**: OpenAI GPT-3.5 for understanding and generating responses
- **Text-to-Speech**: ElevenLabs for natural voice responses

## ✨ Features

- 🎙️ **Voice Input**: Speak your questions naturally
- 🤖 **AI-Powered Responses**: Get intelligent answers about nutrition and fitness
- 🔊 **Voice Output**: Hear responses in natural-sounding voice
- 💬 **Conversation History**: See your conversation history
- 💡 **Suggested Questions**: Quick access to common questions

## 🚀 Setup

### 1. Backend Setup

The voice assistant requires:
- ✅ OpenAI API key (already configured for AI explanations)
- ✅ ElevenLabs API key (already configured for TTS)

No additional setup needed! The assistant uses the same API keys.

### 2. Browser Compatibility

The Voice Assistant uses the **Web Speech API**, which is supported in:
- ✅ Chrome/Edge (Chromium-based)
- ✅ Safari (iOS 14.5+)
- ❌ Firefox (not supported)

**Note**: Users on unsupported browsers will see a message indicating voice assistant is not available.

### 3. Microphone Permissions

When users first click the voice assistant button, their browser will request microphone permission. They need to:
1. Click "Allow" when prompted
2. Ensure their microphone is working
3. Speak clearly in a quiet environment

## 📋 API Endpoints

### POST `/api/assistant/chat`
Send a message to the voice assistant.

**Request:**
```json
{
  "message": "What's a good meal for muscle gain?",
  "context": "User's fitness goal: muscle_gain"
}
```

**Response:**
```json
{
  "success": true,
  "response": "For muscle gain, focus on high-protein meals..."
}
```

### GET `/api/assistant/suggestions`
Get suggested questions for the voice assistant.

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "What's a good meal for muscle gain?",
    "How many calories should I eat?",
    ...
  ]
}
```

## 🎯 Usage

### For Users

1. **Navigate to Analyze Page**: The voice assistant is available on the analyze page
2. **Click "Tap to Speak"**: Start the voice assistant
3. **Speak Your Question**: Ask anything about nutrition or fitness
4. **Listen to Response**: The assistant will respond with voice
5. **View Conversation**: See your conversation history below

### Example Questions

- "What's a good meal for muscle gain?"
- "How many calories should I eat for fat loss?"
- "What's the best workout to burn 500 calories?"
- "Explain what FuelScore means"
- "What's the difference between protein and carbs?"
- "Recommend a meal for my workout"
- "Tell me about Jollof Rice nutrition"
- "What's the workout cost of Fish and Chips?"

## 🔧 Technical Details

### Components

1. **VoiceAssistant Component** (`client/components/VoiceAssistant.tsx`)
   - Main UI component
   - Handles speech recognition
   - Manages conversation state
   - Integrates with TTS

2. **useTextToSpeech Hook** (`client/hooks/useTextToSpeech.ts`)
   - Handles text-to-speech conversion
   - Manages audio playback
   - Provides callbacks for UI updates

3. **Assistant Routes** (`server/routes/assistant.js`)
   - Backend API endpoints
   - OpenAI integration
   - Context-aware responses

### Speech Recognition Flow

1. User clicks "Tap to Speak"
2. Browser requests microphone permission
3. Web Speech API starts listening
4. User speaks their question
5. Speech is converted to text
6. Text is sent to backend API
7. OpenAI processes the question
8. Response is generated
9. Response is converted to speech via ElevenLabs
10. Audio is played to user

### Error Handling

- **No Speech Detected**: Shows friendly message
- **Microphone Permission Denied**: Shows error message
- **API Errors**: Falls back gracefully
- **Unsupported Browser**: Shows compatibility message

## 🎨 UI Features

- **Glassmorphism Design**: Modern, translucent UI
- **Animated States**: Visual feedback for listening, processing, speaking
- **Conversation History**: Scrollable chat interface
- **Suggested Questions**: Quick-access chips
- **Responsive Design**: Works on mobile and desktop

## 🔒 Privacy & Security

- **No Data Storage**: Conversations are not stored
- **Browser-Based**: Speech recognition happens in browser
- **Secure API Calls**: All requests use HTTPS
- **No Recording**: Audio is processed in real-time, not recorded

## 🐛 Troubleshooting

### Voice Assistant Not Working?

1. **Check Browser**: Ensure you're using Chrome, Edge, or Safari
2. **Check Microphone**: Ensure microphone is connected and working
3. **Check Permissions**: Allow microphone access when prompted
4. **Check API Keys**: Ensure OpenAI and ElevenLabs keys are configured
5. **Check Console**: Look for errors in browser console

### Speech Recognition Not Starting?

- Ensure microphone permission is granted
- Check that microphone is not being used by another app
- Try refreshing the page
- Check browser console for errors

### No Voice Response?

- Check ElevenLabs API key is configured
- Check network connection
- Check browser console for errors
- Try a different question

## 📈 Future Enhancements

Potential improvements:
- [ ] Conversation persistence (save chat history)
- [ ] Multi-language support
- [ ] Voice commands for navigation
- [ ] Integration with meal analysis
- [ ] Personalized recommendations based on chat history
- [ ] Voice-controlled meal selection

## 🎉 You're All Set!

The voice assistant is now ready to use! Just navigate to the analyze page and start asking questions.

