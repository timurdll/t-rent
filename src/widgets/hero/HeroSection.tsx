import React from 'react';
import { Section } from '@/src/shared/ui/section';
import { Typography } from '@/src/shared/ui/typography';
import { Button } from '@/src/shared/ui/button';
import { WhatsAppIcon } from '@/src/shared/ui/icons/WhatsAppIcon';
import { EquipmentModel } from '@/src/entities/equipment/ui/EquipmentModel';
import laptop from '@/public/images/hero/laptop.png';
import printer from '@/public/images/hero/printer.png';
import tablet from '@/public/images/hero/tablet.png';

interface HeroSectionProps {
  onRentClick: () => void;
  whatsappHref: string;
}

export function HeroSection({ onRentClick, whatsappHref }: HeroSectionProps) {
  return (
    <Section bg="dark" className="relative pt-12 pb-24 md:pt-20 md:pb-48 flex items-center min-h-[650px] lg:h-[85vh] overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-dark via-dark/80 to-transparent w-full md:w-1/2"></div>

      <div className="container relative z-10 w-full flex flex-col md:flex-row items-center">

        {/* Left Side: Content */}
        <div className="flex-1 text-center md:text-left z-20 max-w-2xl">
          <Typography variant="h1" className="leading-tight mb-9">
            Аренда техники<br />
            <span className="text-white">для бизнеса и мероприятий</span>
          </Typography>
          <p className="text-gray-400 text-lg md:text-xl font-light mb-14 max-w-lg leading-relaxed">
            Ноутбуки и принтеры премиального класса в аренду
            с доставкой по всему Казахстану.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 md:gap-7 justify-center md:justify-start">
            <Button
              size="lg"
              onClick={onRentClick}
              className="font-bold w-full sm:w-auto h-16 px-12 text-lg shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
            >
              Арендовать
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-700 text-white hover:bg-white/5 font-bold w-full sm:w-auto h-16 px-12 gap-3"
              onClick={() => window.open(whatsappHref, "_blank", "noopener,noreferrer")}
            >
              <WhatsAppIcon size={20} color="#25D366" />
              Написать в WhatsApp
            </Button>
          </div>
        </div>

        {/* Right Side: Absolute Floating Equipment Group */}
        <div className="hidden md:block absolute right-[-3.5rem] lg:right-[-1.5rem] top-[46%] -translate-y-1/2 w-[520px] lg:w-[640px] h-[380px] lg:h-[470px] z-10">
          <div className="relative w-full h-full">

            {/* Printer (Deepest / Bottom-Left) */}
            <EquipmentModel
              src={printer.src}
              alt="Printer"
              width={380}
              height={380}
              className="bottom-[-2%] left-[0%] z-10 w-[46%] opacity-95 animate-float-2 rotate-[2deg]"
              imageClassName="[filter:drop-shadow(0_16px_34px_rgba(0,0,0,0.55))_drop-shadow(0_0_6px_rgba(255,197,26,0.22))]"
            />

            {/* Tablet (Middle / Upper / Behind Laptop Corner) */}
            <EquipmentModel
              src={tablet.src}
              alt="Tablet"
              width={420}
              height={420}
              className="top-[0%] left-[20%] z-20 w-[40%] animate-float-3 rotate-[-8deg]"
              imageClassName="[filter:drop-shadow(0_14px_30px_rgba(0,0,0,0.5))_drop-shadow(0_0_6px_rgba(255,197,26,0.18))]"
            />

            {/* Laptop (Foreground / Main) */}
            <EquipmentModel
              src={laptop.src}
              alt="Laptop"
              width={700}
              height={700}
              className="top-[56%] left-[60%] -translate-x-1/2 -translate-y-1/2 z-30 w-[88%] lg:w-[94%] animate-float-1"
              imageClassName="[filter:drop-shadow(0_22px_44px_rgba(0,0,0,0.6))_drop-shadow(0_0_7px_rgba(255,197,26,0.22))]"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
