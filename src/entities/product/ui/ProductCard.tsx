import React from 'react';
import Image from 'next/image';
import { Product } from '../model/types';
import { Button } from '@/src/shared/ui/button';

interface ProductCardProps {
  product: Product;
  onRentClick?: (product: Product) => void;
}

export function ProductCard({ product, onRentClick }: ProductCardProps) {
  // Format price like mockup: "от 5 000 ₸ / сутки"
  const formattedPrice = new Intl.NumberFormat('ru-RU').format(product.price);

  return (
    <article className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 overflow-hidden h-full border border-gray-100">
      <div className="relative w-full aspect-[4/3] mb-6 flex items-center justify-center">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className="flex flex-col flex-grow items-center justify-end text-center mt-auto align-bottom">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-dark inline">{product.name}</h3>
          <span className="text-gray-500 text-sm ml-2">
            от <span className="font-semibold text-dark">{formattedPrice} ₸</span> / сутки
          </span>
        </div>
        <Button 
          variant="primary" 
          className="w-full font-bold shadow-sm hover:shadow"
          onClick={() => onRentClick?.(product)}
        >
          Арендовать
        </Button>
      </div>
    </article>
  );
}
