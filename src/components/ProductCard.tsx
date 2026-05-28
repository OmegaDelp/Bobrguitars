import React from 'react';
import { Product } from '../types';
import { Heart, ShoppingCart, Check, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  key?: any;
  product: Product;
  isFavorite: boolean;
  isInCart: boolean;
  onAddToCart: (e: React.MouseEvent) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export default function ProductCard({
  product,
  isFavorite,
  isInCart,
  onAddToCart,
  onToggleFavorite,
  onClick,
}: ProductCardProps) {
  const displayPrice = product.old_price || product.price;
  const originalPrice = product.old_price ? product.price : null;

  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-3.5 h-3.5 text-neutral-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-3.5 h-3.5 text-neutral-300" />);
      }
    }
    return stars;
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'acoustic': return 'Акустическая';
      case 'electric': return 'Электрогитара';
      case 'bass': return 'Бас-гитара';
      case 'ukulele': return 'Укулеле';
      case 'accessory': return 'Аксессуар';
      default: return cat;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -6 }}
      onClick={onClick}
      className="bg-white rounded-[26px] border border-neutral-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group"
    >
      {/* Product Image Section */}
      <div className={`h-52 relative flex items-center justify-center p-6 select-none ${product.image_class || 'bg-neutral-50'}`}>
        
        {/* Badges Info */}
        {product.badge && (
          <span className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full z-10 text-white ${
            product.badge === 'sale' ? 'bg-amber-500' : 'bg-emerald-500'
          }`}>
            {product.badge === 'sale' ? 'Скидка' : 'Новинка'}
          </span>
        )}

        {/* Favorite Button */}
        <button
          onClick={onToggleFavorite}
          className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-md bg-white border border-neutral-100 transition duration-200 z-10 hover:scale-110 active:scale-95 ${
            isFavorite ? 'text-red-500' : 'text-neutral-400 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Big Emoji Illustration */}
        <span className="text-[5.5rem] group-hover:scale-110 transition duration-300 drop-shadow-md select-none">
          {product.emoji}
        </span>
      </div>

      {/* Product Info Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category & Brand */}
        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest block mb-1">
          {getCategoryLabel(product.category)} • {product.brand}
        </span>

        {/* Title */}
        <h4 className="font-semibold text-neutral-800 text-sm group-hover:text-red-500 transition duration-200 line-clamp-2 leading-snug mb-2">
          {product.title}
        </h4>

        {/* Rating Row */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex items-center">{renderStars(product.rating)}</div>
          <span className="text-xs font-semibold text-neutral-800">{product.rating}</span>
          <span className="text-xs text-neutral-400">({product.reviews})</span>
        </div>

        {/* Bottom Price & Call To Action */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-neutral-50">
          <div className="flex flex-col">
            {originalPrice && (
              <span className="text-xs text-neutral-400 line-through mb-0.5">
                {originalPrice.toLocaleString()} ₽
              </span>
            )}
            <span className="text-lg font-bold text-neutral-900 tracking-tight">
              {displayPrice.toLocaleString()} ₽
            </span>
          </div>

          <button
            onClick={onAddToCart}
            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shrink-0 ${
              isInCart
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/10'
            }`}
          >
            {isInCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
