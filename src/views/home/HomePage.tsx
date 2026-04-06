"use client";

import React, { useState } from 'react';
import { Header } from '@/src/widgets/header';
import { HeroSection } from '@/src/widgets/hero';
import { CatalogSection } from '@/src/widgets/catalog';
import { HowItWorksSection } from '@/src/widgets/how-it-works';
import { AdvantagesSection } from '@/src/widgets/advantages';
import { CtaSection } from '@/src/widgets/cta';
import { Footer } from '@/src/widgets/footer';
import { ApplicationModal } from '@/src/features/application';
import { Product } from '@/src/entities/product';

type AppConfig = {
  phone: string;
  phoneHref: string;
  whatsappPhone: string;
  whatsappText: string;
};

function onlyDigits(input: string): string {
  return (input ?? '').replace(/\D/g, '');
}

export function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);

  const handleRentClick = (product?: Product) => {
    setSelectedProduct(product?.name);
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    const load = async () => {
      const [cfgRes, prodRes] = await Promise.all([
        fetch('/api/public/config'),
        fetch('/api/public/products'),
      ]);
      if (cfgRes.ok) setConfig((await cfgRes.json()) as AppConfig);
      if (prodRes.ok) setProducts((await prodRes.json()) as Product[]);
    };
    load().catch(() => null);
  }, []);

  const whatsappPhone = onlyDigits(config?.whatsappPhone ?? '77771234567');
  const whatsappText = config?.whatsappText ?? "Здравствуйте!\n\nПишу с сайта T Rent.\n\n";
  const whatsappHref =
    `https://api.whatsapp.com/send/?phone=${encodeURIComponent(whatsappPhone)}&text=${encodeURIComponent(
      whatsappText
    )}&type=phone_number&app_absent=0`;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header phone={config?.phone ?? '+7 777 123 45 67'} phoneHref={config?.phoneHref ?? 'tel:+77771234567'} />
      <main className="flex-1">
        <HeroSection onRentClick={() => handleRentClick()} whatsappHref={whatsappHref} />
        <CatalogSection onRentClick={handleRentClick} products={products} />
        <HowItWorksSection />
        <AdvantagesSection />
        <CtaSection onRentClick={() => handleRentClick()} />
      </main>
      <Footer
        phone={config?.phone ?? '+7 777 123 45 67'}
        phoneHref={config?.phoneHref ?? 'tel:+77771234567'}
        whatsappHref={whatsappHref}
      />
      
      <ApplicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productName={selectedProduct}
      />
    </div>
  );
}
