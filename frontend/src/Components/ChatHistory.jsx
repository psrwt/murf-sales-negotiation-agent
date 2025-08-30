import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';

export function ChatHistory({ history, isLoading }) {
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 flex flex-col">
            {history.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && <ChatMessage message={{ role: 'assistant' }} isLoading={true} />}
            <div ref={endOfMessagesRef} />
        </div>
    );
}