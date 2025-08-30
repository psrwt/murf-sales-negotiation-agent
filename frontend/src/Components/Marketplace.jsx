import { ProductCard } from './ProductCard';
import { Package } from 'lucide-react';

export function Marketplace({ products, selectedProducts, onSelectProduct, onCompare }) {
    const showCompareButton = selectedProducts.length > 1;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Marketplace</h2>
                {showCompareButton && (
                    <button 
                        onClick={onCompare}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
                    >
                        Compare Selected ({selectedProducts.length})
                    </button>
                )}
            </div>

            {products.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <Package size={64} strokeWidth={1} className="text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Welcome to Agentive</h2>
                    <p className="mt-2 text-gray-500">Your AI-powered shopping assistant. Ask for a product to get started!</p>
                </div>
            ) : (
                <div className="w-full grid grid-cols-1 gap-6">
                    {products.map(p => (
                        <ProductCard 
                            key={p.ID} 
                            product={p} 
                            isSelected={selectedProducts.includes(p.ID)}
                            onSelect={onSelectProduct}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}