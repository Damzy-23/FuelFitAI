import { useState, useRef, useCallback, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

interface UseTextToSpeechOptions {
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false); // Track if we're actively playing to prevent race conditions

  const speak = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) {
      setError('No text provided');
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Clean up previous audio URL
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setIsLoading(true);
    setError(null);
    isPlayingRef.current = false; // Reset playing state
    options.onStart?.();

    try {
      console.log('🎤 Calling TTS endpoint...', { textLength: text.length, apiUrl: `${API_URL}/api/voice/text-to-speech` });
      // Call backend TTS endpoint
      const response = await fetch(`${API_URL}/api/voice/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceId: options.voiceId,
          stability: options.stability,
          similarityBoost: options.similarityBoost,
        }),
      });
      
      console.log('📡 TTS Response status:', response.status, response.statusText);
      console.log('📡 TTS Response headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: 'Failed to generate speech', details: `HTTP ${response.status}` };
        }
        const errorMsg = errorData.error || 'Failed to generate speech';
        const errorDetails = errorData.details || '';
        console.error('❌ TTS API error:', errorMsg, errorDetails);
        throw new Error(errorDetails ? `${errorMsg}: ${errorDetails}` : errorMsg);
      }

      // Create blob from audio stream
      const audioBlob = await response.blob();
      console.log('✅ Audio blob created, size:', (audioBlob.size / 1024).toFixed(2), 'KB');
      
      if (audioBlob.size === 0) {
        throw new Error('Received empty audio blob from server');
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create audio element
      const audio = new Audio(audioUrl);
      audioUrlRef.current = audioUrl;
      
      console.log('🔊 Audio element created, attempting playback...');

      // Set up event listeners
      audio.onended = () => {
        isPlayingRef.current = false;
        setIsPlaying(false);
        setIsLoading(false);
        options.onEnd?.();
        // Clean up
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        isPlayingRef.current = false;
        const error = new Error('Audio playback failed - browser may not support this audio format or audio file is corrupted');
        setIsPlaying(false);
        setIsLoading(false);
        setError(error.message);
        options.onError?.(error);
        audioRef.current = null;
      };

      audio.onplay = () => {
        console.log('▶️ Audio playback started');
        isPlayingRef.current = true;
        setIsPlaying(true);
        setIsLoading(false);
      };

      audio.onpause = () => {
        isPlayingRef.current = false;
        setIsPlaying(false);
      };

      // Play audio - handle browser autoplay policies and race conditions
      audioRef.current = audio;
      
      // Wait a tiny bit to ensure audio is ready and loaded
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Check if we're still supposed to play (not interrupted)
      if (!audioRef.current) {
        console.log('⚠️ Playback cancelled before starting');
        return;
      }
      
      isPlayingRef.current = true; // Mark as playing before calling play()
      
      // Ensure audio is loaded before playing
      if (audio.readyState < 2) { // HAVE_CURRENT_DATA
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            audio.removeEventListener('canplay', resolve);
            audio.removeEventListener('error', reject);
            reject(new Error('Audio load timeout'));
          }, 5000);
          audio.addEventListener('canplay', () => {
            clearTimeout(timeoutId);
            resolve(null);
          }, { once: true });
          audio.addEventListener('error', (e) => {
            clearTimeout(timeoutId);
            reject(new Error(`Audio loading error: ${e.message || 'unknown'}`));
          }, { once: true });
        });
      }
      
      // Final check before playing
      if (!isPlayingRef.current || !audioRef.current) {
        console.log('⚠️ Playback cancelled during load');
        return;
      }
      
      try {
        console.log('▶️ Attempting to play audio...', { readyState: audio.readyState });
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log('✅ Audio play() promise resolved');
          // Audio should start playing now, onplay event will handle state
        } else {
          // If play() returns undefined, audio might already be playing
          console.log('⚠️ play() returned undefined');
          if (audioRef.current && !audio.paused) {
            isPlayingRef.current = true;
            setIsPlaying(true);
            setIsLoading(false);
          }
        }
      } catch (playError: any) {
        isPlayingRef.current = false;
        // Handle autoplay restrictions
        if (playError.name === 'NotAllowedError' || playError.name === 'NotSupportedError') {
          console.warn('⚠️ Autoplay blocked by browser. User interaction required.');
          throw new Error('Audio playback requires user interaction. Please click the play button.');
        }
        // Handle interruption errors gracefully - these are usually fine
        if (playError.name === 'AbortError' || playError.message?.includes('interrupted')) {
          // Only log if it's not a user-initiated stop
          if (isPlayingRef.current) {
            console.log('⚠️ Playback was interrupted (this is usually fine)');
          }
          isPlayingRef.current = false;
          setIsPlaying(false);
          setIsLoading(false);
          return; // Don't throw error for interruptions
        }
        throw playError;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate speech');
      console.error('❌ TTS Error:', error.message);
      setIsLoading(false);
      setIsPlaying(false);
      setError(error.message);
      options.onError?.(error);
    }
  }, [options]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      isPlayingRef.current = false; // Mark as not playing first
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {
        // Ignore errors
      }
      setIsPlaying(false);
      setIsLoading(false);
      audioRef.current = null;
      options.onEnd?.();
    }
  }, [options]);

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const resume = useCallback(async () => {
    if (audioRef.current && !isPlaying) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        setError('Failed to resume playback');
      }
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      isPlayingRef.current = false;
    };
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isPlaying,
    isLoading,
    error,
  };
}

