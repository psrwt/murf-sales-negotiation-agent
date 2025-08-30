import { Home, Tag, MessageSquare, ChevronLeft, Package } from 'lucide-react';

const NavLink = ({ icon, text, active, onClick }) => (
    <a href="#" onClick={onClick} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${active ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
        {icon}
        <span className={`nav-text ${isCollapsed ? 'hidden' : 'block'}`}>{text}</span>
    </a>
);

// We pass isCollapsed to NavLink to hide text correctly.
export function LeftSidebar({ activePage, onPageChange, isCollapsed, onToggleCollapse }) {
    return (
        <aside className={`flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 p-4 flex flex-col justify-between h-full transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div>
                <div className={`flex items-center mb-2 px-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <div className="logo-container flex items-center gap-2">
                        <Package className="text-white flex-shrink-0" />
                        <h1 className={`logo-text text-lg font-bold text-white ${isCollapsed ? 'hidden' : 'block'}`}>Agentive</h1>
                    </div>
                    <button onClick={onToggleCollapse} className={`p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
                        <ChevronLeft size={20} />
                    </button>
                </div>
                <nav className="flex flex-col gap-1.5 px-1 mt-4">
                    <a href="#" onClick={() => onPageChange('marketplace')} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${activePage === 'marketplace' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                        <Home size={18} />
                        <span className={`nav-text ${isCollapsed ? 'hidden' : 'block'}`}>Marketplace</span>
                    </a>
                    <a href="#" onClick={() => onPageChange('deals')} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${activePage === 'deals' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                        <Tag size={18} />
                        <span className={`nav-text ${isCollapsed ? 'hidden' : 'block'}`}>Deals</span>
                    </a>
                    <a href="#" onClick={() => onPageChange('history')} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${activePage === 'history' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                        <MessageSquare size={18} />
                        <span className={`nav-text ${isCollapsed ? 'hidden' : 'block'}`}>Chat History</span>
                    </a>
                </nav>
            </div>

            {/* === ADDED THIS SECTION BACK IN === */}
            <div className={`border-t border-gray-700 pt-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
                 <a href="#" className="user-profile flex items-center gap-2.5 p-1 rounded-md hover:bg-gray-700">
                    <img src="https://placehold.co/32x32/e0e7ff/4338ca?text=A" alt="User Avatar" className="w-8 h-8 rounded-full flex-shrink-0"/>
                    <div className={`user-info ${isCollapsed ? 'hidden' : 'block'}`}>
                        <p className="font-semibold text-xs text-white">Alex Doe</p>
                        <p className="text-[10px] text-gray-400">alex.doe@example.com</p>
                    </div>
                </a>
            </div>
            {/* === END OF ADDED SECTION === */}

        </aside>
    );
}