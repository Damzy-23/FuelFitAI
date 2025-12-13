import React from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface VoiceButtonProps {
  text: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  voiceId?: string;
}

export default function VoiceButton({ 
  text, 
  className = '', 
  size = 'medium',
  voiceId 
}: VoiceButtonProps) {
  const { speak, stop, isPlaying, isLoading } = useTextToSpeech({
    voiceId,
    onError: (error) => {
      console.error('TTS Error:', error);
    },
  });

  const handleClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(text);
    }
  };

  const sizeClasses = {
    small: 'voice-button-small',
    medium: 'voice-button-medium',
    large: 'voice-button-large',
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || !text}
      className={`voice-button ${sizeClasses[size]} ${className} ${isPlaying ? 'playing' : ''}`}
      title={isPlaying ? 'Stop playback' : 'Listen to this text'}
      aria-label={isPlaying ? 'Stop audio playback' : 'Play audio'}
    >
      {isLoading ? (
        <span className="voice-icon">⏳</span>
      ) : isPlaying ? (
        <span className="voice-icon">⏸️</span>
      ) : (
        <span className="voice-icon">🔊</span>
      )}
    </button>
  );
}

