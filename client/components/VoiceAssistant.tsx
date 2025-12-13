import React, { useState, useEffect, useRef } from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface VoiceAssistantProps {
  userContext?: {
    fitnessGoal?: string;
    recentMeals?: string[];
  };
}

export default function VoiceAssistant({ userContext }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<Array<{ type: 'user' | 'assistant'; message: string }>>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { speak, stop, isPlaying } = useTextToSpeech({
    onStart: () => setIsSpeaking(true),
    onEnd: () => setIsSpeaking(false),
    onError: (error: Error) => {
      console.error('TTS Error:', error);
      // Show more specific error message
      if (error.message.includes('API key') || error.message.includes('ElevenLabs')) {
        showToast('ElevenLabs API key not configured. Check server/.env', 'error');
      } else if (error.message.includes('quota')) {
        showToast('ElevenLabs quota exceeded. Check your account', 'error');
      } else {
        showToast(`Voice playback error: ${error.message}`, 'error');
      }
    }
  });
  const { showToast } = useToast();

  // Load suggestions only once on mount
  useEffect(() => {
    // Only fetch if suggestions are empty (prevent re-fetching)
    if (suggestions.length > 0) return;
    
    let isMounted = true;
    
    axios.get(`${API_URL}/api/assistant/suggestions`)
      .then(res => {
        if (isMounted && res.data.success) {
          setSuggestions(res.data.suggestions);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Error loading suggestions:', err);
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  // Initialize Web Speech API only once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      handleUserMessage(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        showToast('No speech detected. Try again.', 'info');
      } else if (event.error === 'not-allowed') {
        showToast('Microphone permission denied', 'error');
      } else {
        showToast('Speech recognition error', 'error');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [showToast]); // Only re-run if showToast changes (should be stable from context)

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const handleUserMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message to conversation
    setConversation(prev => [...prev, { type: 'user', message }]);
    setIsProcessing(true);

    try {
      // Get context string
      const context = userContext?.fitnessGoal 
        ? `User's fitness goal: ${userContext.fitnessGoal}`
        : undefined;

      // Call assistant API
      const response = await axios.post(`${API_URL}/api/assistant/chat`, {
        message,
        context
      });

      if (response.data.success) {
        const assistantMessage = response.data.response;
        
        // Add assistant response to conversation
        setConversation(prev => [...prev, { type: 'assistant', message: assistantMessage }]);
        
        // Speak the response (don't block if TTS fails)
        try {
          await speak(assistantMessage);
        } catch (ttsError: any) {
          // TTS failed but we still have the text response, so just log it
          console.warn('TTS failed but response is shown:', ttsError.message);
          // Don't show error toast here - the text response is already shown
        }
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (error: any) {
      console.error('Assistant error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to process your question';
      const errorDetails = error.response?.data?.details;
      
      // Show detailed error in toast
      showToast(errorMsg, 'error');
      
      // Provide helpful error message in conversation
      let userFriendlyError = 'Sorry, I encountered an error. ';
      
      if (errorMsg.includes('API key') || errorMsg.includes('OpenAI')) {
        userFriendlyError = 'I need an OpenAI API key to answer questions. Please configure OPENAI_API_KEY in your server/.env file. For now, you can use the preset meals and analysis features!';
      } else if (errorMsg.includes('rate limit')) {
        userFriendlyError = 'I\'m experiencing high demand right now. Please try again in a moment!';
      } else if (errorMsg.includes('network')) {
        userFriendlyError = 'I\'m having trouble connecting. Please check your internet connection and try again.';
      } else {
        userFriendlyError += errorDetails ? `Details: ${errorDetails}` : 'Please try again.';
      }
      
      setConversation(prev => [...prev, { 
        type: 'assistant', 
        message: userFriendlyError
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing && !isSpeaking) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        showToast('Failed to start voice recognition', 'error');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    // Don't stop audio if we're still processing - let it finish
    if (isSpeaking && !isProcessing) {
      stop();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleUserMessage(suggestion);
  };

  const isSupported = typeof window !== 'undefined' && 
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  if (!isSupported) {
    return (
      <div className="voice-assistant-unsupported">
        <p>Voice assistant is not supported in this browser. Please use Chrome, Edge, or Safari.</p>
      </div>
    );
  }

  return (
    <div className="voice-assistant">
      <div className="voice-assistant-header">
        <h3>🎤 Voice Assistant</h3>
        <p>Ask me anything about nutrition and fitness!</p>
      </div>

      <div className="voice-assistant-controls">
        <button
          className={`voice-assistant-button ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''} ${isSpeaking ? 'speaking' : ''}`}
          onClick={isListening || isSpeaking ? stopListening : startListening}
          disabled={isProcessing}
          title={isListening ? 'Stop listening' : isSpeaking ? 'Stop speaking' : 'Start voice assistant'}
        >
          {isProcessing ? (
            <span className="voice-icon">⏳</span>
          ) : isListening ? (
            <span className="voice-icon">🎙️</span>
          ) : isSpeaking ? (
            <span className="voice-icon">🔊</span>
          ) : (
            <span className="voice-icon">🎤</span>
          )}
          <span className="voice-label">
            {isProcessing ? 'Processing...' : isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Tap to Speak'}
          </span>
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="voice-assistant-suggestions">
          <p className="suggestions-title">Try asking:</p>
          <div className="suggestions-list">
            {suggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isProcessing || isListening || isSpeaking}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {conversation.length > 0 && (
        <div className="voice-assistant-conversation">
          {conversation.map((item, index) => (
            <div key={index} className={`conversation-message ${item.type}`}>
              <div className="message-icon">
                {item.type === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-text">{item.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

