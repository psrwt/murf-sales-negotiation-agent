import { useState, useEffect } from 'react';

export function DealCard({ deal }) {
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        if (timeLeft === 0) return;

        const timerId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearInterval(timerId); // Cleanup on unmount
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const product = deal.products_involved[0];
    const originalPrice = product["Max Price"] || 0;
    const imageUrl = product.image_url || `https://placehold.co/80x80/e0e7ff/4338ca?text=Img`;

    const isExpired = timeLeft === 0;

    return (
        <div className="border border-gray-200 p-4 rounded-lg shadow-md bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-800">{deal.heading}</h3>
                <div className={`text-sm font-medium px-2 py-1 rounded-md ${isExpired ? 'bg-gray-200 text-gray-600' : 'bg-red-100 text-red-700'}`}>
                    {isExpired ? 'Expired' : formatTime(timeLeft)}
                </div>
            </div>
            <div className="mt-4 flex items-center">
                <div className="w-20 h-20 flex-shrink-0 bg-white rounded-md flex items-center justify-center mr-4 border">
                    <img src={imageUrl} alt={product["Model Name"]} className="max-w-full max-h-full object-contain" />
                </div>
                <div>
                    <p className="font-semibold">{product["Model Name"]} ({product.Capacity}GB)</p>
                    <p className="text-sm text-gray-600">
                        <span className="line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
                        <span className="font-bold text-green-600 ml-2">₹{deal.deal_price.toLocaleString('en-IN')}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}