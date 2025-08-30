import { useState, useEffect } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './Components/RightSidebar';
import { Marketplace } from './components/Marketplace';
import { DealCard } from './components/DealCard';
import { useTextToSpeech } from './hooks/useTextToSpeech';

const FASTAPI_URL = 'http://127.0.0.1:8000/chat';


const WELCOME_AUDIO_URL = "https://murf.ai/user-upload/one-day-temp/4c83bd8b-01fe-480f-afe9-9a4e82314d09.wav?response-cache-control=max-age%3D604801&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250830T000000Z&X-Amz-SignedHeaders=host&X-Amz-Expires=259200&X-Amz-Credential=AKIA27M5532DYKBCJICE%2F20250830%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=9c4fbbd8bc0919063388d0fc628e234de2b14f7b829d9bc912d6894ef2a49c40"; // <-- REPLACE THIS

function App() {
  const [history, setHistory] = useState([
    { role: 'assistant', content: "Hello! What are you looking for today? I can help you find products and negotiate prices." }
  ]);
  const [products, setProducts] = useState([]);
  const [deal, setDeal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activePage, setActivePage] = useState('marketplace');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { playSpeech, stopSpeech, isSpeaking } = useTextToSpeech();

  
  useEffect(() => {
    // This effect runs only once when the component first loads.
    // NOTE: Due to browser autoplay policies, the audio might not play
    // until the user clicks anywhere on the page for the first time.
    if (WELCOME_AUDIO_URL) {
      playSpeech(WELCOME_AUDIO_URL);
    }
  }, []);


  const handleSendMessage = async (message) => {
    stopSpeech();
    setIsLoading(true);
    const newHistory = [...history, { role: 'user', content: message }];
    setHistory(newHistory);

    try {
      const response = await fetch(FASTAPI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_message: message,
          history: history.map(h => ({ role: h.role, content: h.content }))
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();

      setHistory([...newHistory, { role: 'assistant', content: result.text }]);
      
      if (result.audio_url) {
        playSpeech(result.audio_url);
      }

      if (result.products && result.products.length > 0) {
        setProducts(result.products);
        setActivePage('marketplace');
      }
      if (result.special_deal) {
        setDeal(result.special_deal);
        setActivePage('deals');
      }
    } catch (error) {
      console.error("Error calling FastAPI:", error);
      setHistory([...newHistory, { role: 'assistant', content: "Sorry, an error occurred while fetching the response." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCompare = () => {
    const productsToCompare = products.filter(p => p.ID && selectedProducts.includes(p.ID));
    const productNames = productsToCompare.map(p => `${p['Model Name']} (${p.Capacity}GB)`).join(' vs ');
    const comparisonMessage = `Can you compare these products for me: ${productNames}?`;
    handleSendMessage(comparisonMessage);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <LeftSidebar
        activePage={activePage}
        onPageChange={setActivePage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex-1 flex flex-row overflow-hidden">
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {activePage === 'marketplace' && (
            <Marketplace
              products={products}
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              onCompare={handleCompare}
            />
          )}
          {activePage === 'deals' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Active Deals</h2>
              {deal ? <DealCard deal={deal} /> : <p className="text-gray-500">No active deals right now. Ask the agent for one!</p>}
            </div>
          )}
          {activePage === 'history' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Full Conversation</h2>
              <p className="text-gray-500">Chat history is visible on the right sidebar.</p>
            </div>
          )}
        </main>

        <RightSidebar 
            history={history} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
            isSpeaking={isSpeaking}
            onStopSpeech={stopSpeech} 
        />
      </div>
    </div>
  );
}

export default App;