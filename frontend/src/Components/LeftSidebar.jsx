import { Home, Tag, MessageSquare, ChevronLeft, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NavLink = ({ icon, text, active, onClick, isCollapsed }) => (
    <a href="#" onClick={onClick} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${active ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
        {icon}
        <AnimatePresence>
            {!isCollapsed && (
                <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap"
                >
                    {text}
                </motion.span>
            )}
        </AnimatePresence>
    </a>
);

export function LeftsideBar({ activePage, onPageChange, isCollapsed, onToggleCollapse, isMobileMenuOpen }) {
    const sidebarVariants = {
        collapsed: { width: '80px' },
        expanded: { width: '256px' },
    };

    return (
        <motion.aside
            initial={false}
            animate={isCollapsed ? 'collapsed' : 'expanded'}
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`fixed md:relative inset-y-0 left-0 z-30 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 p-4 flex-col justify-between h-full transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex`}
        >
            <div>
                <div className={`flex items-center mb-2 px-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <div className="logo-container flex items-center gap-2">
                        <Package className="text-white flex-shrink-0" />
                        {!isCollapsed && <h1 className="logo-text text-lg font-bold text-white">Negotia</h1>}
                    </div>
                    <button onClick={onToggleCollapse} className={`p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''} hidden md:block`}>
                        <ChevronLeft size={20} />
                    </button>
                </div>
                <nav className="flex flex-col gap-1.5 px-1 mt-4">
                    <NavLink icon={<Home size={18} />} text="Marketplace" active={activePage === 'marketplace'} onClick={() => onPageChange('marketplace')} isCollapsed={isCollapsed} />
                    <NavLink icon={<Tag size={18} />} text="Deals" active={activePage === 'deals'} onClick={() => onPageChange('deals')} isCollapsed={isCollapsed} />
                    <NavLink icon={<MessageSquare size={18} />} text="Chat History" active={activePage === 'history'} onClick={() => onPageChange('history')} isCollapsed={isCollapsed} />
                </nav>
            </div>

            <div className={`border-t border-gray-700 pt-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
                <a href="#" className="user-profile flex items-center gap-2.5 p-1 rounded-md hover:bg-gray-700">
                    <img src="https://placehold.co/32x32/e0e7ff/4338ca?text=A" alt="User Avatar" className="w-8 h-8 rounded-full flex-shrink-0" />
                    {!isCollapsed && (
                        <div className="user-info">
                            <p className="font-semibold text-xs text-white">Alex Doe</p>
                            <p className="text-[10px] text-gray-400">alex.doe@example.com</p>
                        </div>
                    )}
                </a>
            </div>
        </motion.aside>
    );
}