const express = require('express');
const router = express.Router();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');

// Initialize ElevenLabs client only if API key is available
let elevenlabs = null;
if (process.env.ELEVENLABS_API_KEY) {
  try {
    elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });
    console.log('✅ ElevenLabs client initialized');
  } catch (error) {
    console.error('❌ Failed to initialize ElevenLabs client:', error.message);
  }
} else {
  console.warn('⚠️ ELEVENLABS_API_KEY not found in environment variables');
}

// @route   POST /api/voice/text-to-speech
// @desc    Convert text to speech using ElevenLabs
// @access  Public (can be protected if needed)
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voiceId, stability, similarityBoost } = req.body;

    console.log('🎤 TTS Request received:', { textLength: text?.length, hasApiKey: !!process.env.ELEVENLABS_API_KEY });

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Check if ElevenLabs API key is configured
    if (!process.env.ELEVENLABS_API_KEY || !elevenlabs) {
      console.error('❌ ElevenLabs API key not configured');
      return res.status(500).json({ 
        error: 'ElevenLabs API key not configured',
        details: 'Please add ELEVENLABS_API_KEY to your server/.env file'
      });
    }

    // Default voice ID (you can change this to your preferred voice)
    // Common voices: "21m00Tcm4TlvDq8ikWAM" (Rachel), "pNInz6obpgDQGcFmaJgB" (Adam)
    const defaultVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

    console.log('🤖 Calling ElevenLabs API...');
    
    // Generate audio stream
    const audioStream = await elevenlabs.textToSpeech.convert(defaultVoiceId, {
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: stability || 0.5,
        similarity_boost: similarityBoost || 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    });

    console.log('✅ ElevenLabs audio stream received');

    // Set headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline; filename="speech.mp3"');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Accept-Ranges', 'bytes');

    // Stream audio to client
    let chunkCount = 0;
    for await (const chunk of audioStream) {
      res.write(chunk);
      chunkCount++;
    }
    console.log(`✅ Streamed ${chunkCount} chunks to client`);
    res.end();

  } catch (error) {
    console.error('❌ ElevenLabs TTS error:', error.message);
    console.error('Error details:', error);
    
    // Provide helpful error messages
    let errorMessage = 'Failed to generate speech';
    let errorDetails = error.message;
    
    if (error.message?.includes('API key') || error.message?.includes('authentication') || error.message?.includes('401')) {
      errorMessage = 'ElevenLabs API key is invalid or missing';
      errorDetails = 'Please check your ELEVENLABS_API_KEY in server/.env file';
    } else if (error.message?.includes('quota') || error.message?.includes('429')) {
      errorMessage = 'ElevenLabs API quota exceeded';
      errorDetails = 'You have reached your ElevenLabs usage limit. Please check your account or upgrade your plan.';
    } else if (error.message?.includes('network') || error.code === 'ECONNREFUSED') {
      errorMessage = 'Network error connecting to ElevenLabs';
      errorDetails = 'Please check your internet connection';
    }
    
    res.status(500).json({ 
      error: errorMessage, 
      details: errorDetails 
    });
  }
});

// @route   GET /api/voice/voices
// @desc    Get available voices from ElevenLabs
// @access  Public
router.get('/voices', async (req, res) => {
  try {
    if (!elevenlabs) {
      return res.status(500).json({ 
        error: 'ElevenLabs API key not configured',
        details: 'Please add ELEVENLABS_API_KEY to your server/.env file'
      });
    }
    const voices = await elevenlabs.voices.getAll();
    res.json({ 
      success: true, 
      voices: voices.voices.map(v => ({
        voice_id: v.voice_id,
        name: v.name,
        category: v.category
      }))
    });
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch voices', 
      details: error.message 
    });
  }
});

module.exports = router;

