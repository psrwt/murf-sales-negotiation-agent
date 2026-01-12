import { useState } from 'react';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { Square, Globe } from 'lucide-react';

const LANGUAGE_OPTIONS = [
  { code: 'en-US', name: 'English', voiceId: 'en-US-natalie' },
  { code: 'en-UK', name: 'English (UK)', voiceId: 'en-UK-theo' },
  { code: 'es-ES', name: 'Spanish', voiceId: 'es-ES-elvira' },
  { code: 'fr-FR', name: 'French', voiceId: 'fr-FR-raphael' },
  { code: 'de-DE', name: 'German', voiceId: 'de-DE-matthias' },
  { code: 'it-IT', name: 'Italian', voiceId: 'it-IT-lucia' },
  { code: 'pt-BR', name: 'Portuguese', voiceId: 'pt-BR-heitor' },
  { code: 'ja-JP', name: 'Japanese', voiceId: 'ja-JP-kenji' },
  { code: 'ko-KR', name: 'Korean', voiceId: 'ko-KR-gyeong' },
  { code: 'zh-CN', name: 'Chinese', voiceId: 'zh-CN-tao' },
  { code: 'hi-IN', name: 'Hindi', voiceId: 'hi-IN-kabir' },
  { code: 'ta-IN', name: 'Tamil', voiceId: 'ta-IN-iniya' },
  { code: 'bn-IN', name: 'Bengali', voiceId: 'bn-IN-anwesha' },
  { code: 'pl-PL', name: 'Polish', voiceId: 'pl-PL-jacek' },
  { code: 'ar-SA', name: 'Arabic', voiceId: 'ar-SA-hamed' },
];

export function RightsideBar({ history, onSendMessage, isLoading, isSpeaking, onStopSpeech, isMobileView = false }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  const handleSendMessage = (message) => {
    const languageObj = LANGUAGE_OPTIONS.find(lang => lang.code === selectedLanguage);
    onSendMessage(message, selectedLanguage, languageObj?.voiceId);
  };

  return (
    <aside className={`w-full lg:w-[400px] flex-shrink-0 bg-white flex flex-col border-l border-gray-200 ${isMobileView ? 'h-fill-available pb-20 p-4' : 'h-full p-4'}`}>
      <div className={`flex items-center mb-4 ${isMobileView ? 'justify-end' : 'justify-between'}`}>
        
        {!isMobileView && <h2 className="text-lg font-semibold text-gray-800">Sales Agent</h2>}
        
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      </div>

      <ChatHistory history={history} isLoading={isLoading} />

      <div>
        {isSpeaking && (
          <div className="flex justify-center items-center gap-3 mb-3">
            <img src="/audio.gif" alt="Audio playing indicator" className="h-6 w-auto" />
            <button
              onClick={onStopSpeech}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500"
              aria-label="Stop speech"
            >
              <Square size={12} fill="white" />
              <span className="animate-pulse">Stop</span>
            </button>
          </div>
        )}

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          selectedLanguage={selectedLanguage}
        />
      </div>
    </aside>
  );
}


function LanguageSelector({ selectedLanguage, onLanguageChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLang = LANGUAGE_OPTIONS.find(lang => lang.code === selectedLanguage) || LANGUAGE_OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
      >
        <Globe size={16} />
        <span>{selectedLang.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-60 py-2 bg-white rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${selectedLanguage === lang.code
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
                title={`Voice: ${lang.voiceId}`}
              >
                <div>{lang.name}</div>
                <div className="text-xs text-gray-500">{lang.code}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}