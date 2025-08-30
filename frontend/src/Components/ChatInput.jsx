import { useState, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';

export function ChatInput({ onSendMessage, disabled }) {
    const [input, setInput] = useState('');
    const { 
        isListening, 
        transcript, 
        startListening, 
        stopListening, 
        resetTranscript, // <-- GET THE NEW FUNCTION
        isSpeechRecognitionSupported 
    } = useSpeechToText();

    useEffect(() => {
        // This effect still handles updating the input from speech
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSendMessage(input.trim());
            setInput('');
            resetTranscript(); // <-- ADD THIS: Reset transcript after sending
        }
    };

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // --- NEW HANDLER FOR THE INPUT FIELD ---
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInput(newValue);
        // If the user clears the input manually, reset the hook's transcript
        if (newValue === '') {
            resetTranscript();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-200">
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange} // <-- USE THE NEW HANDLER
                    placeholder={isListening ? "Listening..." : (disabled ? "Waiting for response..." : "Find me a product...")}
                    className="bg-gray-100 w-full py-3 pl-5 pr-20 text-sm text-gray-800 placeholder-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent"
                    disabled={disabled}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {isSpeechRecognitionSupported && (
                        <button
                            type="button"
                            onClick={handleMicClick}
                            className={`p-2 rounded-full transition-colors text-gray-600 hover:bg-gray-200 ${isListening ? 'text-red-500' : ''}`}
                            disabled={disabled}
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                    )}
                    <button
                        type="submit"
                        className="ml-1 p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 transition text-white disabled:bg-indigo-300"
                        disabled={disabled || !input.trim()}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </form>
    );
}