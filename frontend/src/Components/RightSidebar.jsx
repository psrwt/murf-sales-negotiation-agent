import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { Square } from 'lucide-react';

export function RightSidebar({ history, onSendMessage, isLoading, isSpeaking, onStopSpeech }) {
    return (
        <aside className="w-full lg:w-[400px] flex-shrink-0 bg-white p-4 flex flex-col h-full border-l border-gray-200">
            <ChatHistory history={history} isLoading={isLoading} />
            
            
            <div>
                {isSpeaking && (
                    <div className="flex justify-center items-center gap-3 mb-3">
                        
                        <img 
                            src="/audio.gif" 
                            alt="Audio playing indicator"
                            className="h-6 w-auto" 
                        />

                        
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

                
                <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
            </div>
        </aside>
    );
}
