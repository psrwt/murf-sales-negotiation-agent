import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Marketplace } from './components/Marketplace';
import { DealCard } from './components/DealCard';

import { LeftsideBar } from './Components/LeftsideBar';
import { RightsideBar } from './Components/RightsideBar';

import { useTextToSpeech } from './hooks/useTextToSpeech';
import { Menu, X, ShoppingCart, MessageCircle } from 'lucide-react';

const FASTAPI_URL = ' http://negotia-server.vercel.app/chat';
const WELCOME_AUDIO_URL = "https://murf.ai/user-upload/one-day-temp/4c83bd8b-01fe-480f-afe9-9a4e82314d09.wav?response-cache-control=max-age%3D604801&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250830T000000Z&X-Amz-SignedHeaders=host&X-Amz-Expires=259200&X-Amz-Credential=AKIA27M5532DYKBCJICE%2F20250830%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=9c4fbbd8bc0919063388d0fc628e234de2b14f7b829d9bc912d6894ef2a49c40";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState('marketplace');

  const { playSpeech, stopSpeech, isSpeaking } = useTextToSpeech();

  useEffect(() => {
    const handleUserInteraction = () => {
      if (WELCOME_AUDIO_URL)
        playSpeech(WELCOME_AUDIO_URL)
          .then(() => console.log('Audio started'))
          .catch(err => console.error('Audio play failed:', err));
      window.removeEventListener('click', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction);

    return () => window.removeEventListener('click', handleUserInteraction);
  }, []);



  const handleSendMessage = async (message) => {
    stopSpeech();
    setIsLoading(true);
    if (window.innerWidth < 768) {
      setMobileView('chat');
    }
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

      if (result.audio_url) playSpeech(result.audio_url);
      if (result.products && result.products.length > 0) {
        setProducts(result.products);
        setActivePage('marketplace');
        if (window.innerWidth < 768) {
          setMobileView('marketplace');
        }
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
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleCompare = () => {
    const productsToCompare = products.filter(p => p.ID && selectedProducts.includes(p.ID));
    const productNames = productsToCompare.map(p => `${p['Model Name']} (${p.Capacity}GB)`).join(' vs ');
    const comparisonMessage = `Can you compare these products for me: ${productNames}?`;
    handleSendMessage(comparisonMessage);
  };

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 20 },
  };
  const pageTransition = { type: 'tween', ease: 'anticipate', duration: 0.5 };

  const mobileViewVariants = {
    enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
  };
  const swipeDirection = mobileView === 'marketplace' ? -1 : 1;

  const renderActivePageComponent = (isMobile = false) => {
    switch (activePage) {
      case 'marketplace':
        return (
          <Marketplace
            products={products}
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            onCompare={handleCompare}
            isMobile={isMobile}
          />
        );
      case 'deals':
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 hidden md:block">Active Deals</h2>
            {deal ? <DealCard deal={deal} /> : <p className="text-gray-500 pt-10">No active deals right now.</p>}
          </div>
        );
      case 'history':
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 hidden md:block">Full Conversation</h2>
            <p className="text-gray-500 pt-10">Chat history is visible on the right sidebar.</p>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <LeftSidebar
        activePage={activePage}
        onPageChange={(page) => {
          setActivePage(page);
          setIsMobileMenuOpen(false);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <button
          className="md:hidden p-2 absolute top-4 left-4 z-40 text-gray-600 bg-white/70 backdrop-blur-sm rounded-full"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* --- Main Content for Desktop --- */}
        <main className="hidden md:block flex-1 p-6 overflow-y-auto bg-gray-50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              {renderActivePageComponent(false)}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* --- Right Sidebar for Desktop --- */}
        <div className="hidden md:block">
          <RightSidebar history={history} onSendMessage={handleSendMessage} isLoading={isLoading} isSpeaking={isSpeaking} onStopSpeech={stopSpeech} />
        </div>

        {/* --- Mobile View Container --- */}
        <div className="flex-1 md:hidden overflow-hidden relative">
          <AnimatePresence initial={false} custom={swipeDirection}>
            {mobileView === 'marketplace' && (
              <motion.main
                key="marketplace"
                custom={swipeDirection}
                variants={mobileViewVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="p-4 pt-6 pb-20 overflow-y-auto bg-gray-50 h-full"
              >
                {renderActivePageComponent(true)}
              </motion.main>
            )}

            {mobileView === 'chat' && (
              <motion.div
                key="chat"
                custom={swipeDirection}
                variants={mobileViewVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="h-full"
              >
                <RightSidebar history={history} onSendMessage={handleSendMessage} isLoading={isLoading} isSpeaking={isSpeaking} onStopSpeech={stopSpeech} isMobileView={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- Mobile Bottom Navigation --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-20">
        <button onClick={() => setMobileView('marketplace')} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${mobileView === 'marketplace' ? 'text-indigo-600' : 'text-gray-500'}`}>
          <ShoppingCart size={20} />
          <span className="text-xs font-medium">Marketplace</span>
        </button>
        <button onClick={() => setMobileView('chat')} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${mobileView === 'chat' ? 'text-indigo-600' : 'text-gray-500'}`}>
          <MessageCircle size={20} />
          <span className="text-xs font-medium">Assistant</span>
        </button>
      </nav>
    </div>
  );
}

export default App;