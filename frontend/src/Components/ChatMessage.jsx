import { marked } from 'marked';

// A loading indicator component
const Loader = () => (
    <div className="loader">
        <span />
        <span />
        <span />
    </div>
);

export function ChatMessage({ message, isLoading }) {
    const isAgent = message.role === 'assistant';

    const renderContent = () => {
        if (isLoading) {
            return <Loader />;
        }
        if (isAgent) {
            return <div className="message-text" dangerouslySetInnerHTML={{ __html: marked.parse(message.content) }} />;
        }
        return <p>{message.content}</p>;
    };

    return (
        // FIXED: Increased max-width for better readability of longer messages
        <div className={`max-w-lg text-sm rounded-lg p-3 break-words ${isAgent ? 'bg-gray-200 self-start' : 'bg-gray-800 text-white self-end'}`}>
            {isAgent && !isLoading && <p className="font-semibold text-gray-800 mb-1">Agent</p>}
            {renderContent()}
        </div>
    );
}