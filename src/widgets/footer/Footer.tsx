"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Typography } from '@/src/shared/ui/typography';
import { Phone, MapPin } from 'lucide-react';
import { Button } from '@/src/shared/ui/button';
import { Logo } from '@/src/shared/ui/logo';
import { WhatsAppIcon } from '@/src/shared/ui/icons/WhatsAppIcon';
import { fadeInUp, transition } from '@/src/shared/lib/animations';

interface FooterProps {
  phone: string;
  phoneHref: string;
  whatsappHref: string;
}

export function Footer({ phone, phoneHref, whatsappHref }: FooterProps) {
  const [location, setLocation] = React.useState("Астана");

  React.useEffect(() => {
    async function getGeoLocation() {
      try {
        const response = await fetch("/api/location");
        const data = await response.json();
        
        if (data && data.city) {
          setLocation(data.city);
        }
      } catch (error) {
        console.error("Local location fetch failed:", error);
      }
    }
    
    getGeoLocation();
  }, []);

  return (
    <footer id="contacts" className="bg-gray-50 border-t border-gray-200 py-16 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           transition={transition}
        >
          <Typography variant="h2" className="text-dark mb-10">Контакты</Typography>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...transition, delay: 0.2 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row gap-6 lg:gap-12 w-full md:w-auto">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="primary"
                className="font-bold py-6 px-6 sm:w-auto w-full gap-2 text-white bg-[#25D366] hover:bg-[#20BE5C] shadow-lg shadow-green-200"
                onClick={() => window.open(whatsappHref, "_blank", "noopener,noreferrer")}
              >
                <WhatsAppIcon size={24} color="white" />
                Написать в WhatsApp
              </Button>
            </motion.div>
            
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-dark" />
              <a href={phoneHref} className="font-bold text-lg text-dark hover:text-primary transition-colors">
                {phone}
              </a>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-dark" />
              <span className="font-bold text-lg text-dark">{location}</span>
            </div>
          </div>
          
          <div className="hidden lg:block opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
             <Logo />
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
