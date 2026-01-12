import { ProductCard } from './ProductCard';
import { Package } from 'lucide-react';
import { motion } from 'framer-motion';

export function Marketplace({ products, selectedProducts, onSelectProduct, onCompare, isMobile = false }) {
    const showCompareButton = selectedProducts.length > 1;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                
                {!isMobile && <h2 className="text-xl font-semibold text-gray-800">Marketplace</h2>}
                
                {showCompareButton && (
                    <motion.button
                        onClick={onCompare}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition w-full sm:w-auto"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        Compare Selected ({selectedProducts.length})
                    </motion.button>
                )}
            </div>

            {products.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-16">
                    <Package size={64} strokeWidth={1} className="text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Welcome to marketplace</h2>
                    <p className="mt-2 text-gray-500">Your AI-powered shopping assistant. Ask for a product to get started!</p>
                </div>
            ) : (
                <motion.div
                    className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {products.map(p => (
                        <ProductCard
                            key={p.ID}
                            product={p}
                            isSelected={selectedProducts.includes(p.ID)}
                            onSelect={onSelectProduct}
                        />
                    ))}
                </motion.div>
            )}
        </div>
    );
}