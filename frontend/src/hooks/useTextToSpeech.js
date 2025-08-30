import { useState, useEffect, useRef } from 'react';

let isAudioContextUnlocked = false;

function tryResumeAudioContext() {
  // ... (keep the existing helper function as is)
}

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  // State to hold audio that was blocked by autoplay policy
  const [pendingAudioUrl, setPendingAudioUrl] = useState(null);

  useEffect(() => {
    const unlockAudioAndPlayPending = async () => {
      await tryResumeAudioContext();
      isAudioContextUnlocked = true; // Mark as unlocked

      // If there is a pending audio URL, try to play it now
      if (pendingAudioUrl) {
        // Clear the pending URL before playing to avoid loops
        const urlToPlay = pendingAudioUrl;
        setPendingAudioUrl(null); 
        playSpeech(urlToPlay);
      }
      
      // Clean up listeners after the first successful interaction
      window.removeEventListener('click', unlockAudioAndPlayPending);
      window.removeEventListener('keydown', unlockAudioAndPlayPending);
      window.removeEventListener('touchstart', unlockAudioAndPlayPending);
    };

    // If the context is not yet unlocked, add the listeners
    if (!isAudioContextUnlocked) {
      window.addEventListener('click', unlockAudioAndPlayPending, { once: true });
      window.addEventListener('keydown', unlockAudioAndPlayPending, { once: true });
      window.addEventListener('touchstart', unlockAudioAndPlayPending, { once: true });
    }

    // Return a cleanup function
    return () => {
      window.removeEventListener('click', unlockAudioAndPlayPending);
      window.removeEventListener('keydown', unlockAudioAndPlayPending);
      window.removeEventListener('touchstart', unlockAudioAndPlayPending);
    };
  }, [pendingAudioUrl]); // Rerun this effect if a pending URL is set

  const playSpeech = async (audioUrl) => {
    if (!audioUrl) {
      console.error("No audio URL provided.");
      return;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    audio.onended = () => {
      setIsSpeaking(false);
      audioRef.current = null;
    };
    
    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      setIsSpeaking(false);
      audioRef.current = null;
    };

    try {
      await audio.play();
      // --- IMPORTANT FIX: Only set isSpeaking to true AFTER play() succeeds ---
      setIsSpeaking(true);
    } catch (error) {
      // Check if the error is the specific autoplay block error
      if (error.name === 'NotAllowedError') {
        console.warn('Playback blocked by browser. It will start after the first user interaction.');
        // --- NEW: Store the URL to be played later ---
        setPendingAudioUrl(audioUrl);
      } else {
        console.error("Error playing speech:", error);
      }
      // Do NOT set isSpeaking(true) if it fails
      setIsSpeaking(false);
    }
  };

  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // If user stops a pending audio, clear it as well
    if (pendingAudioUrl) {
      setPendingAudioUrl(null);
    }
    setIsSpeaking(false);
  };

  return { playSpeech, stopSpeech, isSpeaking };
}