export function ProductCard({ product, isSelected, onSelect }) {
    const {
        "ID": id,
        "Model Name": modelName = 'Unnamed Product',
        "Company Name": companyName = 'N/A',
        "Capacity": capacity = '?',
        "Max Price": price = 0,
        image_url
    } = product;
    
    const imageUrl = image_url || `https://placehold.co/96x96/e0e7ff/4338ca?text=${modelName.charAt(0)}`;
    
    return (
        <div 
            className={`bg-white shadow-sm hover:shadow-md flex items-center p-4 rounded-lg transition-all duration-200 cursor-pointer border-2 ${isSelected ? 'border-gray-400 shadow-md' : 'border-transparent'}`}
            onClick={() => onSelect(id)}
        >
            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                <img src={imageUrl} alt={modelName} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-grow">
                <h3 className="font-semibold text-base text-gray-800">{modelName}</h3>
                <p className="text-sm text-gray-500">{companyName} - {capacity}GB</p>
                <p className="text-lg font-bold text-gray-900 mt-2">₹{price.toLocaleString('en-IN')}</p>
            </div>
        </div>
    );
}