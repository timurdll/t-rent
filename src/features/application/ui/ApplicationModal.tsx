"use client";

import React, { useEffect, useRef, useState, useActionState } from 'react';
import { sendApplication } from '../action';
import { Button } from '@/src/shared/ui/button';
import { cn, formatPhoneNumber } from '@/src/shared/lib/utils';
import { X } from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

const initialState = {
  success: false,
  message: '',
};

export function ApplicationModal({ isOpen, onClose, productName }: ApplicationModalProps) {
  const [state, formAction, isPending] = useActionState(sendApplication, initialState);
  const [shouldRender, setRender] = useState(isOpen);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Астана");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => setRender(true));
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchCity = async () => {
        try {
          const res = await fetch("/api/location");
          const data = await res.json();
          if (data?.city) setCity(data.city);
        } catch (e) {
          console.error("Failed to fetch city for modal", e);
        }
      };
      fetchCity();
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
      setPhone("");
      // Auto close after 3 seconds on success
      const timer = setTimeout(() => {
        onClose();
        // optionally reset state
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, onClose]);

  if (!shouldRender) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onAnimationEnd={handleAnimationEnd}
    >
      <div 
        className={cn(
          "bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative transition-transform duration-300",
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-dark transition-colors"
          aria-label="Закрыть"
        >
          <X size={24} />
        </button>

        <h3 className="text-2xl font-bold mb-2">Оставить заявку</h3>
        <p className="text-gray-500 mb-6">Оставьте свои данные, и мы свяжемся с вами за 5 минут.</p>

        {state.success ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 text-center font-medium">
            {state.message}
          </div>
        ) : (
          <form ref={formRef} action={formAction} className="space-y-4">
            {state.message && (
              <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg">
                {state.message}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-1">Имя</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                placeholder="Иван Иванов"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold mb-1">Телефон</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={phone}
                onChange={handlePhoneChange}
                required 
                placeholder="+7 (700) 000-00-00"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            
            <input type="hidden" name="product" value={productName || "Общая заявка"} />
            <input type="hidden" name="city" value={city} />

            <div className="pt-2">
               <Button type="submit" className="w-full text-base py-6" disabled={isPending}>
                  {isPending ? "Отправка..." : "Оставить заявку"}
               </Button>
            </div>
            <p className="text-xs text-center text-gray-400 mt-4">
              Нажимая кнопку, вы соглашаетесь с условиями обработки данных.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
