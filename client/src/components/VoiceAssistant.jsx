import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceAssistant = ({ onSpeechToText, lastAssistantMessage, isLoading }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAutoSpeakEnabled, setIsAutoSpeakEnabled] = useState(false);
  const [supported, setSupported] = useState({ speech: false, synthesis: false });
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasSpeech = !!SpeechRecognition;
    const hasSynthesis = !!window.speechSynthesis;
    
    setSupported({ speech: hasSpeech, synthesis: hasSynthesis });

    if (hasSpeech) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onSpeechToText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [onSpeechToText]);

  // Handle Auto-speak when a new assistant message arrives
  useEffect(() => {
    if (isAutoSpeakEnabled && lastAssistantMessage && !isLoading) {
      speak(lastAssistantMessage);
    }
  }, [lastAssistantMessage, isLoading, isAutoSpeakEnabled]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (synthRef.current.speaking) synthRef.current.cancel();
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speak = (text) => {
    if (!supported.synthesis) return;

    // Clean markdown/special chars from text for better speech
    const cleanText = text
      .replace(/[#*`_~]/g, '') // Remove markdown
      .replace(/\[\d+\]/g, '') // Remove citations [1], [2]
      .replace(/https?:\/\/\S+/g, 'link'); // Replace URLs with 'link'

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const toggleAutoSpeak = () => {
    setIsAutoSpeakEnabled(!isAutoSpeakEnabled);
    if (isAutoSpeakEnabled && synthRef.current.speaking) {
      stopSpeaking();
    }
  };

  if (!supported.speech) return null;

  return (
    <div className="voice-assistant-controls">
      <motion.button
        className={`voice-btn ${isListening ? 'active listening' : ''}`}
        onClick={toggleListening}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={isListening ? "Stop Listening" : "Start Voice Command"}
      >
        {isListening ? <Loader2 className="animate-spin" size={20} /> : <Mic size={20} />}
        {isListening && (
          <motion.div 
            className="mic-pulse"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.button>
    </div>
  );
};


export default VoiceAssistant;
