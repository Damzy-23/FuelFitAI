import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

interface UseVoiceAssistantOptions {
  onResponse?: (response: string) => void;
  onError?: (error: Error) => void;
  userContext?: {
    fitnessGoal?: string;
    recentMeals?: string[];
  };
}

export function useVoiceAssistant(options: UseVoiceAssistantOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = async (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          await processMessage(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (options.onError) {
            options.onError(new Error(event.error));
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [options]);

  const processMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsProcessing(true);
    try {
      const context = options.userContext?.fitnessGoal 
        ? `User's fitness goal: ${options.userContext.fitnessGoal}`
        : undefined;

      const response = await axios.post(`${API_URL}/api/assistant/chat`, {
        message,
        context
      });

      if (response.data.success && options.onResponse) {
        options.onResponse(response.data.response);
      }
    } catch (error: any) {
      if (options.onError) {
        options.onError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const isSupported = typeof window !== 'undefined' && 
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return {
    startListening,
    stopListening,
    isListening,
    isProcessing,
    isSupported
  };
}

