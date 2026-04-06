import React from 'react';
import { Section } from '@/src/shared/ui/section';
import { Typography } from '@/src/shared/ui/typography';
import { ProductCard, Product } from '@/src/entities/product';

interface CatalogSectionProps {
  onRentClick: (product: Product) => void;
  products: Product[];
}

export function CatalogSection({ onRentClick, products }: CatalogSectionProps) {
  return (
    <Section id="catalog" bg="gray">
      <Typography variant="h2" className="text-dark">Каталог техники</Typography>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onRentClick={onRentClick} 
          />
        ))}
      </div>
    </Section>
  );
}
